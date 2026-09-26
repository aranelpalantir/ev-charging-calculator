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
  btnTeslaGuide: document.getElementById('btn-tesla-guide'),
  btnCopyResult: document.getElementById('btn-copy-result'),

  // 1. Sıra: Hesaplama Modu ve Çıkış Saati
  modeDepartureBtn: document.getElementById('mode-departure-btn'),
  modeNowBtn: document.getElementById('mode-now-btn'),
  departurePickerContainer: document.getElementById('departure-picker-container'),
  inputDepartureTime: document.getElementById('input-departure-time'),
  timeChips: document.querySelectorAll('.chip[data-time]'),

  // 2. Sıra: Amper ve Voltaj Göstergesi
  mainVoltageChip: document.getElementById('main-voltage-chip'),
  ampPowerLabel: document.getElementById('amp-power-label'),
  mainVoltageTag: document.getElementById('main-voltage-tag'),
  amp13Btn: document.getElementById('amp-13-btn'),
  amp10Btn: document.getElementById('amp-10-btn'),
  ampOtherBtn: document.getElementById('amp-other-btn'),
  customAmpBox: document.getElementById('custom-amp-box'),
  rangeCustomAmp: document.getElementById('range-custom-amp'),
  customAmpVal: document.getElementById('custom-amp-val'),

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

  // Batarya Görsel Çubuğu
  batteryRangeText: document.getElementById('battery-range-text'),
  barCurrent: document.getElementById('bar-current'),
  barTarget: document.getElementById('bar-target'),

  // Elektrik Faturası & Maliyet Kartı
  btnToggleTariff: document.getElementById('btn-toggle-tariff'),
  tariffContent: document.getElementById('tariff-content'),
  tariffSummarySub: document.getElementById('tariff-summary-sub'),
  valStdGridKwh: document.getElementById('val-std-grid-kwh'),
  valStdRate: document.getElementById('val-std-rate'),
  valStd100km: document.getElementById('val-std-100km'),
  valStdTotal: document.getElementById('val-std-total'),

  // Ayarlar Modalı
  settingsModal: document.getElementById('settings-modal'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  selectVehicleModel: document.getElementById('select-vehicle-model'),
  customCapacityGroup: document.getElementById('custom-capacity-group'),
  inputCustomCapacity: document.getElementById('input-custom-capacity'),
  inputVoltage: document.getElementById('input-voltage'),
  voltageDisplay: document.getElementById('voltage-display'),
  inputEfficiency: document.getElementById('input-efficiency'),
  efficiencyDisplay: document.getElementById('efficiency-display'),
  
  // Parametrik Fatura Formül Elemanları
  inputBillAmount: document.getElementById('input-bill-amount'),
  inputBillKwh: document.getElementById('input-bill-kwh'),
  formulaRateDisplay: document.getElementById('formula-rate-display'),
  inputRateSetting: document.getElementById('input-rate-setting'),
  btnResetDefaults: document.getElementById('btn-reset-defaults'),

  // Rehber Modalı
  guideModal: document.getElementById('guide-modal'),
  btnCloseGuide: document.getElementById('btn-close-guide'),
  guideAppName: document.getElementById('guide-app-name'),
  guideTargetTime: document.getElementById('guide-target-time'),
  guideTargetAmp: document.getElementById('guide-target-amp'),

  // PWA & Toast
  installCard: document.getElementById('install-card'),
  btnInstallPwa: document.getElementById('btn-install-pwa'),
  toastMsg: document.getElementById('toast-msg')
};

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

  // 2. Amper & Gece Düşürme Planı
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
  els.selectVehicleModel.value = state.vehicleModel || 'tesla-my-rwd';
  els.inputCustomCapacity.value = state.customCapacity || 60;
  els.customCapacityGroup.style.display = state.vehicleModel === 'custom' ? 'flex' : 'none';

  const v = Math.min(235, Math.max(205, Number(state.voltage) || 220));
  state.voltage = v;
  els.inputVoltage.value = v;
  els.voltageDisplay.textContent = `${v} V`;
  els.mainVoltageTag.textContent = `• ${v}V`;

  els.inputEfficiency.value = state.efficiency || 88;
  els.efficiencyDisplay.textContent = `%${state.efficiency || 88}`;

  // Formül alanları
  els.inputBillAmount.value = state.billTotalAmount || 1520.30;
  els.inputBillKwh.value = state.billTotalKwh || 395.68;
  updateFormulaDisplay();
}

