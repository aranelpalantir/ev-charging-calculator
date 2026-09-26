// js/calculator.js - Şarj, Zaman ve Sadeleştirilmiş Fatura Maliyet Hesaplayıcı
import { VEHICLE_PRESETS } from './storage.js';

/**
 * Şarj süresi, başlama saati ve fatura maliyetini hesaplar.
 */
export function calculateCharging(state, referenceNow = new Date()) {
  const currentSoc = Math.min(100, Math.max(0, Number(state.currentSoc) || 0));
  const targetSoc = Math.min(100, Math.max(0, Number(state.targetSoc) || 100));
  const amperage = Math.max(1, Number(state.amperage) || 13);
  const voltage = Math.max(180, Number(state.voltage) || 220);
  const efficiency = Math.min(100, Math.max(50, Number(state.efficiency) || 88)) / 100;

  // Araç ve Batarya Bilgileri
  let capacity = 60.0;
  let consumptionWhPerKm = 155;
  let vehicleInfo = VEHICLE_PRESETS[state.vehicleModel];

  if (state.vehicleModel === 'custom') {
    capacity = Number(state.customCapacity) || 60.0;
    consumptionWhPerKm = 160;
  } else if (vehicleInfo) {
    capacity = vehicleInfo.capacity;
    consumptionWhPerKm = vehicleInfo.consumption || 155;
  }

  // Net Enerji (kWh)
  const deltaSoc = Math.max(0, targetSoc - currentSoc);
  const neededBatteryKwh = (capacity * deltaSoc) / 100;

  // Güç Değerleri (kW)
  const gridPowerKw = (voltage * amperage) / 1000;
  const batteryPowerKw = gridPowerKw * efficiency;

  // Şebekeden çekilecek toplam enerji (şarj kayıpları dahil)
  const totalGridKwh = neededBatteryKwh > 0 ? (neededBatteryKwh / efficiency) : 0;

  // Şarj Süresi
  let totalMinutes = 0;
  if (deltaSoc > 0 && batteryPowerKw > 0) {
    const hours = neededBatteryKwh / batteryPowerKw;
    totalMinutes = Math.round(hours * 60);
  }

  const durationHours = Math.floor(totalMinutes / 60);
  const durationRemainingMinutes = totalMinutes % 60;

  // Menzil (km/sa ve eklenen km)
  const kmPerKwh = 1000 / consumptionWhPerKm;
  const kmPerHour = batteryPowerKw * kmPerKwh;
  const addedKm = neededBatteryKwh * kmPerKwh;

  // Zaman Planı
  let startTime = new Date(referenceNow);
  let finishTime = new Date(referenceNow);
  let targetDepartureDate = null;
  let isOverdue = false;
  let earliestFinishIfStartNow = new Date(referenceNow.getTime() + totalMinutes * 60000);
  let overdueMinutes = 0;
  let recommendedAmpsForDeadline = null;

  if (state.calcMode === 'departure') {
    const [depHours, depMinutes] = (state.departureTime || '07:30').split(':').map(Number);
    targetDepartureDate = new Date(referenceNow);
    targetDepartureDate.setHours(depHours, depMinutes, 0, 0);

    if (targetDepartureDate.getTime() <= referenceNow.getTime()) {
      targetDepartureDate.setDate(targetDepartureDate.getDate() + 1);
    }

    startTime = new Date(targetDepartureDate.getTime() - totalMinutes * 60000);
    finishTime = new Date(targetDepartureDate);

    if (startTime.getTime() < referenceNow.getTime() && deltaSoc > 0) {
      isOverdue = true;
      overdueMinutes = Math.round((referenceNow.getTime() - startTime.getTime()) / 60000);
      const availableHours = (targetDepartureDate.getTime() - referenceNow.getTime()) / 3600000;
      if (availableHours > 0) {
        recommendedAmpsForDeadline = Math.ceil(
          (neededBatteryKwh / availableHours) / ((voltage * efficiency) / 1000)
        );
      }
    }
  } else {
    startTime = new Date(referenceNow);
    finishTime = new Date(referenceNow.getTime() + totalMinutes * 60000);
  }

  // Sadeleştirilmiş Fatura Maliyeti (Benzin kıyaslaması olmadan)
  const costAnalysis = calculateSimpleCost(totalGridKwh, consumptionWhPerKm, efficiency, state);

  return {
    currentSoc,
    targetSoc,
    deltaSoc,
    capacity,
    vehicleInfo,
    consumptionWhPerKm,
    amperage,
    voltage,
    efficiency: efficiency * 100,
    gridPowerKw,
    batteryPowerKw,
    neededBatteryKwh,
    totalGridKwh,
    totalMinutes,
    durationHours,
    durationMinutes: durationRemainingMinutes,
    kmPerHour,
    addedKm,
    startTime,
    finishTime,
    targetDepartureDate,
    isOverdue,
    overdueMinutes,
    earliestFinishIfStartNow,
    recommendedAmpsForDeadline,
    costAnalysis
  };
}

/**
 * Fatura maliyeti hesaplama (Net ve sade)
 */
function calculateSimpleCost(totalGridKwh, consumptionWhPerKm, efficiency, state) {
  let effectiveRate = 3.84;

  if (state.standardPriceMode === 'high-tier') {
    effectiveRate = Number(state.highTierRate) || 4.99;
  } else if (state.standardPriceMode === 'custom') {
    effectiveRate = Number(state.customRate) || 3.84;
  } else {
    effectiveRate = Number(state.standardRate) || 3.84;
  }

  const totalCost = totalGridKwh * effectiveRate;
  
  // 100 km sürüş maliyeti
  const kwhPer100Km = (consumptionWhPerKm * 100 / 1000) / efficiency;
  const costPer100Km = kwhPer100Km * effectiveRate;

  return {
    effectiveRate: Number(effectiveRate.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    costPer100Km: Number(costPer100Km.toFixed(1))
  };
}

/**
 * Türkçe tarih/saat formatlama
 */
export function formatFriendlyTime(date, referenceNow = new Date()) {
  if (!date || isNaN(date.getTime())) return { time: '--:--', dayLabel: '', fullText: '--:--' };

  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const refDay = new Date(referenceNow.getFullYear(), referenceNow.getMonth(), referenceNow.getDate());
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((targetDay - refDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { time: timeStr, dayLabel: 'Bugün', fullText: `Bugün saat ${timeStr}` };
  } else if (diffDays === 1) {
    return { time: timeStr, dayLabel: 'Yarın', fullText: `Yarın saat ${timeStr}` };
  } else if (diffDays === -1) {
    return { time: timeStr, dayLabel: 'Dün', fullText: `Dün saat ${timeStr}` };
  } else {
    const dateFormatted = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    return { time: timeStr, dayLabel: dateFormatted, fullText: `${dateFormatted} saat ${timeStr}` };
  }
}
