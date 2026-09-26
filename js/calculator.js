// js/calculator.js - Şarj, Zaman ve Fatura Maliyet Hesaplama Motoru
import { VEHICLE_PRESETS } from './storage.js';

/**
 * Verilen parametrelere göre şarj süresini, başlama saatini ve elektrik faturası maliyetlerini hesaplar.
 */
export function calculateCharging(state, referenceNow = new Date()) {
  const currentSoc = Math.min(100, Math.max(0, Number(state.currentSoc) || 0));
  const targetSoc = Math.min(100, Math.max(0, Number(state.targetSoc) || 100));
  const amperage = Math.max(1, Number(state.amperage) || 13);
  const voltage = Math.max(100, Number(state.voltage) || 230);
  const efficiency = Math.min(100, Math.max(50, Number(state.efficiency) || 88)) / 100;

  // Araç bilgileri ve Batarya kapasitesi (kWh)
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

  // Gereken net enerji (kWh)
  const deltaSoc = Math.max(0, targetSoc - currentSoc);
  const neededBatteryKwh = (capacity * deltaSoc) / 100;

  // Güç değerleri (kW)
  // Şebekeden çekilen güç (Prizden çıkan güç)
  const gridPowerKw = (voltage * amperage) / 1000;
  // Araç bataryasına giren efektif net güç
  const batteryPowerKw = gridPowerKw * efficiency;

  // Şebekeden çekilecek toplam enerji (şarj kayıpları dahil kWh)
  const totalGridKwh = neededBatteryKwh > 0 ? (neededBatteryKwh / efficiency) : 0;

  // Şarj süresi
  let totalMinutes = 0;
  if (deltaSoc > 0 && batteryPowerKw > 0) {
    const hours = neededBatteryKwh / batteryPowerKw;
    totalMinutes = Math.round(hours * 60);
  }

  const durationHours = Math.floor(totalMinutes / 60);
  const durationRemainingMinutes = totalMinutes % 60;

  // Menzil ekleme hızı (km/sa)
  // Tüketim Wh/km -> km/kWh = 1000 / consumptionWhPerKm
  const kmPerKwh = 1000 / consumptionWhPerKm;
  const kmPerHour = batteryPowerKw * kmPerKwh;
  const percentPerHour = capacity > 0 ? (batteryPowerKw / capacity) * 100 : 0;
  const addedKm = neededBatteryKwh * kmPerKwh;

  // Zaman planı hesaplaması
  let startTime = new Date(referenceNow);
  let finishTime = new Date(referenceNow);
  let targetDepartureDate = null;
  let isOverdue = false;
  let earliestFinishIfStartNow = new Date(referenceNow.getTime() + totalMinutes * 60000);
  let overdueMinutes = 0;
  let recommendedAmpsForDeadline = null;

  if (state.calcMode === 'departure') {
    // Çıkış saati: "07:30"
    const [depHours, depMinutes] = (state.departureTime || '07:30').split(':').map(Number);
    
    targetDepartureDate = new Date(referenceNow);
    targetDepartureDate.setHours(depHours, depMinutes, 0, 0);

    // Eğer hedef çıkış saati şu andan önceyse doğrudan yarına at
    if (targetDepartureDate.getTime() <= referenceNow.getTime()) {
      targetDepartureDate.setDate(targetDepartureDate.getDate() + 1);
    }

    // Başlama zamanı = Hedef Çıkış - Toplam Süre
    startTime = new Date(targetDepartureDate.getTime() - totalMinutes * 60000);
    finishTime = new Date(targetDepartureDate);

    // Başlama saati geçmişte mi kaldı? (Şu an başlansa bile yetişmiyor mu?)
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
    // Şimdi şarja tak modu
    startTime = new Date(referenceNow);
    finishTime = new Date(referenceNow.getTime() + totalMinutes * 60000);
  }

  // Fatura ve Maliyet Analizi (Tek Zamanlı Standart veya 3 Zamanlı)
  const tariffCost = calculateCostAnalysis(
    startTime,
    totalMinutes,
    totalGridKwh,
    gridPowerKw,
    consumptionWhPerKm,
    efficiency,
    state
  );

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
    percentPerHour,
    addedKm,
    startTime,
    finishTime,
    targetDepartureDate,
    isOverdue,
    overdueMinutes,
    earliestFinishIfStartNow,
    recommendedAmpsForDeadline,
    tariffCost
  };
}