// Amper ve Güç Göstergesi
function updateAmperageUI() {
  const amp = Number(state.amperage) || 13;
  const kw = ((state.voltage * amp) / 1000).toFixed(1);
  els.ampPowerLabel.textContent = `${amp}A (~${kw} kW)`;
  els.mainVoltageTag.textContent = `• ${state.voltage || 220}V`;

  els.amp13Btn.classList.toggle('active-segment', amp === 13);
  els.amp10Btn.classList.toggle('active-segment', amp === 10);
  els.ampOtherBtn.classList.toggle('active-segment', amp !== 13 && amp !== 10);

  if (amp !== 13 && amp !== 10) {
    els.customAmpBox.style.display = 'flex';
    els.rangeCustomAmp.value = amp;
    els.customAmpVal.textContent = `${amp}A`;
  } else {
    els.customAmpBox.style.display = 'none';
  }
}

// Hesaplama Modu ve Rehber Butonu Görünürlüğü
function updateModeUI() {
  const isDeparture = state.calcMode === 'departure';
  els.modeDepartureBtn.classList.toggle('active-segment', isDeparture);
  els.modeNowBtn.classList.toggle('active-segment', !isDeparture);
  els.departurePickerContainer.style.display = isDeparture ? 'flex' : 'none';
  els.resultModeLabel.textContent = isDeparture ? 'ŞARJA BAŞLAMA SAATİ' : 'ŞARJIN BİTİŞ SAATİ';

  // Zamanlama ayarı rehber butonu yalnızca çıkış saatine göre modunda anlamlıdır
  els.btnTeslaGuide.style.display = isDeparture ? 'inline-flex' : 'none';
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
  let calcRate = 3.84;
  if (kwh > 0 && amount > 0) {
    calcRate = Number((amount / kwh).toFixed(2));
  }
  els.formulaRateDisplay.textContent = `${calcRate.toFixed(2)} TL / kWh`;
  els.inputRateSetting.value = calcRate.toFixed(2);
  state.standardRate = calcRate;
}

