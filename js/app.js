// js/app.js - EV Şarj Zamanlayıcı ve Fatura Hesaplayıcı
import { loadSettings, saveSettings, VEHICLE_PRESETS, DEFAULT_STATE } from './storage.js';
import { calculateCharging, formatFriendlyTime } from './calculator.js';

// Mevcut durum
let state = loadSettings();
let deferredInstallPrompt = null;

// DOM Elementleri
const els = {
  // Başlık & Araç Seçici
  selectedModelTag: document.getElementById('selected-model-tag'),
  btnHeaderVehicle: document.getElementById('btn-header-vehicle'),
  btnOpenSettings: document.getElementById('btn-open-settings'),
  
  // Hero Sonuç Kartı
  resultModeLabel: document.getElementById('result-mode-label'),
  resultDayBadge: document.getElementById('result-day-badge'),
  startTimeVal: document.getElementById('start-time-val'),
  startTimeSuffix: document.getElementById('start-time-suffix'),
  overdueWarning: document.getElementById('overdue-warning'),
  overdueTitle: document.getElementById('overdue-title'),
  overdueDetail: document.getElementById('overdue-detail'),
  resultSummaryText: document.getElementById('result-summary-text'),
  nightDropNote: document.getElementById('night-drop-note'),
  nightDropNoteText: document.getElementById('night-drop-note-text'),
  statDuration: document.getElementById('stat-duration'),
  statPower: document.getElementById('stat-power'),
  statEnergy: document.getElementById('stat-energy'),
  statCost: document.getElementById('stat-cost'),
  resultActionsRow: document.getElementById('result-actions-row'),
  btnTeslaGuide: document.getElementById('btn-tesla-guide'),

  // 1. Sıra: Hesaplama Modu ve Çıkış Saati
  modeDepartureBtn: document.getElementById('mode-departure-btn'),
  modeNowBtn: document.getElementById('mode-now-btn'),
  departurePickerContainer: document.getElementById('departure-picker-container'),
  inputDepartureTime: document.getElementById('input-departure-time'),
  timeChips: document.querySelectorAll('.chip[data-time]'),

  // 2. Sıra: Şarj Gücü & Cihaz Seçimi
  ampPowerLabel: document.getElementById('amp-power-label'),
  powerPresetButtons: document.querySelectorAll('.segment-btn[data-preset]'),
  btnToggleCustomAmp: document.getElementById('btn-toggle-custom-amp'),
  customAmpBox: document.getElementById('custom-amp-box'),
  btnPhase1: document.getElementById('btn-phase-1'),
  btnPhase3: document.getElementById('btn-phase-3'),
  rangeCustomAmp: document.getElementById('range-custom-amp'),
  customAmpVal: document.getElementById('custom-amp-val'),

  // Ana Sayfa Şebeke Voltajı Çipleri
  mainVoltageReadout: document.getElementById('main-voltage-readout'),
  voltageChips: document.querySelectorAll('.voltage-chip[data-voltage]'),

  // Gece Güvenlik Akımı Planı
  checkEnableNightDrop: document.getElementById('check-enable-night-drop'),
  nightDropInputs: document.getElementById('night-drop-inputs'),
  inputNightDropTime: document.getElementById('input-night-drop-time'),
  selectNightDropAmps: document.getElementById('select-night-drop-amps'),

  // 3. Sıra: Mevcut Şarj (+1 / -1)
  inputCurrentSoc: document.getElementById('input-current-soc'),
  rangeCurrentSoc: document.getElementById('range-current-soc'),
  btnCurrentDec: document.getElementById('btn-current-dec'),
  btnCurrentInc: document.getElementById('btn-current-inc'),
  currentChips: document.querySelectorAll('.chip[data-current]'),

  // 4. Sıra: Hedef Şarj
  inputTargetSoc: document.getElementById('input-target-soc'),
  target100Sub: document.getElementById('target-100-sub'),
  targetButtons: document.querySelectorAll('.chip-target[data-target]'),

  // Batarya Görsel Çubuğu & WLTP Göstergeleri
  batteryRangeText: document.getElementById('battery-range-text'),
  barCurrent: document.getElementById('bar-current'),
  barTarget: document.getElementById('bar-target'),
  valCurrentKm: document.getElementById('val-current-km'),
  valTargetKm: document.getElementById('val-target-km'),
  valAddedKm: document.getElementById('val-added-km'),

  // Elektrik Faturası & Maliyet Kartı
  btnToggleTariff: document.getElementById('btn-toggle-tariff'),
  tariffContent: document.getElementById('tariff-content'),
  tariffSummarySub: document.getElementById('tariff-summary-sub'),
  valStdGridKwh: document.getElementById('val-std-grid-kwh'),
  valStdRate: document.getElementById('val-std-rate'),
  valStdKmCosts: document.getElementById('val-std-km-costs'),
  valStdTotal: document.getElementById('val-std-total'),

  // Ayarlar Modalı
  settingsModal: document.getElementById('settings-modal'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  selectVehicleModel: document.getElementById('select-vehicle-model'),
  customCapacityGroup: document.getElementById('custom-capacity-group'),
  inputCustomCapacity: document.getElementById('input-custom-capacity'),
  inputRealConsumption: document.getElementById('input-real-consumption'),
  realConsumptionDisplay: document.getElementById('real-consumption-display'),
  inputVehicleWltp: document.getElementById('input-vehicle-wltp'),
  wltpDisplay: document.getElementById('wltp-display'),
  inputUsableBattery: document.getElementById('input-usable-battery'),
  usableBatteryDisplay: document.getElementById('usable-battery-display'),
  inputEfficiency: document.getElementById('input-efficiency'),
  efficiencyDisplay: document.getElementById('efficiency-display'),
  
  // Parametrik Fatura Formül ve Mod Elemanları
  tabTariffFormula: document.getElementById('tab-tariff-formula'),
  tabTariffManual: document.getElementById('tab-tariff-manual'),
  sectionTariffFormula: document.getElementById('section-tariff-formula'),
  sectionTariffManual: document.getElementById('section-tariff-manual'),
  inputBillAmount: document.getElementById('input-bill-amount'),
  inputBillKwh: document.getElementById('input-bill-kwh'),
  formulaRateDisplay: document.getElementById('formula-rate-display'),
  inputRateSetting: document.getElementById('input-rate-setting'),
  manualRateChips: document.querySelectorAll('.manual-rate-presets button[data-mrate]'),
  btnResetDefaults: document.getElementById('btn-reset-defaults'),

  // Rehber Modalı
  guideModal: document.getElementById('guide-modal'),
  btnCloseGuide: document.getElementById('btn-close-guide'),
  guideAppName: document.getElementById('guide-app-name'),
  guideTargetTime: document.getElementById('guide-target-time'),
  guideTargetAmp: document.getElementById('guide-target-amp'),

  // PWA & Toast & Kurulum Rehberi (iOS & Android)
  installCard: document.getElementById('install-card'),
  installTitle: document.getElementById('install-title'),
  installDesc: document.getElementById('install-desc'),
  btnInstallPwa: document.getElementById('btn-install-pwa'),
  btnDismissInstall: document.getElementById('btn-dismiss-install'),
  btnOpenInstallGuide: document.getElementById('btn-open-install-guide'),
  btnFooterInstallGuide: document.getElementById('btn-footer-install-guide'),
  pwaGuideModal: document.getElementById('pwa-guide-modal'),
  btnClosePwaGuide: document.getElementById('btn-close-pwa-guide'),
  btnDismissPwaGuide: document.getElementById('btn-dismiss-pwa-guide'),
  tabPwaIos: document.getElementById('tab-pwa-ios'),
  tabPwaAndroid: document.getElementById('tab-pwa-android'),
  panelPwaIos: document.getElementById('panel-pwa-ios'),
  panelPwaAndroid: document.getElementById('panel-pwa-android'),
  btnAndroidDirectInstall: document.getElementById('btn-android-direct-install'),
  toastMsg: document.getElementById('toast-msg')
};

// Seçenekten araç parametrelerini oku
function extractVehicleDataFromOption(opt) {
  if (!opt) return null;
  const battery = parseFloat(opt.dataset.battery) || 0;
  const usable = parseFloat(opt.dataset.usableBattery) || (battery > 0 ? battery : 60);
  const wltp = parseFloat(opt.dataset.wltp) || 0;
  const consumption = parseFloat(opt.dataset.consumption) || (parseFloat(opt.dataset.realConsumption) || 0);
  // Kullanıcı tercihi: Tüketim başlangıç değeri olarak katalog tüketimi (data-consumption) kullanılır
  const realConsumption = consumption > 0 ? consumption : (parseFloat(opt.dataset.realConsumption) || 15.0);
  const dcMax = parseFloat(opt.dataset.dcMax) || 0;
  const dc1080 = parseFloat(opt.dataset.dc1080) || 0;
  const drivetrain = opt.dataset.drivetrain || 'rwd';
  const batteryType = opt.dataset.batteryType || 'NMC';
  const generation = opt.dataset.generation || '';
  const year = opt.dataset.year || '';
  const name = opt.textContent.trim();

  return {
    battery,
    usable,
    wltp,
    consumption: consumption > 0 ? consumption : realConsumption,
    realConsumption,
    dcMax,
    dc1080,
    drivetrain,
    batteryType,
    generation,
    year,
    name
  };
}

// Uygulama Başlangıcı
function initApp() {
  syncInputsWithState();
  bindEventListeners();
  registerServiceWorker();
  handlePwaInstallPrompt();
  recalculateAndRender();

  // Her 30 saniyede bir otomatik saat güncellemesi
  setInterval(() => {
    recalculateAndRender();
  }, 30000);
}

// State verilerini arayüze yükle
function syncInputsWithState() {
  // 1. Mod & Çıkış Saati
  updateModeUI();
  els.inputDepartureTime.value = state.departureTime || '07:30';
  updateTimeChips();

  // 2. Güç & Faz & Voltaj & Gece Düşürme Planı
  state.chargingPhases = Number(state.chargingPhases) || 1;
  state.chargingPowerPreset = state.chargingPowerPreset || '13a';
  const v = Math.min(235, Math.max(205, Number(state.voltage) || 220));
  state.voltage = v;
  updateVoltageChips();
  updateAmperageUI();

  els.checkEnableNightDrop.checked = Boolean(state.enableNightDrop);
  els.nightDropInputs.style.display = state.enableNightDrop ? 'flex' : 'none';
  els.inputNightDropTime.value = state.nightDropTime || '00:00';
  els.selectNightDropAmps.value = String(state.nightDropAmps || 10);

  // 3. Mevcut Şarj
  els.inputCurrentSoc.value = state.currentSoc;
  els.rangeCurrentSoc.value = state.currentSoc;
  updateCurrentSocChips();

  // 4. Hedef Şarj
  els.inputTargetSoc.value = state.targetSoc;
  updateTargetButtons();

  // Ayarlar Modal Elemanları
  els.selectVehicleModel.value = state.vehicleModel || 'tesla-my-legacy-rwd';
  els.inputCustomCapacity.value = state.customCapacity || 60;
  els.customCapacityGroup.style.display = state.vehicleModel === 'custom' ? 'flex' : 'none';

  if (els.inputRealConsumption) {
    els.inputRealConsumption.value = state.realConsumption || 13.2;
  }
  if (els.realConsumptionDisplay) {
    els.realConsumptionDisplay.textContent = `${Number(state.realConsumption || 13.2).toFixed(1)} kWh`;
  }

  if (els.inputVehicleWltp) {
    els.inputVehicleWltp.value = state.vehicleWltp ?? 455;
  }
  if (els.wltpDisplay) {
    els.wltpDisplay.textContent = `${state.vehicleWltp ?? 455} km`;
  }

  if (els.inputUsableBattery) {
    els.inputUsableBattery.value = state.usableCapacity || 60.0;
  }
  if (els.usableBatteryDisplay) {
    els.usableBatteryDisplay.textContent = `${Number(state.usableCapacity || 60.0).toFixed(1)} kWh`;
  }

  els.inputEfficiency.value = state.efficiency || 88;
  els.efficiencyDisplay.textContent = `%${state.efficiency || 88}`;

  // Formül & Tarife Alanları
  els.inputBillAmount.value = state.billTotalAmount || 1000.00;
  els.inputBillKwh.value = state.billTotalKwh || 260.00;
  updateTariffModeUI();
}

// Ana Ekran ve Modal Voltaj Çipleri
function updateVoltageChips() {
  if (els.mainVoltageReadout) {
    els.mainVoltageReadout.textContent = `${state.voltage || 220} V`;
  }
  els.voltageChips.forEach(chip => {
    const chipV = Number(chip.getAttribute('data-voltage'));
    chip.classList.toggle('active-chip', chipV === Number(state.voltage));
  });
}

// Tarife Modunu Değiştir (Faturadan Hesapla vs Doğrudan Manuel Gir)
function updateTariffModeUI() {
  const isFormula = (state.tariffMode || 'formula') === 'formula';
  if (els.tabTariffFormula) els.tabTariffFormula.classList.toggle('active-segment', isFormula);
  if (els.tabTariffManual) els.tabTariffManual.classList.toggle('active-segment', !isFormula);
  if (els.sectionTariffFormula) els.sectionTariffFormula.style.display = isFormula ? 'block' : 'none';
  if (els.sectionTariffManual) els.sectionTariffManual.style.display = isFormula ? 'none' : 'block';

  if (isFormula) {
    updateFormulaDisplay();
  } else {
    els.inputRateSetting.value = (Number(state.standardRate) || 3.85).toFixed(2);
  }
}

// Amper ve Güç Göstergesi
function updateAmperageUI() {
  const amp = Number(state.amperage) || 13;
  const phases = Number(state.chargingPhases) || 1;
  const voltage = Number(state.voltage) || 220;
  const kw = ((phases * voltage * amp) / 1000).toFixed(1);

  // Başlık etiketi güncellemesi
  if (phases === 3) {
    if (amp === 16) {
      els.ampPowerLabel.textContent = `⚡ ${kw} kW • 3x16A (Trifaze Wallbox)`;
    } else if (amp === 32) {
      els.ampPowerLabel.textContent = `⚡ ${kw} kW • 3x32A (Hızlı Trifaze AC)`;
    } else {
      els.ampPowerLabel.textContent = `⚡ ${kw} kW • 3x${amp}A (Trifaze)`;
    }
  } else if (amp === 32) {
    els.ampPowerLabel.textContent = `⚡ ${kw} kW • 32A (32A Mavi Priz / WB)`;
  } else if (amp === 16) {
    els.ampPowerLabel.textContent = `🔌 16A • ~${kw} kW (16A Mavi Priz)`;
  } else if (amp === 13) {
    els.ampPowerLabel.textContent = `🔌 13A • ~${kw} kW (Standart Ev Prizi)`;
  } else if (amp === 10) {
    els.ampPowerLabel.textContent = `🔌 10A • ~${kw} kW (Güvenli Priz)`;
  } else {
    els.ampPowerLabel.textContent = `🔌 ${amp}A • ~${kw} kW (1 Faz)`;
  }

  // Preset butonlarının aktiflik durumunu güncelle
  const currentPreset = state.chargingPowerPreset || 'custom';
  els.powerPresetButtons.forEach(btn => {
    const p = btn.getAttribute('data-preset');
    btn.classList.toggle('active-segment', p === currentPreset);
  });

  // Özel kutu durumunu güncelle
  if (els.rangeCustomAmp) {
    els.rangeCustomAmp.value = amp;
  }
  if (els.customAmpVal) {
    els.customAmpVal.textContent = `${amp}A`;
  }
  if (els.btnPhase1) {
    els.btnPhase1.classList.toggle('active', phases === 1);
  }
  if (els.btnPhase3) {
    els.btnPhase3.classList.toggle('active', phases === 3);
  }
}

// Hesaplama Modu
function updateModeUI() {
  const isDeparture = state.calcMode === 'departure';
  els.modeDepartureBtn.classList.toggle('active-segment', isDeparture);
  els.modeNowBtn.classList.toggle('active-segment', !isDeparture);
  els.departurePickerContainer.style.display = isDeparture ? 'flex' : 'none';
  els.resultModeLabel.textContent = isDeparture ? 'ŞARJA BAŞLAMA SAATİ' : 'ŞARJIN BİTİŞ SAATİ';
}

function updateCurrentSocChips() {
  els.currentChips.forEach(chip => {
    const val = Number(chip.getAttribute('data-current'));
    chip.classList.toggle('active-chip', val === Number(state.currentSoc));
  });
}

function updateTargetButtons() {
  els.targetButtons.forEach(btn => {
    const val = Number(btn.getAttribute('data-target'));
    btn.classList.toggle('active-target', val === Number(state.targetSoc));
  });
}

function updateTimeChips() {
  els.timeChips.forEach(chip => {
    const val = chip.getAttribute('data-time');
    chip.classList.toggle('active-chip', val === state.departureTime);
  });
}

// Formülden Birim Fiyat Güncelleme
function updateFormulaDisplay() {
  const amount = Number(els.inputBillAmount.value) || 0;
  const kwh = Number(els.inputBillKwh.value) || 1;
  let calcRate = 3.85;
  if (kwh > 0 && amount > 0) {
    calcRate = Number((amount / kwh).toFixed(2));
  }
  els.formulaRateDisplay.textContent = `${calcRate.toFixed(2)} TL / kWh`;
  if ((state.tariffMode || 'formula') === 'formula') {
    state.standardRate = calcRate;
    els.inputRateSetting.value = calcRate.toFixed(2);
  }
}

// Hesapla ve Ekrana Bas
function recalculateAndRender() {
  const result = calculateCharging(state, new Date());

  // Üst Başlık Araba Modeli ve Uygulama Adı
  let modelShort = 'Model Y RWD';
  let appName = 'Araç Mobil Uygulamasını Açın';
  const selOpt = els.selectVehicleModel.options[els.selectVehicleModel.selectedIndex];
  
  if (state.vehicleModel === 'custom') {
    modelShort = `Özel (${result.capacity} kWh)`;
    appName = 'Araç Mobil Uygulamasını Açın';
  } else if (selOpt) {
    modelShort = selOpt.text.split('(')[0].trim();
    const optGroupLabel = selOpt.closest('optgroup')?.label || '';
    if (optGroupLabel.includes('Tesla')) appName = 'Tesla Mobil Uygulamasını Açın';
    else if (optGroupLabel.includes('Togg')) appName = 'Trumore Uygulamasını Açın';
    else if (optGroupLabel.includes('BYD')) appName = 'BYD Uygulamasını veya Araç Ekranını Açın';
    else if (optGroupLabel.includes('Renault')) appName = 'My Renault Uygulamasını Açın';
    else if (optGroupLabel.includes('Hyundai')) appName = 'Bluelink Uygulamasını Açın';
    else if (optGroupLabel.includes('Kia')) appName = 'Kia Connect Uygulamasını Açın';
    else if (optGroupLabel.includes('BMW')) appName = 'My BMW Uygulamasını Açın';
    else if (optGroupLabel.includes('Mercedes')) appName = 'Mercedes me Uygulamasını Açın';
    else appName = `${optGroupLabel.split('-')[0].trim()} Uygulamasını Açın`;

    const bType = selOpt.dataset.batteryType || state.batteryType;
    if (bType === 'LFP') {
      els.target100Sub.textContent = 'LFP / %100 Önerilir';
    } else {
      els.target100Sub.textContent = 'Uzun Yol';
    }
  }

  els.selectedModelTag.textContent = modelShort;
  els.guideAppName.textContent = appName;

  // Başlama / Bitiş Saati
  const isDeparture = state.calcMode === 'departure';
  const displayDate = isDeparture ? result.startTime : result.finishTime;
  const friendly = formatFriendlyTime(displayDate, new Date());

  els.startTimeVal.textContent = friendly.time;
  els.resultDayBadge.textContent = friendly.dayLabel;

  // Gece Güvenlik Akımı Bildirim Notu
  if (result.enableNightDrop && result.deltaSoc > 0 && result.scheduleNote) {
    els.nightDropNote.style.display = 'block';
    els.nightDropNoteText.textContent = result.scheduleNote;
  } else {
    els.nightDropNote.style.display = 'none';
  }

  // Yetişmeme Durumu Kontrolü (Departure Modunda - Sade ve Net)
  if (isDeparture && result.isOverdue) {
    els.overdueWarning.style.display = 'flex';
    const earliestTime = formatFriendlyTime(result.earliestFinishIfStartNow, new Date());
    const overdueHrs = Math.floor(result.overdueMinutes / 60);
    const overdueMins = result.overdueMinutes % 60;
    const diffStr = overdueHrs > 0 ? `${overdueHrs} sa ${overdueMins} dk` : `${overdueMins} dakika`;

    els.overdueTitle.textContent = 'Hedef saate yetişmiyor!';
    els.overdueDetail.textContent = `Şu an hemen başlasanız dahi araç en erken ${earliestTime.fullText}'da hazır olur (${diffStr} gecikme).`;
  } else {
    els.overdueWarning.style.display = 'none';
  }

  // Özet Açıklama
  if (isDeparture) {
    if (result.deltaSoc === 0) {
      els.resultSummaryText.innerHTML = `Bataryanız zaten hedef seviyede (<strong>%${result.targetSoc}</strong>)! Şarj etmenize gerek yok.`;
    } else {
      els.resultSummaryText.innerHTML = `Sabah <strong>${state.departureTime}</strong>'da aracınızın <strong>%${result.targetSoc}</strong> hazır olması için şarj <strong>${result.durationHours} saat ${result.durationMinutes} dakika</strong> sürecek.`;
    }
  } else {
    if (result.deltaSoc === 0) {
      els.resultSummaryText.innerHTML = `Bataryanız zaten <strong>%${result.targetSoc}</strong> seviyesinde.`;
    } else {
      els.resultSummaryText.innerHTML = `Şimdi şarja takarsanız araç <strong>${friendly.fullText}</strong>'da <strong>%${result.targetSoc}</strong> seviyesine ulaşacaktır.`;
    }
  }

  // Hızlı İstatistik Matrisi (Ana ekranda Voltajı da gösterir)
  if (result.deltaSoc === 0) {
    els.statDuration.textContent = '0 dk';
    els.statPower.textContent = `${result.gridPowerKw.toFixed(1)} kW (${result.voltage}V)`;
    els.statEnergy.textContent = '0.0 kWh';
    els.statCost.textContent = '0 TL';
  } else {
    els.statDuration.textContent = `${result.durationHours} sa ${result.durationMinutes} dk`;
    els.statPower.textContent = `${result.gridPowerKw.toFixed(1)} kW (${result.voltage}V)`;
    els.statEnergy.textContent = `+${result.neededBatteryKwh.toFixed(1)} kWh`;
    els.statCost.textContent = `~${Math.round(result.costAnalysis.totalCost)} TL`;
  }

  // Batarya Görsel Çubuğu
  const curSoc = Math.min(100, Math.max(0, result.currentSoc));
  const tgtSoc = Math.min(100, Math.max(curSoc, result.targetSoc));
  const delta = tgtSoc - curSoc;

  els.batteryRangeText.textContent = `%${curSoc} ➔ %${tgtSoc}`;
  els.barCurrent.style.width = `${curSoc}%`;
  els.barCurrent.innerHTML = `<span class="bar-tag current-tag">%${curSoc}</span>`;

  els.barTarget.style.width = `${delta}%`;
  els.barTarget.innerHTML = `<span class="bar-tag target-tag">%${tgtSoc}</span>`;

  if (els.valCurrentKm) {
    if (result.wltpRange > 0) {
      els.valCurrentKm.innerHTML = `${Math.round(result.realCurrentKm)} km <span class="km-wltp-sub">(${Math.round(result.wltpCurrentKm)} km WLTP)</span>`;
    } else {
      els.valCurrentKm.textContent = `${Math.round(result.realCurrentKm)} km`;
    }
  }
  if (els.valTargetKm) {
    if (result.wltpRange > 0) {
      els.valTargetKm.innerHTML = `${Math.round(result.realTargetKm)} km <span class="km-wltp-sub">(${Math.round(result.wltpTargetKm)} km WLTP)</span>`;
    } else {
      els.valTargetKm.textContent = `${Math.round(result.realTargetKm)} km`;
    }
  }
  if (els.valAddedKm) {
    if (result.wltpRange > 0) {
      els.valAddedKm.innerHTML = `+${Math.round(result.realAddedKm)} km <span class="km-wltp-sub">(+${Math.round(result.wltpAddedKm)} km WLTP)</span>`;
    } else {
      els.valAddedKm.textContent = `+${Math.round(result.realAddedKm)} km`;
    }
  }

  // Fatura & Maliyet Değerleri (1 km ve 100 km Birlikte)
  const cost = result.costAnalysis;
  els.valStdGridKwh.textContent = `${result.totalGridKwh.toFixed(1)} kWh`;
  els.valStdRate.textContent = `${cost.effectiveRate.toFixed(2)} TL / kWh`;
  if (els.valStdKmCosts) {
    els.valStdKmCosts.innerHTML = `${cost.costPerKm.toFixed(2)} TL/km <small style="font-size:0.75rem; color:var(--text-muted); font-weight: normal;">(${cost.costPer100Km.toFixed(1)} TL/100km)</small>`;
  }
  els.valStdTotal.textContent = `~${cost.totalCost.toFixed(2)} TL`;
  els.tariffSummarySub.textContent = `Birim Fiyat: ${cost.effectiveRate.toFixed(2)} TL / kWh`;

  // Rehber Modal Değerleri
  els.guideTargetTime.textContent = friendly.time;
  if (els.guideTargetAmp) {
    if (result.phases === 3) {
      els.guideTargetAmp.textContent = `${result.amperage}A (3 Faz / ~${result.gridPowerKw.toFixed(0)} kW)`;
    } else if (result.amperage === 32) {
      els.guideTargetAmp.textContent = `32A (~7.4 kW • 32A Mavi Priz / Wallbox)`;
    } else if (result.amperage === 16) {
      els.guideTargetAmp.textContent = `16A (~3.7 kW • 16A Mavi Priz)`;
    } else {
      els.guideTargetAmp.textContent = `${result.amperage}A`;
    }
  }

  // Zamanlama ayarı rehber butonu:
  // Sadece çıkış saatine göre modundaysa, hedef saate YETİŞİYORSA (!result.isOverdue)
  // ve şarj gerekiyorsa (result.deltaSoc > 0) anlamlıdır.
  // Hedef saate yetişmiyorsa araç hemen prize takılmalıdır; geçmiş saate zamanlama kurulamaz.
  const canScheduleInApp = isDeparture && !result.isOverdue && result.deltaSoc > 0;
  if (els.resultActionsRow) {
    els.resultActionsRow.style.display = canScheduleInApp ? 'block' : 'none';
  }
  if (els.btnTeslaGuide) {
    els.btnTeslaGuide.style.display = canScheduleInApp ? 'inline-flex' : 'none';
  }

  // Değerleri kaydet
  saveSettings(state);
}

// Event Listeners
function bindEventListeners() {
  // Üst Başlık Araç Seçici Butonu
  els.btnHeaderVehicle.addEventListener('click', () => {
    els.settingsModal.style.display = 'flex';
  });

  // Ana Ekrandan Hızlı Voltaj Çipleri
  els.voltageChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const v = Number(chip.getAttribute('data-voltage'));
      if (v) {
        state.voltage = v;
        updateVoltageChips();
        updateAmperageUI();
        recalculateAndRender();
      }
    });
  });

  // 1. HESAPLAMA MODU & ZAMAN
  els.modeDepartureBtn.addEventListener('click', () => {
    state.calcMode = 'departure';
    updateModeUI();
    recalculateAndRender();
  });

  els.modeNowBtn.addEventListener('click', () => {
    state.calcMode = 'now';
    updateModeUI();
    recalculateAndRender();
  });

  els.inputDepartureTime.addEventListener('change', (e) => {
    state.departureTime = e.target.value || '07:30';
    updateTimeChips();
    recalculateAndRender();
  });

  els.timeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const timeVal = chip.getAttribute('data-time');
      state.departureTime = timeVal;
      els.inputDepartureTime.value = timeVal;
      updateTimeChips();
      recalculateAndRender();
    });
  });

  // 2. ŞARJ GÜCÜ & CİHAZ PRESETLERİ (10A, 13A, 16A, 7.4 kW, 11 kW, 22 kW)
  const POWER_PRESET_MAP = {
    '10a': { amps: 10, phases: 1 },
    '13a': { amps: 13, phases: 1 },
    '16a': { amps: 16, phases: 1 },
    '7.4kw': { amps: 32, phases: 1 },
    '11kw': { amps: 16, phases: 3 },
    '22kw': { amps: 32, phases: 3 }
  };

  els.powerPresetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      if (POWER_PRESET_MAP[preset]) {
        state.chargingPowerPreset = preset;
        state.amperage = POWER_PRESET_MAP[preset].amps;
        state.chargingPhases = POWER_PRESET_MAP[preset].phases;
        if (els.customAmpBox) els.customAmpBox.style.display = 'none';
        updateAmperageUI();
        recalculateAndRender();
      }
    });
  });

  // Özel Amper & Faz Ayarı Aç / Kapat
  if (els.btnToggleCustomAmp) {
    els.btnToggleCustomAmp.addEventListener('click', () => {
      const isHidden = els.customAmpBox.style.display === 'none';
      els.customAmpBox.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        state.chargingPowerPreset = 'custom';
        updateAmperageUI();
      }
    });
  }

  // Faz Seçici Butonları
  if (els.btnPhase1) {
    els.btnPhase1.addEventListener('click', () => {
      state.chargingPhases = 1;
      state.chargingPowerPreset = 'custom';
      updateAmperageUI();
      recalculateAndRender();
    });
  }
  if (els.btnPhase3) {
    els.btnPhase3.addEventListener('click', () => {
      state.chargingPhases = 3;
      state.chargingPowerPreset = 'custom';
      updateAmperageUI();
      recalculateAndRender();
    });
  }

  // Özel Amper Slider
  if (els.rangeCustomAmp) {
    els.rangeCustomAmp.addEventListener('input', (e) => {
      state.amperage = Number(e.target.value);
      state.chargingPowerPreset = 'custom';
      if (els.customAmpVal) els.customAmpVal.textContent = `${state.amperage}A`;
      updateAmperageUI();
      recalculateAndRender();
    });
  }

  // Gece Güvenlik Akımı Planı Kontrolleri
  els.checkEnableNightDrop.addEventListener('change', (e) => {
    state.enableNightDrop = e.target.checked;
    els.nightDropInputs.style.display = state.enableNightDrop ? 'flex' : 'none';
    recalculateAndRender();
  });

  els.inputNightDropTime.addEventListener('change', (e) => {
    state.nightDropTime = e.target.value || '00:00';
    recalculateAndRender();
  });

  els.selectNightDropAmps.addEventListener('change', (e) => {
    state.nightDropAmps = Number(e.target.value) || 10;
    recalculateAndRender();
  });

  // 3. MEVCUT ŞARJ (+1 / -1 ve Kolay Düzenleme)
  // Tıklandığında tüm metni seçer, silip yazmayı anında mümkün kılar
  const selectOnFocus = (e) => {
    e.target.select();
  };
  els.inputCurrentSoc.addEventListener('focus', selectOnFocus);
  els.inputCurrentSoc.addEventListener('click', selectOnFocus);
  els.inputTargetSoc.addEventListener('focus', selectOnFocus);
  els.inputTargetSoc.addEventListener('click', selectOnFocus);

  // Yazarken kullanıcıyı kısıtlamadan hesapla
  els.inputCurrentSoc.addEventListener('input', (e) => {
    const rawVal = e.target.value.trim();
    if (rawVal === '') return; // Kullanıcı silerken araya girip 0 basma
    let num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      num = Math.max(0, Math.min(100, num));
      state.currentSoc = num;
      els.rangeCurrentSoc.value = num;
      updateCurrentSocChips();
      recalculateAndRender();
    }
  });

  els.inputCurrentSoc.addEventListener('blur', (e) => {
    let num = parseInt(e.target.value, 10);
    if (isNaN(num)) num = 0;
    num = Math.max(0, Math.min(100, num));
    state.currentSoc = num;
    els.inputCurrentSoc.value = num;
    els.rangeCurrentSoc.value = num;
    updateCurrentSocChips();
    recalculateAndRender();
  });

  els.rangeCurrentSoc.addEventListener('input', (e) => {
    state.currentSoc = Number(e.target.value);
    els.inputCurrentSoc.value = state.currentSoc;
    updateCurrentSocChips();
    recalculateAndRender();
  });

  // +/- 1% Adımları
  els.btnCurrentDec.addEventListener('click', () => {
    const nextVal = Math.max(0, state.currentSoc - 1);
    state.currentSoc = nextVal;
    els.inputCurrentSoc.value = nextVal;
    els.rangeCurrentSoc.value = nextVal;
    updateCurrentSocChips();
    recalculateAndRender();
  });

  els.btnCurrentInc.addEventListener('click', () => {
    const nextVal = Math.min(100, state.currentSoc + 1);
    state.currentSoc = nextVal;
    els.inputCurrentSoc.value = nextVal;
    els.rangeCurrentSoc.value = nextVal;
    updateCurrentSocChips();
    recalculateAndRender();
  });

  els.currentChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = Number(chip.getAttribute('data-current'));
      state.currentSoc = val;
      els.inputCurrentSoc.value = val;
      els.rangeCurrentSoc.value = val;
      updateCurrentSocChips();
      recalculateAndRender();
    });
  });

  // 4. HEDEF ŞARJ DEĞİŞİKLİĞİ
  els.inputTargetSoc.addEventListener('input', (e) => {
    const rawVal = e.target.value.trim();
    if (rawVal === '') return;
    let num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      num = Math.max(1, Math.min(100, num));
      state.targetSoc = num;
      updateTargetButtons();
      recalculateAndRender();
    }
  });

  els.inputTargetSoc.addEventListener('blur', (e) => {
    let num = parseInt(e.target.value, 10);
    if (isNaN(num)) num = 100;
    num = Math.max(1, Math.min(100, num));
    state.targetSoc = num;
    els.inputTargetSoc.value = num;
    updateTargetButtons();
    recalculateAndRender();
  });

  els.targetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.getAttribute('data-target'));
      state.targetSoc = val;
      els.inputTargetSoc.value = val;
      updateTargetButtons();
      recalculateAndRender();
    });
  });

  // Fatura Akordeon
  els.btnToggleTariff.addEventListener('click', () => {
    const isHidden = els.tariffContent.style.display === 'none';
    els.tariffContent.style.display = isHidden ? 'flex' : 'none';
    els.btnToggleTariff.classList.toggle('open', isHidden);
  });

  // Ayarlar Modalı Aç / Kapat
  els.btnOpenSettings.addEventListener('click', () => {
    els.settingsModal.style.display = 'flex';
  });

  els.btnCloseSettings.addEventListener('click', () => {
    els.settingsModal.style.display = 'none';
  });

  els.settingsModal.addEventListener('click', (e) => {
    if (e.target === els.settingsModal) {
      els.settingsModal.style.display = 'none';
    }
  });

  // Araç Modeli Seçimi
  els.selectVehicleModel.addEventListener('change', (e) => {
    state.vehicleModel = e.target.value;
    const selectedOption = els.selectVehicleModel.options[els.selectVehicleModel.selectedIndex];
    
    if (selectedOption) {
      const vData = extractVehicleDataFromOption(selectedOption);
      if (vData) {
        state.batteryCapacity = vData.battery;
        state.usableCapacity = vData.usable;
        state.customCapacity = vData.usable;
        state.vehicleWltp = vData.wltp;
        state.catalogConsumption = vData.consumption;
        const activeConsumption = vData.consumption > 0 ? vData.consumption : vData.realConsumption;
        state.realConsumption = activeConsumption;
        state.batteryType = vData.batteryType;
        state.drivetrain = vData.drivetrain;

        if (els.inputCustomCapacity) els.inputCustomCapacity.value = vData.usable;
        if (els.inputUsableBattery) els.inputUsableBattery.value = vData.usable;
        if (els.usableBatteryDisplay) els.usableBatteryDisplay.textContent = `${vData.usable.toFixed(1)} kWh`;
        if (els.inputVehicleWltp) els.inputVehicleWltp.value = vData.wltp;
        if (els.wltpDisplay) els.wltpDisplay.textContent = `${vData.wltp} km`;
        if (els.inputRealConsumption) els.inputRealConsumption.value = activeConsumption;
        if (els.realConsumptionDisplay) els.realConsumptionDisplay.textContent = `${activeConsumption.toFixed(1)} kWh`;
      }
    }

    els.customCapacityGroup.style.display = state.vehicleModel === 'custom' ? 'flex' : 'none';
    recalculateAndRender();
  });

  els.inputCustomCapacity.addEventListener('input', (e) => {
    const val = Number(e.target.value) || 60;
    state.customCapacity = val;
    state.usableCapacity = val;
    state.batteryCapacity = val;
    if (els.inputUsableBattery) els.inputUsableBattery.value = val;
    if (els.usableBatteryDisplay) els.usableBatteryDisplay.textContent = `${val.toFixed(1)} kWh`;
    recalculateAndRender();
  });

  // Gerçek Tüketim Ayarı Dinleyicisi
  if (els.inputRealConsumption) {
    els.inputRealConsumption.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        state.realConsumption = val;
        if (els.realConsumptionDisplay) els.realConsumptionDisplay.textContent = `${val.toFixed(1)} kWh`;
        recalculateAndRender();
      }
    });
  }

  // WLTP Katalog Menzili Dinleyicisi
  if (els.inputVehicleWltp) {
    els.inputVehicleWltp.addEventListener('input', (e) => {
      const wltp = parseInt(e.target.value, 10);
      if (!isNaN(wltp) && wltp >= 0) {
        state.vehicleWltp = wltp;
        if (els.wltpDisplay) els.wltpDisplay.textContent = `${wltp} km`;
        recalculateAndRender();
      }
    });
  }

  // Kullanılabilir Batarya Ayarı Dinleyicisi
  if (els.inputUsableBattery) {
    els.inputUsableBattery.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        state.usableCapacity = val;
        state.customCapacity = val;
        if (els.usableBatteryDisplay) els.usableBatteryDisplay.textContent = `${val.toFixed(1)} kWh`;
        recalculateAndRender();
      }
    });
  }

  // Verimlilik
  els.inputEfficiency.addEventListener('input', (e) => {
    state.efficiency = Number(e.target.value);
    els.efficiencyDisplay.textContent = `%${state.efficiency}`;
    recalculateAndRender();
  });

  // Tarife Modu Sekmeleri (Formül vs Manuel)
  if (els.tabTariffFormula) {
    els.tabTariffFormula.addEventListener('click', () => {
      state.tariffMode = 'formula';
      updateTariffModeUI();
      recalculateAndRender();
    });
  }

  if (els.tabTariffManual) {
    els.tabTariffManual.addEventListener('click', () => {
      state.tariffMode = 'manual';
      state.standardRate = Number(els.inputRateSetting.value) || 3.85;
      updateTariffModeUI();
      recalculateAndRender();
    });
  }

  // Fatura Formül Alanları Dinleyicisi
  els.inputBillAmount.addEventListener('input', () => {
    state.billTotalAmount = Number(els.inputBillAmount.value) || 0;
    if ((state.tariffMode || 'formula') === 'formula') {
      updateFormulaDisplay();
      recalculateAndRender();
    } else {
      updateFormulaDisplay();
    }
  });

  els.inputBillKwh.addEventListener('input', () => {
    state.billTotalKwh = Number(els.inputBillKwh.value) || 1;
    if ((state.tariffMode || 'formula') === 'formula') {
      updateFormulaDisplay();
      recalculateAndRender();
    } else {
      updateFormulaDisplay();
    }
  });

  // Manuel Birim Fiyat Girişi
  els.inputRateSetting.addEventListener('input', (e) => {
    state.tariffMode = 'manual';
    state.standardRate = Number(e.target.value) || 3.85;
    recalculateAndRender();
  });

  // Manuel Birim Fiyat Hazır Çipleri (varsa)
  if (els.manualRateChips) {
    els.manualRateChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const rateVal = Number(chip.getAttribute('data-mrate'));
        if (rateVal) {
          state.tariffMode = 'manual';
          state.standardRate = rateVal;
          els.inputRateSetting.value = rateVal.toFixed(2);
          updateTariffModeUI();
          recalculateAndRender();
        }
      });
    });
  }

  // Varsayılanlara Dön
  els.btnResetDefaults.addEventListener('click', () => {
    if (confirm('Tüm ayarlar varsayılana sıfırlansın mı?')) {
      state = { ...DEFAULT_STATE };
      syncInputsWithState();
      recalculateAndRender();
      showToast('Ayarlar varsayılana sıfırlandı.');
    }
  });

  // Rehber Modalı
  els.btnTeslaGuide.addEventListener('click', () => {
    els.guideModal.style.display = 'flex';
  });

  els.btnCloseGuide.addEventListener('click', () => {
    els.guideModal.style.display = 'none';
  });

  els.guideModal.addEventListener('click', (e) => {
    if (e.target === els.guideModal) {
      els.guideModal.style.display = 'none';
    }
  });
}

