// js/storage.js - Yerel Hafıza ve Elektrikli Araç Veritabanı

export const VEHICLE_PRESETS = {
  // TESLA MODEL Y (ESKİ KASA / LEGACY)
  'tesla-my-legacy-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model Y RWD - Eski Kasa (60 kWh LFP - 455 km WLTP)',
    shortName: 'Model Y RWD',
    capacity: 60.0,
    wltp: 455,
    drivetrain: 'rwd',
    batteryType: 'LFP',
    consumption: 132,
    recommendedDailySoc: 100,
    note: 'LFP batarya haftada en az bir kez %100 doldurulmalıdır.'
  },
  'tesla-my-legacy-lr-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model Y Long Range RWD - Eski Kasa (78.1 kWh NMC - 600 km WLTP)',
    shortName: 'Model Y LR RWD',
    capacity: 78.1,
    wltp: 600,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 130,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'tesla-my-legacy-lr-awd': {
    brand: 'Tesla',
    name: 'Tesla Model Y Long Range - Eski Kasa (78.1 kWh NMC - 533 km WLTP)',
    shortName: 'Model Y LR AWD',
    capacity: 78.1,
    wltp: 533,
    drivetrain: 'awd',
    batteryType: 'NMC',
    consumption: 147,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'tesla-my-legacy-perf': {
    brand: 'Tesla',
    name: 'Tesla Model Y Performance - Eski Kasa (78.1 kWh NMC - 514 km WLTP)',
    shortName: 'Model Y Performance',
    capacity: 78.1,
    wltp: 514,
    drivetrain: 'awd',
    batteryType: 'NMC',
    consumption: 152,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },

  // TESLA MODEL Y (JUNIPER - YENİ KASA)
  'tesla-my-juniper-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model Y RWD - Juniper (60 kWh LFP - 480 km WLTP)',
    shortName: 'Model Y Juniper RWD',
    capacity: 60.0,
    wltp: 480,
    drivetrain: 'rwd',
    batteryType: 'LFP',
    consumption: 125,
    recommendedDailySoc: 100,
    note: 'LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'tesla-my-juniper-lr-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model Y Long Range RWD - Juniper (79 kWh NMC - 600 km WLTP)',
    shortName: 'Model Y Juniper LR RWD',
    capacity: 79.0,
    wltp: 600,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 132,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },
  'tesla-my-juniper-lr-awd': {
    brand: 'Tesla',
    name: 'Tesla Model Y Long Range AWD - Juniper (79 kWh NMC - 560 km WLTP)',
    shortName: 'Model Y Juniper LR AWD',
    capacity: 79.0,
    wltp: 560,
    drivetrain: 'awd',
    batteryType: 'NMC',
    consumption: 141,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük kullanım için %80 önerilir.'
  },

  // TESLA MODEL 3
  'tesla-m3-legacy-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model 3 RWD - Eski Kasa (60 kWh LFP - 491 km WLTP)',
    shortName: 'Model 3 RWD',
    capacity: 60.0,
    wltp: 491,
    drivetrain: 'rwd',
    batteryType: 'LFP',
    consumption: 122,
    recommendedDailySoc: 100,
    note: 'LFP bataryayı haftada bir %100 yapın.'
  },
  'tesla-m3-highland-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model 3 RWD - Highland (60 kWh LFP - 513 km WLTP)',
    shortName: 'Model 3 Highland RWD',
    capacity: 60.0,
    wltp: 513,
    drivetrain: 'rwd',
    batteryType: 'LFP',
    consumption: 117,
    recommendedDailySoc: 100,
    note: 'LFP bataryayı haftada bir %100 yapın.'
  },
  'tesla-m3-highland-lr-awd': {
    brand: 'Tesla',
    name: 'Tesla Model 3 Long Range AWD - Highland (78.1 kWh NMC - 629 km WLTP)',
    shortName: 'Model 3 Highland LR',
    capacity: 78.1,
    wltp: 629,
    drivetrain: 'awd',
    batteryType: 'NMC',
    consumption: 124,
    recommendedDailySoc: 80,
    note: 'Günlük %80, uzun yol %100.'
  },
  'tesla-m3-highland-perf': {
    brand: 'Tesla',
    name: 'Tesla Model 3 Performance AWD - Highland (78.1 kWh NMC - 528 km WLTP)',
    shortName: 'Model 3 Highland Perf',
    capacity: 78.1,
    wltp: 528,
    drivetrain: 'awd',
    batteryType: 'NMC',
    consumption: 148,
    recommendedDailySoc: 80,
    note: 'Günlük %80, uzun yol %100.'
  },

  // TOGG
  'togg-t10x-v1': {
    brand: 'Togg',
    name: 'Togg T10X Standart Menzil (52.4 kWh NMC - 314 km WLTP)',
    shortName: 'Togg T10X Standart',
    capacity: 52.4,
    wltp: 314,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 167,
    recommendedDailySoc: 80,
    note: 'Günlük kullanımda %80, uzun yolda %100 önerilir.'
  },
  'togg-t10x-v2': {
    brand: 'Togg',
    name: 'Togg T10X Uzun Menzil (88.5 kWh NMC - 523 km WLTP)',
    shortName: 'Togg T10X Uzun Menzil',
    capacity: 88.5,
    wltp: 523,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 169,
    recommendedDailySoc: 80,
    note: 'Günlük kullanımda %80, uzun yolda %100 önerilir.'
  },

  // BYD & CHERY
  'byd-atto3': {
    brand: 'BYD',
    name: 'BYD Atto 3 (60.5 kWh LFP - 420 km WLTP)',
    shortName: 'BYD Atto 3',
    capacity: 60.5,
    wltp: 420,
    drivetrain: 'fwd',
    batteryType: 'LFP',
    consumption: 144,
    recommendedDailySoc: 100,
    note: 'Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'byd-seal-u': {
    brand: 'BYD',
    name: 'BYD Seal U EV (71.8 kWh LFP - 500 km WLTP)',
    shortName: 'BYD Seal U',
    capacity: 71.8,
    wltp: 500,
    drivetrain: 'fwd',
    batteryType: 'LFP',
    consumption: 144,
    recommendedDailySoc: 100,
    note: 'Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'byd-seal-rwd': {
    brand: 'BYD',
    name: 'BYD Seal Design RWD (82.5 kWh LFP - 570 km WLTP)',
    shortName: 'BYD Seal RWD',
    capacity: 82.5,
    wltp: 570,
    drivetrain: 'rwd',
    batteryType: 'LFP',
    consumption: 145,
    recommendedDailySoc: 100,
    note: 'Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'byd-seal-awd': {
    brand: 'BYD',
    name: 'BYD Seal AWD (82.5 kWh LFP - 520 km WLTP)',
    shortName: 'BYD Seal AWD',
    capacity: 82.5,
    wltp: 520,
    drivetrain: 'awd',
    batteryType: 'LFP',
    consumption: 159,
    recommendedDailySoc: 100,
    note: 'Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'byd-dolphin': {
    brand: 'BYD',
    name: 'BYD Dolphin (60.4 kWh LFP - 427 km WLTP)',
    shortName: 'BYD Dolphin',
    capacity: 60.4,
    wltp: 427,
    drivetrain: 'fwd',
    batteryType: 'LFP',
    consumption: 141,
    recommendedDailySoc: 100,
    note: 'Blade LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },
  'chery-omoda5-ev': {
    brand: 'Chery',
    name: 'Omoda 5 EV (61 kWh LFP - 430 km WLTP)',
    shortName: 'Omoda 5 EV',
    capacity: 61.0,
    wltp: 430,
    drivetrain: 'fwd',
    batteryType: 'LFP',
    consumption: 142,
    recommendedDailySoc: 100,
    note: 'LFP bataryayı güvenle %100 doldurabilirsiniz.'
  },

  // KGM & SKYWELL
  'kgm-torres-evx': {
    brand: 'KGM',
    name: 'KGM Torres EVX (73.4 kWh LFP - 462 km WLTP)',
    shortName: 'Torres EVX',
    capacity: 73.4,
    wltp: 462,
    drivetrain: 'fwd',
    batteryType: 'LFP',
    consumption: 159,
    recommendedDailySoc: 100,
    note: 'BYD Blade LFP batarya %100 doldurulabilir.'
  },
  'skywell-et5': {
    brand: 'Skywell',
    name: 'Skywell ET5 (86 kWh NMC - 490 km WLTP)',
    shortName: 'Skywell ET5',
    capacity: 86.0,
    wltp: 490,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 175,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },

  // RENAULT & DACIA
  'renault-megane': {
    brand: 'Renault',
    name: 'Renault Megane E-Tech (60 kWh NMC - 450 km WLTP)',
    shortName: 'Megane E-Tech',
    capacity: 60.0,
    wltp: 450,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 133,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük %80 önerilir.'
  },
  'renault-scenic': {
    brand: 'Renault',
    name: 'Renault Scenic E-Tech (87 kWh NMC - 625 km WLTP)',
    shortName: 'Scenic E-Tech',
    capacity: 87.0,
    wltp: 625,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 139,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'renault-zoe': {
    brand: 'Renault',
    name: 'Renault Zoe (52 kWh NMC - 395 km WLTP)',
    shortName: 'Renault Zoe',
    capacity: 52.0,
    wltp: 395,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 132,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'dacia-spring': {
    brand: 'Dacia',
    name: 'Dacia Spring (26.8 kWh LFP - 230 km WLTP)',
    shortName: 'Dacia Spring',
    capacity: 26.8,
    wltp: 230,
    drivetrain: 'fwd',
    batteryType: 'LFP',
    consumption: 116,
    recommendedDailySoc: 100,
    note: 'Şehir içi pratik mini EV.'
  },

  // HYUNDAI & KIA
  'hyundai-ioniq5-awd': {
    brand: 'Hyundai',
    name: 'Hyundai Ioniq 5 AWD (77.4 kWh NMC - 481 km WLTP)',
    shortName: 'Ioniq 5 AWD',
    capacity: 77.4,
    wltp: 481,
    drivetrain: 'awd',
    batteryType: 'NMC',
    consumption: 161,
    recommendedDailySoc: 80,
    note: '800V mimari, evde AC şarj desteği.'
  },
  'hyundai-ioniq6-rwd': {
    brand: 'Hyundai',
    name: 'Hyundai Ioniq 6 RWD (77.4 kWh NMC - 614 km WLTP)',
    shortName: 'Ioniq 6 RWD',
    capacity: 77.4,
    wltp: 614,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 126,
    recommendedDailySoc: 80,
    note: 'Aerodinamik rekor menzil.'
  },
  'hyundai-kona-ev': {
    brand: 'Hyundai',
    name: 'Hyundai Kona Elektrik (65.4 kWh NMC - 514 km WLTP)',
    shortName: 'Kona Elektrik',
    capacity: 65.4,
    wltp: 514,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 127,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'kia-ev6-rwd': {
    brand: 'Kia',
    name: 'Kia EV6 RWD (77.4 kWh NMC - 528 km WLTP)',
    shortName: 'Kia EV6',
    capacity: 77.4,
    wltp: 528,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 147,
    recommendedDailySoc: 80,
    note: '800V mimari hızlı şarj.'
  },
  'kia-ev9-awd': {
    brand: 'Kia',
    name: 'Kia EV9 AWD (99.8 kWh NMC - 505 km WLTP)',
    shortName: 'Kia EV9',
    capacity: 99.8,
    wltp: 505,
    drivetrain: 'awd',
    batteryType: 'NMC',
    consumption: 198,
    recommendedDailySoc: 80,
    note: 'Geniş 7 kişilik SUV.'
  },
  'kia-ev3': {
    brand: 'Kia',
    name: 'Kia EV3 Long Range (81.4 kWh NMC - 605 km WLTP)',
    shortName: 'Kia EV3',
    capacity: 81.4,
    wltp: 605,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 135,
    recommendedDailySoc: 80,
    note: 'Kompakt SUV sınıfında 605 km menzil.'
  },

  // MG
  'mg-mg4-std': {
    brand: 'MG',
    name: 'MG4 Comfort (51 kWh LFP - 350 km WLTP)',
    shortName: 'MG4 Comfort',
    capacity: 51.0,
    wltp: 350,
    drivetrain: 'rwd',
    batteryType: 'LFP',
    consumption: 146,
    recommendedDailySoc: 100,
    note: 'LFP batarya %100 doldurulabilir.'
  },
  'mg-mg4-lux': {
    brand: 'MG',
    name: 'MG4 Luxury (64 kWh NMC - 435 km WLTP)',
    shortName: 'MG4 Luxury',
    capacity: 64.0,
    wltp: 435,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 147,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük %80 önerilir.'
  },
  'mg-zs-ev-lr': {
    brand: 'MG',
    name: 'MG ZS EV Long Range (72.6 kWh NMC - 440 km WLTP)',
    shortName: 'MG ZS EV',
    capacity: 72.6,
    wltp: 440,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 165,
    recommendedDailySoc: 80,
    note: 'Günlük %80, uzun yol %100.'
  },

  // BMW, MERCEDES & VOLVO
  'volvo-ex30-std': {
    brand: 'Volvo',
    name: 'Volvo EX30 Core (51 kWh LFP - 344 km WLTP)',
    shortName: 'Volvo EX30 Core',
    capacity: 51.0,
    wltp: 344,
    drivetrain: 'rwd',
    batteryType: 'LFP',
    consumption: 148,
    recommendedDailySoc: 100,
    note: 'LFP batarya %100 doldurulabilir.'
  },
  'volvo-ex30-er': {
    brand: 'Volvo',
    name: 'Volvo EX30 Ultra (69 kWh NMC - 476 km WLTP)',
    shortName: 'Volvo EX30 Ultra',
    capacity: 69.0,
    wltp: 476,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 145,
    recommendedDailySoc: 80,
    note: 'NMC bataryalarda günlük %80 önerilir.'
  },
  'bmw-ix1': {
    brand: 'BMW',
    name: 'BMW iX1 eDrive20 (64.7 kWh NMC - 475 km WLTP)',
    shortName: 'BMW iX1',
    capacity: 64.7,
    wltp: 475,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 136,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'bmw-i4': {
    brand: 'BMW',
    name: 'BMW i4 eDrive40 (80.7 kWh NMC - 590 km WLTP)',
    shortName: 'BMW i4',
    capacity: 80.7,
    wltp: 590,
    drivetrain: 'rwd',
    batteryType: 'NMC',
    consumption: 137,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'mercedes-eqa': {
    brand: 'Mercedes-Benz',
    name: 'Mercedes EQA 250+ (70.5 kWh NMC - 528 km WLTP)',
    shortName: 'Mercedes EQA',
    capacity: 70.5,
    wltp: 528,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 134,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'mercedes-eqb': {
    brand: 'Mercedes-Benz',
    name: 'Mercedes EQB 250+ (70.5 kWh NMC - 507 km WLTP)',
    shortName: 'Mercedes EQB',
    capacity: 70.5,
    wltp: 507,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 139,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },

  // STELLANTIS
  'peugeot-e2008': {
    brand: 'Peugeot',
    name: 'Peugeot E-2008 (54 kWh NMC - 406 km WLTP)',
    shortName: 'Peugeot E-2008',
    capacity: 54.0,
    wltp: 406,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 133,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'peugeot-e3008': {
    brand: 'Peugeot',
    name: 'Peugeot E-3008 (73 kWh NMC - 527 km WLTP)',
    shortName: 'Peugeot E-3008',
    capacity: 73.0,
    wltp: 527,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 139,
    recommendedDailySoc: 80,
    note: 'Yeni nesil STLA platformu.'
  },
  'opel-astra-e': {
    brand: 'Opel',
    name: 'Opel Astra Elektrik (54 kWh NMC - 418 km WLTP)',
    shortName: 'Opel Astra EV',
    capacity: 54.0,
    wltp: 418,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 129,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'opel-mokka-e': {
    brand: 'Opel',
    name: 'Opel Mokka Elektrik (54 kWh NMC - 406 km WLTP)',
    shortName: 'Opel Mokka EV',
    capacity: 54.0,
    wltp: 406,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 133,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },
  'citroen-e-c4': {
    brand: 'Citroën',
    name: 'Citroën ë-C4 (54 kWh NMC - 420 km WLTP)',
    shortName: 'Citroën ë-C4',
    capacity: 54.0,
    wltp: 420,
    drivetrain: 'fwd',
    batteryType: 'NMC',
    consumption: 129,
    recommendedDailySoc: 80,
    note: 'Günlük kullanım için %80 önerilir.'
  },

  // ÖZEL / MANUEL
  'custom': {
    brand: 'Özel',
    name: 'Özel Araç (Manuel Batarya Girişi)',
    shortName: 'Özel Araç',
    capacity: 60.0,
    wltp: 400,
    drivetrain: 'custom',
    batteryType: 'Özel',
    consumption: 150,
    recommendedDailySoc: 100,
    note: 'Batarya ve menzil boyutunu serbestçe belirleyebilirsiniz.'
  },

  // Geriye dönük uyumluluk takma adları
  'tesla-my-rwd': {
    brand: 'Tesla',
    name: 'Tesla Model Y RWD - Eski Kasa (60 kWh LFP - 455 km WLTP)',
    shortName: 'Model Y RWD',
    capacity: 60.0,
    wltp: 455,
    drivetrain: 'rwd',
    batteryType: 'LFP',
    consumption: 132,
    recommendedDailySoc: 100,
    note: 'LFP batarya haftada en az bir kez %100 doldurulmalıdır.'
  }
};

const STORAGE_KEY = 'ev_charging_calculator_v8';

export const DEFAULT_STATE = {
  currentSoc: 30,             // Mevcut batarya %
  targetSoc: 100,            // Hedef batarya %
  amperage: 13,              // 13A (varsayılan başlama akımı)
  departureTime: '07:30',    // Sabah çıkış saati
  calcMode: 'departure',     // 'departure' (çıkış saatine göre) veya 'now' (şimdi şarja tak)
  vehicleModel: 'tesla-my-legacy-rwd', // KULLANICININ ARABASI: Tesla Model Y RWD - Eski Kasa
  batteryCapacity: 60.0,     // Brüt Batarya (kWh)
  usableCapacity: 60.0,      // Kullanılabilir Net Batarya (kWh)
  customCapacity: 60.0,      // Batarya kapasitesi (kWh)
  vehicleWltp: 455,          // Katalog WLTP Menzili (km)
  catalogConsumption: 15.7,  // Katalog Tüketimi (kWh/100km)
  realConsumption: 20.0,     // Gerçek Yol Tüketimi (kWh/100km)
  batteryType: 'LFP',
  drivetrain: 'rwd',
  voltage: 220,              // 220V
  efficiency: 88,            // 10-13A ev şarjında ortalama %88 verim

  // Gece Güvenlik Akımı Planı (Uyurken 10A Düşürme)
  enableNightDrop: false,    // Gece akımı düşürülsün mü?
  nightDropTime: '00:00',    // Akımın düşeceği saat (örn: 00:00)
  nightDropAmps: 10,         // Güvenli gece akımı (örn: 10A)

  // Fatura Birim Fiyat Modu: 'formula' (TL ÷ kWh) veya 'manual' (Doğrudan Giriş)
  tariffMode: 'formula',     // 'formula' | 'manual'
  billTotalAmount: 1000.00,  // Fatura Tutarı: 1000 TL
  billTotalKwh: 260.00,      // Toplam Tüketim: 260 kWh
  standardRate: 3.85         // 1000 TL ÷ 260 kWh ≈ 3.85 TL/kWh
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const oldKeys = ['ev_charging_calculator_v7', 'ev_charging_calculator_v6', 'ev_charging_calculator_v5', 'ev_charging_calculator_v4', 'ev_charging_calculator_v3', 'ev_charging_calculator_v2', 'tesla_charging_calculator_v1'];
      for (const k of oldKeys) {
        const oldRaw = localStorage.getItem(k);
        if (oldRaw) {
          const oldParsed = JSON.parse(oldRaw);
          if (oldParsed.vehicleModel === 'tesla-my-rwd' || !oldParsed.vehicleModel) {
            oldParsed.vehicleModel = 'tesla-my-legacy-rwd';
          }
          if (!oldParsed.realConsumption) {
            oldParsed.realConsumption = 20.0;
          }
          if (!oldParsed.usableCapacity) {
            oldParsed.usableCapacity = oldParsed.customCapacity || 60.0;
          }
          if (!oldParsed.batteryCapacity) {
            oldParsed.batteryCapacity = oldParsed.customCapacity || 60.0;
          }
          if (!oldParsed.vehicleWltp) {
            oldParsed.vehicleWltp = VEHICLE_PRESETS[oldParsed.vehicleModel]?.wltp || 455;
          }
          if (oldParsed.billTotalAmount === 1520.30 || oldParsed.billTotalKwh === 395.68 || oldParsed.billTotalKwh === 250) {
            oldParsed.billTotalAmount = 1000.00;
            oldParsed.billTotalKwh = 260.00;
            oldParsed.standardRate = 3.85;
          }
          return { ...DEFAULT_STATE, ...oldParsed };
        }
      }
      return { ...DEFAULT_STATE };
    }
    const parsed = JSON.parse(raw);
    if (parsed.vehicleModel === 'tesla-my-rwd' || !parsed.vehicleModel) {
      parsed.vehicleModel = 'tesla-my-legacy-rwd';
    }
    if (!parsed.realConsumption) {
      parsed.realConsumption = 20.0;
    }
    if (!parsed.usableCapacity) {
      parsed.usableCapacity = parsed.customCapacity || 60.0;
    }
    if (!parsed.batteryCapacity) {
      parsed.batteryCapacity = parsed.customCapacity || 60.0;
    }
    if (!parsed.vehicleWltp && parsed.vehicleWltp !== 0) {
      parsed.vehicleWltp = VEHICLE_PRESETS[parsed.vehicleModel]?.wltp || 455;
    }
    if (parsed.billTotalAmount === 1520.30 || parsed.billTotalKwh === 395.68) {
      parsed.billTotalAmount = 1000.00;
      parsed.billTotalKwh = 260.00;
      parsed.standardRate = 3.85;
    }
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
