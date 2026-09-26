// js/calculator.js - Şarj ve Zaman Hesaplama Motoru
import { VEHICLE_PRESETS } from './storage.js';

/**
 * Verilen parametrelere göre şarj süresini, başlama saatini ve enerji değerlerini hesaplar.
 */
export function calculateCharging(state, referenceNow = new Date()) {
  const currentSoc = Math.min(100, Math.max(0, Number(state.currentSoc) || 0));
  const targetSoc = Math.min(100, Math.max(0, Number(state.targetSoc) || 100));
  const amperage = Math.max(1, Number(state.amperage) || 13);
  const voltage = Math.max(100, Number(state.voltage) || 230);
  const efficiency = Math.min(100, Math.max(50, Number(state.efficiency) || 88)) / 100;

  // Batarya kapasitesi (kWh)
  let capacity = 60.0;
  if (state.vehicleModel === 'custom') {
    capacity = Number(state.customCapacity) || 60.0;
  } else if (VEHICLE_PRESETS[state.vehicleModel]) {
    capacity = VEHICLE_PRESETS[state.vehicleModel].capacity;
  }

  // Gereken net enerji (kWh)
  const deltaSoc = Math.max(0, targetSoc - currentSoc);
  const neededBatteryKwh = (capacity * deltaSoc) / 100;

  // Güç değerleri (kW)
  // Şebekeden çekilen güç (Prizden çıkan güç)
  const gridPowerKw = (voltage * amperage) / 1000;
  // Araç bataryasına giren efektif net güç
  const batteryPowerKw = gridPowerKw * efficiency;

  // Şebekeden çekilecek toplam enerji (kayıplar dahil kWh)
  const totalGridKwh = neededBatteryKwh > 0 ? (neededBatteryKwh / efficiency) : 0;

  // Şarj süresi
  let totalMinutes = 0;
  if (deltaSoc > 0 && batteryPowerKw > 0) {
    const hours = neededBatteryKwh / batteryPowerKw;
    totalMinutes = Math.round(hours * 60);
  }

  const durationHours = Math.floor(totalMinutes / 60);
  const durationRemainingMinutes = totalMinutes % 60;

  // Hız göstergeleri
  // Yaklaşık menzil tüketimi: 160 Wh/km (6.25 km/kWh)
  const kmPerHour = batteryPowerKw * 6.25;
  const percentPerHour = capacity > 0 ? (batteryPowerKw / capacity) * 100 : 0;

  // Zaman planı hesaplaması
  let startTime = new Date(referenceNow);
  let finishTime = new Date(referenceNow);
  let targetDepartureDate = null;
  let isOverdue = false;
  let earliestFinishIfStartNow = new Date(referenceNow.getTime() + totalMinutes * 60000);
  let overdueMinutes = 0;
  let recommendedAmpsForDeadline = null;

  if (state.calcMode === 'departure') {
    // Çıkış saati ayrıştır: "07:30"
    const [depHours, depMinutes] = (state.departureTime || '07:30').split(':').map(Number);
    
    // Hedef çıkış anını bul:
    // Eğer hedef saat bugün henüz gelmediyse (veya yeterince ilerideyse) bugün,
    // aksi halde en yakın yarın sabahki saat kabul edilir.
    targetDepartureDate = new Date(referenceNow);
    targetDepartureDate.setHours(depHours, depMinutes, 0, 0);

    // Eğer hedef çıkış saati şu andan önceyse, doğrudan yarına at
    if (targetDepartureDate.getTime() <= referenceNow.getTime()) {
      targetDepartureDate.setDate(targetDepartureDate.getDate() + 1);
    } else {
      // Eğer hedef çıkış bugün ancak süre yetmiyorsa yarına mı hedefliyor?
      // Kullanıcı genelde gece takıp sabah 07:30'da çıkmayı kasteder.
      // Eğer şu an 16:00 ise ve çıkış 07:30 ise, zaten ertesi güne denk gelir.
    }

    // Başlama zamanı = Hedef Çıkış - Toplam Süre
    startTime = new Date(targetDepartureDate.getTime() - totalMinutes * 60000);
    finishTime = new Date(targetDepartureDate);

    // Başlama saati geçmişte mi kaldı? (Yani şu an başlasak bile yetişmiyor mu?)
    if (startTime.getTime() < referenceNow.getTime() && deltaSoc > 0) {
      isOverdue = true;
      overdueMinutes = Math.round((referenceNow.getTime() - startTime.getTime()) / 60000);
      
      // Hedef saate yetişebilmek için kaç amper gerekirdi?
      const availableHours = (targetDepartureDate.getTime() - referenceNow.getTime()) / 3600000;
      if (availableHours > 0) {
        // neededBatteryKwh = (voltage * reqAmps * efficiency / 1000) * availableHours
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

  // Türkiye 3 Zamanlı Tarife ve Maliyet Analizi
  // Gece: 22:00 - 06:00
  // Gündüz: 06:00 - 17:00
  // Puant: 17:00 - 22:00
  const tariffAnalysis = calculateTariffCost(
    startTime,
    totalMinutes,
    gridPowerKw,
    state
  );

  return {
    currentSoc,
    targetSoc,
    deltaSoc,
    capacity,
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
    startTime,
    finishTime,
    targetDepartureDate,
    isOverdue,
    overdueMinutes,
    earliestFinishIfStartNow,
    recommendedAmpsForDeadline,
    tariffAnalysis
  };
}

/**
 * Şarj aralığının 3 zamanlı tarifedeki saat dilimlerine göre maliyetini hesaplar.
 */
function calculateTariffCost(startTime, totalMinutes, gridPowerKw, state) {
  if (totalMinutes <= 0 || gridPowerKw <= 0) {
    return {
      nightKwh: 0,
      dayKwh: 0,
      peakKwh: 0,
      nightPercent: 100,
      estimatedTotalCost: 0,
      potentialSavings: 0
    };
  }

  const nightRate = Number(state.tariffNightRate) || 1.45;
  const dayRate = Number(state.tariffDayRate) || 2.80;
  const peakRate = Number(state.tariffPeakRate) || 4.30;

  // 15 dakikalık dilimler halinde simüle et
  const stepMinutes = 15;
  const steps = Math.ceil(totalMinutes / stepMinutes);
  const kwPerStep = (gridPowerKw * (stepMinutes / 60));

  let nightKwh = 0;
  let dayKwh = 0;
  let peakKwh = 0;

  let cursor = new Date(startTime);

  for (let i = 0; i < steps; i++) {
    const hour = cursor.getHours();
    
    // Gece: 22:00 - 06:00 (22, 23, 0, 1, 2, 3, 4, 5)
    if (hour >= 22 || hour < 6) {
      nightKwh += kwPerStep;
    }
    // Puant: 17:00 - 22:00 (17, 18, 19, 20, 21)
    else if (hour >= 17 && hour < 22) {
      peakKwh += kwPerStep;
    }
    // Gündüz: 06:00 - 17:00
    else {
      dayKwh += kwPerStep;
    }

    cursor.setMinutes(cursor.getMinutes() + stepMinutes);
  }

  const totalGridKwh = nightKwh + dayKwh + peakKwh;
  const estimatedTotalCost = (nightKwh * nightRate) + (dayKwh * dayRate) + (peakKwh * peakRate);

  // Eğer tamamı gündüz veya puant olsaydı ne kadar tutardı tasarruf karşılaştırması
  const standardCost = totalGridKwh * dayRate;
  const potentialSavings = Math.max(0, standardCost - estimatedTotalCost);

  const nightPercent = totalGridKwh > 0 ? Math.round((nightKwh / totalGridKwh) * 100) : 0;

  return {
    nightKwh: Number(nightKwh.toFixed(1)),
    dayKwh: Number(dayKwh.toFixed(1)),
    peakKwh: Number(peakKwh.toFixed(1)),
    totalGridKwh: Number(totalGridKwh.toFixed(1)),
    nightPercent,
    estimatedTotalCost: Number(estimatedTotalCost.toFixed(2)),
    potentialSavings: Number(potentialSavings.toFixed(2))
  };
}

/**
 * Tarih ve saati Türkçe kullanıcı dostu biçimlendirir.
 * Örn: "Bugün 22:45", "Yarın 01:15", "26 Eylül 23:30"
 */
export function formatFriendlyTime(date, referenceNow = new Date()) {
  if (!date || isNaN(date.getTime())) return '--:--';

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
