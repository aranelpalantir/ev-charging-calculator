// js/calculator.js - Şarj, Zaman ve İki Fazlı Gece Akımı Hesaplama Motoru
import { VEHICLE_PRESETS } from './storage.js';

/**
 * Şarj süresi, başlama saati ve fatura maliyetini hesaplar.
 */
export function calculateCharging(state, referenceNow = new Date()) {
  const currentSoc = Math.min(100, Math.max(0, Number(state.currentSoc) || 0));
  const targetSoc = Math.min(100, Math.max(0, Number(state.targetSoc) || 100));
  const initialAmps = Math.max(1, Number(state.amperage) || 13);
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
  const totalGridKwh = neededBatteryKwh > 0 ? (neededBatteryKwh / efficiency) : 0;

  // Güçler (kW)
  const initialGridKw = (voltage * initialAmps) / 1000;
  const initialBatKw = initialGridKw * efficiency;

  // Gece Güvenlik Akımı Planı kontrolü (10A düşürme)
  const enableNightDrop = Boolean(state.enableNightDrop && state.nightDropTime && state.nightDropAmps);
  const nightDropAmps = Math.max(1, Number(state.nightDropAmps) || 10);
  const nightGridKw = (voltage * nightDropAmps) / 1000;
  const nightBatKw = nightGridKw * efficiency;

  let totalMinutes = 0;
  let startTime = new Date(referenceNow);
  let finishTime = new Date(referenceNow);
  let targetDepartureDate = null;
  let isOverdue = false;
  let earliestFinishIfStartNow = new Date(referenceNow);
  let overdueMinutes = 0;
  let scheduleNote = '';

  if (state.calcMode === 'departure') {
    // 1. ÇIKIŞ SAATİNE GÖRE GERİYE HESAPLAMA
    const [depHours, depMinutes] = (state.departureTime || '07:30').split(':').map(Number);
    targetDepartureDate = new Date(referenceNow);
    targetDepartureDate.setHours(depHours, depMinutes, 0, 0);

    if (targetDepartureDate.getTime() <= referenceNow.getTime()) {
      targetDepartureDate.setDate(targetDepartureDate.getDate() + 1);
    }

    if (deltaSoc === 0) {
      startTime = new Date(targetDepartureDate);
      finishTime = new Date(targetDepartureDate);
    } else if (!enableNightDrop) {
      // Standart Tek Akım Seviyesi ile Şarj
      const durationHours = neededBatteryKwh / initialBatKw;
      totalMinutes = Math.round(durationHours * 60);
      startTime = new Date(targetDepartureDate.getTime() - totalMinutes * 60000);
      finishTime = new Date(targetDepartureDate);
    } else {
      // İKİ FAZLI ŞARJ (Örn: Akşam 13A, gece 00:00'dan sonra 10A)
      const [dropHours, dropMinutes] = (state.nightDropTime || '00:00').split(':').map(Number);
      let nightDropDate = new Date(targetDepartureDate);
      nightDropDate.setHours(dropHours, dropMinutes, 0, 0);

      // Drop saati çıkış saatinden önce olmalıdır.
      if (nightDropDate.getTime() >= targetDepartureDate.getTime()) {
        nightDropDate.setDate(nightDropDate.getDate() - 1);
      }

      // 2. Faz (Gece Düşük Akım Fazı): nightDropDate -> targetDepartureDate
      const phase2Hours = Math.max(0, (targetDepartureDate.getTime() - nightDropDate.getTime()) / 3600000);
      const phase2MaxKwh = phase2Hours * nightBatKw;

      if (phase2MaxKwh >= neededBatteryKwh) {
        // İhtiyaç duyulan enerjinin tamamı 10A ile gece fazında dolabiliyor
        const durHours = neededBatteryKwh / nightBatKw;
        totalMinutes = Math.round(durHours * 60);
        startTime = new Date(targetDepartureDate.getTime() - totalMinutes * 60000);
        finishTime = new Date(targetDepartureDate);
        scheduleNote = `Tüm şarj gece ${nightDropAmps}A ile tamamlanacak.`;
      } else {
        // İki faz da devrede: 2. fazda phase2MaxKwh dolar, kalanı 1. fazda (13A) tamamlanır
        const phase1KwhNeeded = neededBatteryKwh - phase2MaxKwh;
        const phase1Hours = phase1KwhNeeded / initialBatKw;
        const totalDurationHours = phase1Hours + phase2Hours;
        totalMinutes = Math.round(totalDurationHours * 60);

        startTime = new Date(nightDropDate.getTime() - phase1Hours * 3600000);
        finishTime = new Date(targetDepartureDate);

        const dropTimeFormatted = state.nightDropTime || '00:00';
        scheduleNote = `Saat ${dropTimeFormatted}'a kadar ${initialAmps}A, ardından ${nightDropAmps}A ile şarj edilir.`;
      }
    }

    // Yetişmeme kontrolü
    if (startTime.getTime() < referenceNow.getTime() && deltaSoc > 0) {
      isOverdue = true;
      overdueMinutes = Math.round((referenceNow.getTime() - startTime.getTime()) / 60000);
      earliestFinishIfStartNow = new Date(referenceNow.getTime() + totalMinutes * 60000);
    }
  } else {
    // 2. ŞİMDİ ŞARJA TAK MODU (İleriye Hesaplama)
    startTime = new Date(referenceNow);
    if (deltaSoc === 0) {
      finishTime = new Date(referenceNow);
    } else if (!enableNightDrop) {
      const durationHours = neededBatteryKwh / initialBatKw;
      totalMinutes = Math.round(durationHours * 60);
      finishTime = new Date(referenceNow.getTime() + totalMinutes * 60000);
    } else {
      const [dropHours, dropMinutes] = (state.nightDropTime || '00:00').split(':').map(Number);
      let nightDropDate = new Date(referenceNow);
      nightDropDate.setHours(dropHours, dropMinutes, 0, 0);
      if (nightDropDate.getTime() <= referenceNow.getTime()) {
        nightDropDate.setDate(nightDropDate.getDate() + 1);
      }

      const hoursUntilDrop = (nightDropDate.getTime() - referenceNow.getTime()) / 3600000;
      const kwhBeforeDrop = hoursUntilDrop * initialBatKw;

      if (kwhBeforeDrop >= neededBatteryKwh) {
        const durHours = neededBatteryKwh / initialBatKw;
        totalMinutes = Math.round(durHours * 60);
        finishTime = new Date(referenceNow.getTime() + totalMinutes * 60000);
      } else {
        const remainingKwh = neededBatteryKwh - kwhBeforeDrop;
        const phase2Hours = remainingKwh / nightBatKw;
        const totalDurationHours = hoursUntilDrop + phase2Hours;
        totalMinutes = Math.round(totalDurationHours * 60);
        finishTime = new Date(nightDropDate.getTime() + phase2Hours * 3600000);
        scheduleNote = `Saat ${state.nightDropTime}'a kadar ${initialAmps}A, ardından ${nightDropAmps}A ile tamamlanır.`;
      }
    }
  }

  const durationHours = Math.floor(totalMinutes / 60);
  const durationRemainingMinutes = totalMinutes % 60;

  // Menzil hesapları
  const kmPerKwh = 1000 / consumptionWhPerKm;
  const kmPerHour = initialBatKw * kmPerKwh;
  const addedKm = neededBatteryKwh * kmPerKwh;

  // Fatura Maliyeti
  const rate = Number(state.standardRate) || 3.84;
  const totalCost = totalGridKwh * rate;
  const kwhPer100Km = (consumptionWhPerKm * 100 / 1000) / efficiency;
  const costPer100Km = kwhPer100Km * rate;
  const costPerKm = costPer100Km / 100;

  return {
    currentSoc,
    targetSoc,
    deltaSoc,
    capacity,
    vehicleInfo,
    consumptionWhPerKm,
    amperage: initialAmps,
    voltage,
    efficiency: efficiency * 100,
    gridPowerKw: initialGridKw,
    batteryPowerKw: initialBatKw,
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
    enableNightDrop,
    nightDropAmps,
    nightDropTime: state.nightDropTime || '00:00',
    scheduleNote,
    costAnalysis: {
      effectiveRate: Number(rate.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      costPer100Km: Number(costPer100Km.toFixed(1)),
      costPerKm: Number(costPerKm.toFixed(2))
    }
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