// Toast Gösterici
let toastTimeout = null;
function showToast(message) {
  if (toastTimeout) clearTimeout(toastTimeout);
  els.toastMsg.textContent = message;
  els.toastMsg.classList.add('show');
  toastTimeout = setTimeout(() => {
    els.toastMsg.classList.remove('show');
  }, 2500);
}

// PWA Kurulum Yönetimi
function handlePwaInstallPrompt() {
  const ua = (navigator.userAgent || '').toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  let isDismissed = sessionStorage.getItem('dismissed_install_card') === '1';

  // Rehber Modalı Sekme Geçişi
  function setPwaGuideTab(os) {
    if (os === 'ios') {
      if (els.tabPwaIos) els.tabPwaIos.classList.add('active-segment');
      if (els.tabPwaAndroid) els.tabPwaAndroid.classList.remove('active-segment');
      if (els.panelPwaIos) els.panelPwaIos.style.display = 'block';
      if (els.panelPwaAndroid) els.panelPwaAndroid.style.display = 'none';
    } else {
      if (els.tabPwaIos) els.tabPwaIos.classList.remove('active-segment');
      if (els.tabPwaAndroid) els.tabPwaAndroid.classList.add('active-segment');
      if (els.panelPwaIos) els.panelPwaIos.style.display = 'none';
      if (els.panelPwaAndroid) els.panelPwaAndroid.style.display = 'block';
      if (els.btnAndroidDirectInstall) {
        els.btnAndroidDirectInstall.style.display = deferredInstallPrompt ? 'block' : 'none';
      }
    }
  }

  // Rehber Modalını Aç (İstenen işletim sistemine odaklanarak)
  function openPwaGuideModal(preferredOs = null) {
    const targetOs = preferredOs || (isIos ? 'ios' : 'android');
    setPwaGuideTab(targetOs);
    if (els.pwaGuideModal) els.pwaGuideModal.style.display = 'flex';
  }

  // Sekme Tıklama Olayları
  if (els.tabPwaIos) {
    els.tabPwaIos.addEventListener('click', () => setPwaGuideTab('ios'));
  }
  if (els.tabPwaAndroid) {
    els.tabPwaAndroid.addEventListener('click', () => setPwaGuideTab('android'));
  }

  // Ayarlar modalındaki ve Footer'daki kalıcı açma butonları
  if (els.btnOpenInstallGuide) {
    els.btnOpenInstallGuide.addEventListener('click', () => {
      openPwaGuideModal();
    });
  }
  if (els.btnFooterInstallGuide) {
    els.btnFooterInstallGuide.addEventListener('click', () => {
      openPwaGuideModal();
    });
  }

  // Kartı kapatma (çarpı) butonu
  if (els.btnDismissInstall) {
    els.btnDismissInstall.addEventListener('click', () => {
      if (els.installCard) els.installCard.style.display = 'none';
      sessionStorage.setItem('dismissed_install_card', '1');
      isDismissed = true;
    });
  }

  // PWA Rehber Modalı Kapatma Olayları
  if (els.btnClosePwaGuide) {
    els.btnClosePwaGuide.addEventListener('click', () => {
      if (els.pwaGuideModal) els.pwaGuideModal.style.display = 'none';
    });
  }
  if (els.btnDismissPwaGuide) {
    els.btnDismissPwaGuide.addEventListener('click', () => {
      if (els.pwaGuideModal) els.pwaGuideModal.style.display = 'none';
    });
  }
  if (els.pwaGuideModal) {
    els.pwaGuideModal.addEventListener('click', (e) => {
      if (e.target === els.pwaGuideModal) {
        els.pwaGuideModal.style.display = 'none';
      }
    });
  }

  // Android Tek Tıkla Yükleme Butonu (Rehber modalı içi)
  if (els.btnAndroidDirectInstall) {
    els.btnAndroidDirectInstall.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Uygulama başarıyla kuruldu! 🎉');
        if (els.pwaGuideModal) els.pwaGuideModal.style.display = 'none';
        if (els.installCard) els.installCard.style.display = 'none';
      }
      deferredInstallPrompt = null;
      if (els.btnAndroidDirectInstall) els.btnAndroidDirectInstall.style.display = 'none';
    });
  }

  // Eğer zaten ana ekrandan açılmışsa (Standalone PWA)
  if (isStandalone) {
    if (els.installCard) els.installCard.style.display = 'none';
    if (els.btnFooterInstallGuide) els.btnFooterInstallGuide.style.display = 'none';
    return;
  }

  // iOS Safari için ana ekran kartı
  if (isIos) {
    if (!isDismissed && els.installCard) {
      if (els.installTitle) els.installTitle.textContent = "iPhone'a Yükleyin";
      if (els.installDesc) els.installDesc.textContent = "Safari'den Ana Ekrana Ekleyerek uygulama gibi tam ekran kullanın.";
      if (els.btnInstallPwa) els.btnInstallPwa.textContent = "Nasıl Yapılır? 📲";
      els.installCard.style.display = 'flex';
    }

    if (els.btnInstallPwa) {
      els.btnInstallPwa.addEventListener('click', () => {
        openPwaGuideModal('ios');
      });
    }
    return;
  }

  // Android / Chromium standart beforeinstallprompt desteği
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (els.btnAndroidDirectInstall) {
      els.btnAndroidDirectInstall.style.display = 'block';
    }
    if (!isDismissed && els.installCard) {
      if (els.installTitle) els.installTitle.textContent = "Uygulama Olarak Ekleyin";
      if (els.installDesc) els.installDesc.textContent = "Ana ekrana ekleyerek internet olmadan da hızlıca açabilirsiniz.";
      if (els.btnInstallPwa) els.btnInstallPwa.textContent = "Ana Ekrana Ekle";
      els.installCard.style.display = 'flex';
    }
  });

  if (els.btnInstallPwa) {
    els.btnInstallPwa.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Uygulama başarıyla kuruldu! 🎉');
        }
        deferredInstallPrompt = null;
        if (els.installCard) els.installCard.style.display = 'none';
      } else {
        openPwaGuideModal('android');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (els.installCard) els.installCard.style.display = 'none';
    if (els.pwaGuideModal) els.pwaGuideModal.style.display = 'none';
  });
}

// Service Worker Kaydı
function registerServiceWorker() {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('EV Şarj PWA Service Worker aktif:', reg.scope);
        })
        .catch(err => {
          console.warn('Service Worker kaydı yapılamadı:', err);
        });
    });
  }
}

// Başlat
document.addEventListener('DOMContentLoaded', initApp);
