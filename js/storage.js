// js/storage.js - Yerel Hafıza ve Elektrikli Araç Veritabanı

export const VEHICLE_PRESETS = {
  // TESLA
  'tesla-my-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model Y RWD (Standart - 60 kWh LFP)',
    shortName: 'Model Y Standart',
    capacity: 60.0,
    batteryType: 'LFP',
    consumption: 155, // Wh/km
    recommendedDailySoc: 100,
    note: 'LFP batarya haftada en az bir kez %100 doldurulmalıdır.'
  },
  'tesla-my-lr': {
    brand: 'Tesla',
    name: 'Tesla Model Y Long Range (78.1 kWh NMC)',
    shortName: 'Model Y Long Range',
    capacity: 78.1,
    batteryType: 'NMC',
    consumption: 165,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'tesla-my-perf': {
    brand: 'Tesla',
    name: 'Tesla Model Y Performance (78.1 kWh NMC)',
    shortName: 'Model Y Performance',
    capacity: 78.1,
    batteryType: 'NMC',
    consumption: 175,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'tesla-m3-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model 3 RWD (Standart - 60 kWh LFP)',
    shortName: 'Model 3 Standart',
    capacity: 60.0,
    batteryType: 'LFP',
    consumption: 140,
    recommendedDailySoc: 100,
    note: 'LFP batarya haftada en az bir kez %100 doldurulmalıdır.'
  },
  'tesla-m3-lr': {
    brand: 'Tesla',
    name: 'Tesla Model 3 Long Range (78.1 kWh NMC)',
    shortName: 'Model 3 Long Range',
    capacity: 78.1,
    batteryType: 'NMC',
    consumption: 150,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'tesla-ms-mx': {
    brand: 'Tesla',
    name: 'Tesla Model S / Model X (100 kWh)',
    shortName: 'Model S / X',
    capacity: 100.0,
    batteryType: 'NMC',
    consumption: 185,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },

  // TOGG
  'togg-t10x-v1': {
    brand: 'Togg',
    name: 'Togg T10X V1 Standart Menzil (52.4 kWh)',
    shortName: 'Togg T10X Standart',
    capacity: 52.4,
    batteryType: 'NMC',
    consumption: 167,
    recommendedDailySoc: 80,
    note: 'Günlük kullanımda %80, uzun yolda %100 önerilir.'
  },
  'togg-t10x-v2': {
    brand: 'Togg',
    name: 'Togg T10X V2 Uzun Menzil (88.5 kWh)',
    shortName: 'Togg T10X Uzun Menzil',
    capacity: 88.5,
    batteryType: 'NMC',
    consumption: 169,
    recommendedDailySoc: 80,
    note: 'Günlük kullanımda %80, uzun yolda %100 önerilir.'
  },

  // BYD
  'byd-atto3': {
    brand: 'BYD',
    name: 'BYD Atto 3 (60.5 kWh Blade LFP)',
    shortName: 'BYD Atto 3',
    capacity: 60.5,
    batteryType: 'LFP',
    consumption: 156,
    recommendedDailySoc: 100,
    note: 'BYD Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'byd-seal': {
    brand: 'BYD',
    name: 'BYD Seal (82.5 kWh Blade LFP)',
    shortName: 'BYD Seal',
    capacity: 82.5,
    batteryType: 'LFP',
    consumption: 166,
    recommendedDailySoc: 100,
    note: 'BYD Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'byd-dolphin': {
    brand: 'BYD',
    name: 'BYD Dolphin (60.4 kWh Blade LFP)',
    shortName: 'BYD Dolphin',
    capacity: 60.4,
    batteryType: 'LFP',
    consumption: 152,
    recommendedDailySoc: 100,
    note: 'BYD Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'byd-seal-u': {
    brand: 'BYD',
    name: 'BYD Seal U EV (71.8 kWh Blade LFP)',
    shortName: 'BYD Seal U EV',
    capacity: 71.8,
    batteryType: 'LFP',
    consumption: 175,
    recommendedDailySoc: 100,
    note: 'Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },

  // MG
  'mg-mg4-std': {
    brand: 'MG',
    name: 'MG4 Comfort (51 kWh LFP)',
    shortName: 'MG4 Comfort',
    capacity: 51.0,
    batteryType: 'LFP',
    consumption: 155,
    recommendedDailySoc: 100,
    note: 'LFP bataryayı %100 doldurabilirsiniz.'
  },
  'mg-mg4-lux': {
    brand: 'MG',
    name: 'MG4 Luxury (64 kWh NMC)',
    shortName: 'MG4 Luxury',
    capacity: 64.0,
    batteryType: 'NMC',
    consumption: 160,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'mg-zs-ev': {
    brand: 'MG',
    name: 'MG ZS EV (51.1 / 72.6 kWh)',
    shortName: 'MG ZS EV',
    capacity: 51.1,
    batteryType: 'LFP',
    consumption: 173,
    recommendedDailySoc: 100,
    note: 'Standart menzil LFP için %100 önerilir.'
  },

  // RENAULT
  'renault-megane': {
    brand: 'Renault',
    name: 'Renault Megane E-Tech (60 kWh)',
    shortName: 'Megane E-Tech',
    capacity: 60.0,
    batteryType: 'NMC',
    consumption: 158,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük %80 önerilir.'
  },
  'renault-scenic': {
    brand: 'Renault',
    name: 'Renault Scenic E-Tech (87 kWh)',
    shortName: 'Scenic E-Tech',
    capacity: 87.0,
    batteryType: 'NMC',
    consumption: 168,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'renault-zoe': {
    brand: 'Renault',
    name: 'Renault Zoe E-Tech (52 kWh)',
    shortName: 'Renault Zoe',
    capacity: 52.0,
    batteryType: 'NMC',
    consumption: 170,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },

  // HYUNDAI & KIA
  'hyundai-ioniq5': {
    brand: 'Hyundai',
    name: 'Hyundai Ioniq 5 (77.4 kWh)',
    shortName: 'Ioniq 5',
    capacity: 77.4,
    batteryType: 'NMC',
    consumption: 168,
    recommendedDailySoc: 80,
    note: '800V mimari, evde AC şarj 11 kW destekler.'
  },
  'hyundai-ioniq6': {
    brand: 'Hyundai',
    name: 'Hyundai Ioniq 6 (77.4 kWh)',
    shortName: 'Ioniq 6',
    capacity: 77.4,
    batteryType: 'NMC',
    consumption: 143,
    recommendedDailySoc: 80,
    note: 'Ultra aerodinamik, günlük kullanımda %80 önerilir.'
  },
  'kia-ev6': {
    brand: 'Kia',
    name: 'Kia EV6 (77.4 kWh)',
    shortName: 'Kia EV6',
    capacity: 77.4,
    batteryType: 'NMC',
    consumption: 165,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'kia-ev9': {
    brand: 'Kia',
    name: 'Kia EV9 (99.8 kWh)',
    shortName: 'Kia EV9',
    capacity: 99.8,
    batteryType: 'NMC',
    consumption: 220,
    recommendedDailySoc: 80,
    note: 'Büyük batarya, evde şarj planlaması kritiktir.'
  },

  // VOLVO
  'volvo-ex30-std': {
    brand: 'Volvo',
    name: 'Volvo EX30 Core (51 kWh LFP)',
    shortName: 'Volvo EX30 LFP',
    capacity: 51.0,
    batteryType: 'LFP',
    consumption: 167,
    recommendedDailySoc: 100,
    note: 'LFP bataryayı %100 doldurabilirsiniz.'
  },
  'volvo-ex30-er': {
    brand: 'Volvo',
    name: 'Volvo EX30 Extended Range (69 kWh NMC)',
    shortName: 'Volvo EX30 Ultra',
    capacity: 69.0,
    batteryType: 'NMC',
    consumption: 170,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },

  // BMW & MERCEDES
  'bmw-ix1': {
    brand: 'BMW',
    name: 'BMW iX1 eDrive20 (64.7 kWh)',
    shortName: 'BMW iX1',
    capacity: 64.7,
    batteryType: 'NMC',
    consumption: 172,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'bmw-i4': {
    brand: 'BMW',
    name: 'BMW i4 eDrive40 (80.7 kWh)',
    shortName: 'BMW i4',
    capacity: 80.7,
    batteryType: 'NMC',
    consumption: 161,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'mercedes-eqa': {
    brand: 'Mercedes',
    name: 'Mercedes EQA 250+ (70.5 kWh)',
    shortName: 'Mercedes EQA',
    capacity: 70.5,
    batteryType: 'NMC',
    consumption: 164,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'mercedes-eqb': {
    brand: 'Mercedes',
    name: 'Mercedes EQB 250+ (70.5 kWh)',
    shortName: 'Mercedes EQB',
    capacity: 70.5,
    batteryType: 'NMC',
    consumption: 175,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },

  // STELLANTIS (Peugeot / Opel / Jeep)
  'peugeot-e2008': {
    brand: 'Peugeot',
    name: 'Peugeot E-2008 (54 kWh)',
    shortName: 'Peugeot E-2008',
    capacity: 54.0,
    batteryType: 'NMC',
    consumption: 154,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'opel-astra-e': {
    brand: 'Opel',
    name: 'Opel Astra Elektrik (54 kWh)',
    shortName: 'Opel Astra EV',
    capacity: 54.0,
    batteryType: 'NMC',
    consumption: 150,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },

  // ÖZEL / MANUEL
  'custom': {
    brand: 'Özel',
    name: 'Özel Araç (Manuel Batarya Kapasitesi)',
    shortName: 'Özel Araç',
    capacity: 60.0,
    batteryType: 'Özel',
    consumption: 160,
    recommendedDailySoc: 100,
    note: 'Batarya boyutunu dilediğiniz gibi belirleyebilirsiniz.'
  }
};

const STORAGE_KEY = 'ev_charging_calculator_v2';

export const DEFAULT_STATE = {
  currentSoc: 30,             // Mevcut batarya %
  targetSoc: 100,            // Hedef batarya % (kullanıcının hedefi %100)
  amperage: 13,              // 13A (kullanıcı en çok 13A şarj ediyor)
  departureTime: '07:30',    // Sabah çıkış saati
  calcMode: 'departure',     // 'departure' (çıkış saatine göre) veya 'now' (şimdi şarja tak)
  vehicleModel: 'tesla-my-rwd', // KULLANICININ KENDİ ARABASI: Tesla Model Y Standart (60 kWh LFP)
  customCapacity: 60.0,
  voltage: 230,              // Standart Türkiye/AB priz voltajı (230V)
  efficiency: 88,            // 10-13A tek faz ev şarjında araç sistemleri açık kaldığı için ~%88 verim

  // TARİFE & MALİYET AYARLARI (Kullanıcının faturasına göre)
  // 'standard' (Tek Zamanlı - Faturanız) veya 'three-tier' (3 Zamanlı Gece Tarifesi)
  tariffType: 'standard',
  
  // Standart Tarife Seçenekleri:
  // 'high-tier' (Yüksek Kademe marjinal EV maliyeti ~4.99 TL/kWh)
  // 'avg-tier'  (Fatura Ortalaması 1520.30 TL / 395.6 kWh = ~3.84 TL/kWh)
  // 'custom'    (Kullanıcının girdiği serbest fiyat)
  standardPriceMode: 'avg-tier',
  standardRate: 3.84,        // Faturadaki genel ortalama birim fiyat (Vergiler dahil)
  highTierRate: 4.99,        // Yüksek kademe birim fiyat (4.32 TL + %5 BTV + %10 KDV = ~4.99 TL)
  lowTierRate: 3.37,         // Düşük kademe birim fiyat (2.92 TL + %5 BTV + %10 KDV = ~3.37 TL)
  
  // Vergi oranları (Faturanızdan: %5 Elektrik Tüketim Vergisi, %10 KDV)
  taxInclusive: true,        // Fiyatlar vergiler dahil mi
  taxBtvRate: 5.0,           // Elk. Tük. Ver. %5
  taxKdvRate: 10.0,          // KDV %10

  // 3 Zamanlı Tarife Kullananlar İçin (Vergiler dahil tahmini birim fiyatlar)
  tariffNightRate: 1.67,     // Gece (22:00-06:00) TL/kWh
  tariffDayRate: 3.23,       // Gündüz (06:00-17:00) TL/kWh
  tariffPeakRate: 4.97,      // Puant (17:00-22:00) TL/kWh

  enableTariffCost: true
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // v1'den geçiş kontrolü
      const oldRaw = localStorage.getItem('tesla_charging_calculator_v1');
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        return { 
          ...DEFAULT_STATE, 
          ...oldParsed, 
          vehicleModel: oldParsed.vehicleModel === 'model-y-rwd' ? 'tesla-my-rwd' : DEFAULT_STATE.vehicleModel 
        };
      }
      return { ...DEFAULT_STATE };
    }
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