/**
 * Fatura ve elektrik maliyetlerini hesaplar.
 */
function calculateCostAnalysis(startTime, totalMinutes, totalGridKwh, gridPowerKw, consumptionWhPerKm, efficiency, state) {
  const tariffType = state.tariffType || 'standard';

  // 1. TEK ZAMANLI STANDART TARİFE (Kullanıcının faturası gibi)
  if (tariffType === 'standard') {
    let effectiveRate = Number(state.standardRate) || 3.84;

    if (state.standardPriceMode === 'high-tier') {
      effectiveRate = Number(state.highTierRate) || 4.99;
    } else if (state.standardPriceMode === 'avg-tier') {
      effectiveRate = Number(state.standardRate) || 3.84;
    }

    // Eğer vergi hariç girilmişse vergi ekle
    if (!state.taxInclusive) {
      const btvRate = (Number(state.taxBtvRate) || 5) / 100;
      const kdvRate = (Number(state.taxKdvRate) || 10) / 100;
      effectiveRate = effectiveRate * (1 + btvRate) * (1 + kdvRate);
    }

    const totalCost = totalGridKwh * effectiveRate;
    
    // 100 km maliyeti (TL)
    // Şebekeden çekilen kWh/100km = (Wh/km * 100 / 1000) / efficiency
    const kwhPer100Km = (consumptionWhPerKm * 100 / 1000) / efficiency;
    const costPer100Km = kwhPer100Km * effectiveRate;

    // Benzinli araç kıyaslaması (Örn: 7.5L / 100km ve 45 TL/L benzin = 337.5 TL / 100km)
    const petrolCostPer100Km = 337.5;
    const savingsPercentVsPetrol = Math.round(((petrolCostPer100Km - costPer100Km) / petrolCostPer100Km) * 100);

    return {
      type: 'standard',
      effectiveRate: Number(effectiveRate.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      costPer100Km: Number(costPer100Km.toFixed(1)),
      savingsPercentVsPetrol: Math.max(0, savingsPercentVsPetrol),
      modeName: state.standardPriceMode === 'high-tier' ? 'Yüksek Kademe (4.99 TL)' : 'Fatura Ortalaması (3.84 TL)'
    };
  }

  // 2. ÜÇ ZAMANLI GECE TARİFESİ
  const nightRate = Number(state.tariffNightRate) || 1.67;
  const dayRate = Number(state.tariffDayRate) || 3.23;
  const peakRate = Number(state.tariffPeakRate) || 4.97;

  const stepMinutes = 15;
  const steps = Math.ceil(totalMinutes / stepMinutes);
  const kwPerStep = (gridPowerKw * (stepMinutes / 60));

  let nightKwh = 0;
  let dayKwh = 0;
  let peakKwh = 0;

  let cursor = new Date(startTime);

  for (let i = 0; i < steps; i++) {
    const hour = cursor.getHours();
    if (hour >= 22 || hour < 6) {
      nightKwh += kwPerStep;
    } else if (hour >= 17 && hour < 22) {
      peakKwh += kwPerStep;
    } else {
      dayKwh += kwPerStep;
    }
    cursor.setMinutes(cursor.getMinutes() + stepMinutes);
  }

  const calculatedTotalKwh = nightKwh + dayKwh + peakKwh;
  const estimatedTotalCost = (nightKwh * nightRate) + (dayKwh * dayRate) + (peakKwh * peakRate);

  // Standart tek zamanlıya göre fark
  const comparisonStandardCost = calculatedTotalKwh * (Number(state.standardRate) || 3.84);
  const savingsVsStandard = comparisonStandardCost - estimatedTotalCost;
  const nightPercent = calculatedTotalKwh > 0 ? Math.round((nightKwh / calculatedTotalKwh) * 100) : 0;

  return {
    type: 'three-tier',
    nightKwh: Number(nightKwh.toFixed(1)),
    dayKwh: Number(dayKwh.toFixed(1)),
    peakKwh: Number(peakKwh.toFixed(1)),
    nightPercent,
    totalCost: Number(estimatedTotalCost.toFixed(2)),
    savingsVsStandard: Number(savingsVsStandard.toFixed(2)),
    effectiveRate: calculatedTotalKwh > 0 ? Number((estimatedTotalCost / calculatedTotalKwh).toFixed(2)) : nightRate
  };
}

/**
 * Tarih ve saati Türkçe biçimlendirir.
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