// Hesapla ve Ekrana Bas
function recalculateAndRender() {
  const result = calculateCharging(state, new Date());

  // Üst Başlık Araba Modeli ve Uygulama Adı
  let modelShort = 'Model Y Standart';
  let appName = 'Araç Mobil Uygulamasını Açın';
  
  if (state.vehicleModel === 'custom') {
    modelShort = `Özel (${result.capacity} kWh)`;
    appName = 'Araç Mobil Uygulamasını Açın';
  } else if (VEHICLE_PRESETS[state.vehicleModel]) {
    const v = VEHICLE_PRESETS[state.vehicleModel];
    modelShort = v.shortName;
    if (v.brand === 'Tesla') appName = 'Tesla Mobil Uygulamasını Açın';
    else if (v.brand === 'Togg') appName = 'Trumore Uygulamasını Açın';
    else if (v.brand === 'BYD') appName = 'BYD Uygulamasını veya Araç Ekranını Açın';
    else if (v.brand === 'Renault') appName = 'My Renault Uygulamasını Açın';
    else appName = `${v.brand} Uygulamasını Açın`;

    if (v.batteryType === 'LFP') {
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

  // Yetişmeme Durumu Kontrolü (Departure Modunda)
  if (isDeparture && result.isOverdue) {
    els.overdueWarning.style.display = 'flex';
    const earliestTime = formatFriendlyTime(result.earliestFinishIfStartNow, new Date());
    const overdueHrs = Math.floor(result.overdueMinutes / 60);
    const overdueMins = result.overdueMinutes % 60;
    const diffStr = overdueHrs > 0 ? `${overdueHrs} sa ${overdueMins} dk` : `${overdueMins} dakika`;

    els.overdueTitle.textContent = 'Hedef saate yetişmiyor!';
    let detailText = `Şu an hemen başlasanız dahi araç en erken ${earliestTime.fullText}'da hazır olur (${diffStr} gecikme).`;
    if (result.recommendedAmpsForDeadline && result.recommendedAmpsForDeadline <= 32) {
      detailText += ` Yetişmek için akımı en az ${result.recommendedAmpsForDeadline}A yapmalısınız.`;
    }
    els.overdueDetail.textContent = detailText;
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

  els.batteryRangeText.textContent = `${curSoc}% ➔ ${tgtSoc}% (+${Math.round(result.addedKm)} km)`;
  els.barCurrent.style.width = `${curSoc}%`;
  els.barCurrent.innerHTML = `<span class="bar-tag current-tag">%${curSoc}</span>`;

  els.barTarget.style.width = `${delta}%`;
  els.barTarget.innerHTML = `<span class="bar-tag target-tag">%${tgtSoc}</span>`;

  // Fatura & Maliyet Değerleri (Sade)
  const cost = result.costAnalysis;
  els.valStdGridKwh.textContent = `${result.totalGridKwh.toFixed(1)} kWh`;
  els.valStdRate.textContent = `${cost.effectiveRate.toFixed(2)} TL / kWh`;
  els.valStd100km.textContent = `~${cost.costPer100Km} TL / 100km`;
  els.valStdTotal.textContent = `~${cost.totalCost.toFixed(2)} TL`;
  els.tariffSummarySub.textContent = `Birim Fiyat: ${cost.effectiveRate.toFixed(2)} TL / kWh`;

  // Rehber Modal Değerleri
  els.guideTargetTime.textContent = friendly.time;
  els.guideTargetAmp.textContent = `${result.amperage}A`;

  // Değerleri kaydet
  saveSettings(state);
}

// Event Listeners
function bindEventListeners() {
  // Üst Başlık Araç Seçici Butonu
  els.btnHeaderVehicle.addEventListener('click', () => {
    els.settingsModal.style.display = 'flex';
  });

  // Voltaj etiketine tıklandığında ayarları aç
  els.mainVoltageChip.addEventListener('click', () => {
    els.settingsModal.style.display = 'flex';
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

  // 2. AMPER BUTONLARI (13A & 10A & Diğer)
  els.amp13Btn.addEventListener('click', () => {
    state.amperage = 13;
    updateAmperageUI();
    recalculateAndRender();
  });

  els.amp10Btn.addEventListener('click', () => {
    state.amperage = 10;
    updateAmperageUI();
    recalculateAndRender();
  });

  els.ampOtherBtn.addEventListener('click', () => {
    els.customAmpBox.style.display = 'flex';
    els.amp13Btn.classList.remove('active-segment');
    els.amp10Btn.classList.remove('active-segment');
    els.ampOtherBtn.classList.add('active-segment');
  });

  els.rangeCustomAmp.addEventListener('input', (e) => {
    state.amperage = Number(e.target.value);
    els.customAmpVal.textContent = `${state.amperage}A`;
    updateAmperageUI();
    recalculateAndRender();
  });

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
    els.customCapacityGroup.style.display = state.vehicleModel === 'custom' ? 'flex' : 'none';
    recalculateAndRender();
  });

  els.inputCustomCapacity.addEventListener('input', (e) => {
    state.customCapacity = Number(e.target.value) || 60;
    recalculateAndRender();
  });

  // Voltaj (205V - 235V)
  els.inputVoltage.addEventListener('input', (e) => {
    state.voltage = Number(e.target.value);
    els.voltageDisplay.textContent = `${state.voltage} V`;
    els.mainVoltageTag.textContent = `• ${state.voltage}V`;
    updateAmperageUI();
    recalculateAndRender();
  });

  // Verimlilik
  els.inputEfficiency.addEventListener('input', (e) => {
    state.efficiency = Number(e.target.value);
    els.efficiencyDisplay.textContent = `%${state.efficiency}`;
    recalculateAndRender();
  });

  // Fatura Formül Alanları Dinleyicisi
  els.inputBillAmount.addEventListener('input', () => {
    state.billTotalAmount = Number(els.inputBillAmount.value) || 0;
    updateFormulaDisplay();
    recalculateAndRender();
  });

  els.inputBillKwh.addEventListener('input', () => {
    state.billTotalKwh = Number(els.inputBillKwh.value) || 1;
    updateFormulaDisplay();
    recalculateAndRender();
  });

  els.inputRateSetting.addEventListener('input', (e) => {
    state.standardRate = Number(e.target.value) || 3.84;
    els.formulaRateDisplay.textContent = `${state.standardRate.toFixed(2)} TL / kWh`;
    recalculateAndRender();
  });

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

  // Kopyalama Butonu
  els.btnCopyResult.addEventListener('click', () => {
    const isDeparture = state.calcMode === 'departure';
    const vehicleName = VEHICLE_PRESETS[state.vehicleModel] ? VEHICLE_PRESETS[state.vehicleModel].name : 'Araç';
    const textToCopy = isDeparture
      ? `${vehicleName} Şarj Planı: Sabah ${state.departureTime}'da %${state.targetSoc} olması için saat ${els.startTimeVal.textContent}'de (${els.resultDayBadge.textContent.toLowerCase()}) ${state.amperage}A ile şarja başlatmalısınız.`
      : `${vehicleName} Şarj: Şu an ${state.amperage}A ile şarja başlarsanız saat ${els.startTimeVal.textContent}'de %${state.targetSoc} dolmuş olur.`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Şarj planı panoya kopyalandı! 📋');
      }).catch(() => {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
  });
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('Şarj planı panoya kopyalandı! 📋');
  } catch (err) {
    showToast('Kopyalama başarısız oldu.');
  }
  document.body.removeChild(textArea);
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
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    els.installCard.style.display = 'flex';
  });

  els.btnInstallPwa.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Uygulama başarıyla kuruldu! 🎉');
    }
    deferredInstallPrompt = null;
    els.installCard.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    els.installCard.style.display = 'none';
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
