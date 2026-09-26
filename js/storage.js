// js/storage.js - Yerel Hafıza ve Araç Veritabanı

export const VEHICLE_PRESETS = {
  'model-y-rwd': {
    name: 'Model Y RWD (Standart - 60 kWh LFP)',
    shortName: 'Model Y RWD (LFP)',
    capacity: 60.0,
    batteryType: 'LFP',
    recommendedDailySoc: 100,
    note: 'LFP batarya haftada en az bir kez %100 doldurulmalıdır.'
  },
  'model-y-lr': {
    name: 'Model Y Long Range (78.1 kWh NMC)',
    shortName: 'Model Y LR',
    capacity: 78.1,
    batteryType: 'NMC',
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'model-y-perf': {
    name: 'Model Y Performance (78.1 kWh NMC)',
    shortName: 'Model Y Perf',
    capacity: 78.1,
    batteryType: 'NMC',
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'model-3-rwd': {
    name: 'Model 3 RWD (Standart - 60 kWh LFP)',
    shortName: 'Model 3 RWD',
    capacity: 60.0,
    batteryType: 'LFP',
    recommendedDailySoc: 100,
    note: 'LFP batarya haftada en az bir kez %100 doldurulmalıdır.'
  },
  'model-3-lr': {
    name: 'Model 3 Long Range (78.1 kWh NMC)',
    shortName: 'Model 3 LR',
    capacity: 78.1,
    batteryType: 'NMC',
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'model-s-x': {
    name: 'Model S / Model X (100 kWh)',
    shortName: 'Model S / X',
    capacity: 100.0,
    batteryType: 'NMC',
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'custom': {
    name: 'Özel Kapasite (Manuel kWh)',
    shortName: 'Özel',
    capacity: 60.0,
    batteryType: 'Özel',
    recommendedDailySoc: 100,
    note: 'İstediğiniz batarya boyutunu manuel girebilirsiniz.'
  }
};

const STORAGE_KEY = 'tesla_charging_calculator_v1';

export const DEFAULT_STATE = {
  currentSoc: 30,             // Mevcut batarya %
  targetSoc: 100,            // Hedef batarya % (kullanıcı %100 istiyor)
  amperage: 13,              // 13A (en son hep 13A şarj ediyor)
  departureTime: '07:30',    // Sabah çıkış saati
  calcMode: 'departure',     // 'departure' (çıkış saatine göre) veya 'now' (şimdi şarja tak)
  vehicleModel: 'model-y-rwd',// Türkiye'de en yaygın Model Y RWD LFP
  customCapacity: 60.0,
  voltage: 230,              // Standart Türkiye/AB priz voltajı (230V)
  efficiency: 88,            // 10-13A tek faz ev şarjında araç sistemleri açık kaldığı için ~%88 verim
  tariffNightRate: 1.45,     // Gece tarifesi (22:00-06:00) tahmini TL/kWh
  tariffDayRate: 2.80,       // Gündüz tarifesi tahmini TL/kWh
  tariffPeakRate: 4.30,      // Puant tarifesi (17:00-22:00) tahmini TL/kWh
  enableTariffCost: true
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.warn('Ayarlar yüklenemedi, varsayılanlar kullanılıyor:', e);
    return { ...DEFAULT_STATE };
  }
}

export function saveSettings(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Ayarlar kaydedilemedi:', e);
  }
}
