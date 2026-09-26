// js/app.js - Ana Uygulama Mantığı ve UI Kontrolcüsü
import { loadSettings, saveSettings, VEHICLE_PRESETS, DEFAULT_STATE } from './storage.js';
import { calculateCharging, formatFriendlyTime } from './calculator.js';

// Mevcut durum
let state = loadSettings();
let deferredInstallPrompt = null;

// DOM Elementleri
const els = {
  // Başlık
  selectedModelTag: document.getElementById('selected-model-tag'),
  btnOpenSettings: document.getElementById('btn-open-settings'),
  
  // Sonuç Kartı
  resultModeLabel: document.getElementById('result-mode-label'),
  resultDayBadge: document.getElementById('result-day-badge'),
  startTimeVal: document.getElementById('start-time-val'),
  startTimeSuffix: document.getElementById('start-time-suffix'),
  overdueWarning: document.getElementById('overdue-warning'),
  overdueTitle: document.getElementById('overdue-title'),
  overdueDetail: document.getElementById('overdue-detail'),
  resultSummaryText: document.getElementById('result-summary-text'),
  statDuration: document.getElementById('stat-duration'),
  statPower: document.getElementById('stat-power'),
  statEnergy: document.getElementById('stat-energy'),
  statSpeed: document.getElementById('stat-speed'),
  btnTeslaGuide: document.getElementById('btn-tesla-guide'),
  btnCopyResult: document.getElementById('btn-copy-result'),

  // Batarya Görsel Çubuğu
  batteryRangeText: document.getElementById('battery-range-text'),
  barCurrent: document.getElementById('bar-current'),
  barTarget: document.getElementById('bar-target'),

  // Mevcut Şarj Kontrolleri
  inputCurrentSoc: document.getElementById('input-current-soc'),
  rangeCurrentSoc: document.getElementById('range-current-soc'),
  btnCurrentDec: document.getElementById('btn-current-dec'),
  btnCurrentInc: document.getElementById('btn-current-inc'),
  currentChips: document.querySelectorAll('.chip[data-current]'),

  // Hedef Şarj Kontrolleri
  inputTargetSoc: document.getElementById('input-target-soc'),
  targetButtons: document.querySelectorAll('.chip-target[data-target]'),

  // Amper Kontrolleri
  ampPowerLabel: document.getElementById('amp-power-label'),
  amp13Btn: document.getElementById('amp-13-btn'),
  amp10Btn: document.getElementById('amp-10-btn'),
  ampOtherBtn: document.getElementById('amp-other-btn'),
  customAmpBox: document.getElementById('custom-amp-box'),
  rangeCustomAmp: document.getElementById('range-custom-amp'),
  customAmpVal: document.getElementById('custom-amp-val'),

  // Hesaplama Modu ve Çıkış Saati
  modeDepartureBtn: document.getElementById('mode-departure-btn'),
  modeNowBtn: document.getElementById('mode-now-btn'),
  departurePickerContainer: document.getElementById('departure-picker-container'),
  inputDepartureTime: document.getElementById('input-departure-time'),
  timeChips: document.querySelectorAll('.chip[data-time]'),

  // Gece Tarifesi
  btnToggleTariff: document.getElementById('btn-toggle-tariff'),
  tariffContent: document.getElementById('tariff-content'),
  tariffNightPct: document.getElementById('tariff-night-pct'),
  tariffMeterFill: document.getElementById('tariff-meter-fill'),
  valTariffNight: document.getElementById('val-tariff-night'),
  valTariffDay: document.getElementById('val-tariff-day'),
  valTariffPeak: document.getElementById('val-tariff-peak'),
  valTariffTotal: document.getElementById('val-tariff-total'),
  tariffSavingsNote: document.getElementById('tariff-savings-note'),

  // Modallar
  settingsModal: document.getElementById('settings-modal'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  selectVehicleModel: document.getElementById('select-vehicle-model'),
  customCapacityGroup: document.getElementById('custom-capacity-group'),
  inputCustomCapacity: document.getElementById('input-custom-capacity'),
  inputVoltage: document.getElementById('input-voltage'),
  voltageDisplay: document.getElementById('voltage-display'),
  inputEfficiency: document.getElementById('input-efficiency'),
  efficiencyDisplay: document.getElementById('efficiency-display'),
  inputRateNight: document.getElementById('input-rate-night'),
  inputRateDay: document.getElementById('input-rate-day'),
  inputRatePeak: document.getElementById('input-rate-peak'),
  btnResetDefaults: document.getElementById('btn-reset-defaults'),

  // Tesla Guide Modal
  guideModal: document.getElementById('guide-modal'),
  btnCloseGuide: document.getElementById('btn-close-guide'),
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

  // Her 30 saniyede bir otomatik yenile (saat ilerledikçe başlama vaktini güncel tutar)
  setInterval(() => {
    recalculateAndRender();
  }, 30000);
}

// State'deki değerleri form elemanlarına yükle
function syncInputsWithState() {
  // Mevcut Şarj
  els.inputCurrentSoc.value = state.currentSoc;
  els.rangeCurrentSoc.value = state.currentSoc;
  updateCurrentSocChips();

  // Hedef Şarj
  els.inputTargetSoc.value = state.targetSoc;
  updateTargetButtons();

  // Amper
  updateAmperageUI();

  // Mod & Çıkış Saati
  updateModeUI();
  els.inputDepartureTime.value = state.departureTime || '07:30';
  updateTimeChips();

  // Ayarlar Modal Elemanları
  els.selectVehicleModel.value = state.vehicleModel || 'model-y-rwd';
  els.inputCustomCapacity.value = state.customCapacity || 60;
  els.customCapacityGroup.style.display = state.vehicleModel === 'custom' ? 'flex' : 'none';

  els.inputVoltage.value = state.voltage || 230;
  els.voltageDisplay.textContent = `${state.voltage || 230} V`;

  els.inputEfficiency.value = state.efficiency || 88;
  els.efficiencyDisplay.textContent = `%${state.efficiency || 88}`;

  els.inputRateNight.value = state.tariffNightRate || 1.45;
  els.inputRateDay.value = state.tariffDayRate || 2.80;
  els.inputRatePeak.value = state.tariffPeakRate || 4.30;
}

// Amper buton ve slider görünümünü güncelle
function updateAmperageUI() {
  const amp = Number(state.amperage) || 13;
  const kw = ((state.voltage * amp) / 1000).toFixed(1);
  els.ampPowerLabel.textContent = `${amp}A (~${kw} kW)`;

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

// Mod görünümünü güncelle
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

// Hesapla ve Ekrana Bas
function recalculateAndRender() {
  const result = calculateCharging(state, new Date());

  // Üst Başlık Araba Modeli
  let modelName = 'Model Y RWD (60 kWh)';
  if (state.vehicleModel === 'custom') {
    modelName = `Özel (${result.capacity} kWh)`;
  } else if (VEHICLE_PRESETS[state.vehicleModel]) {
    modelName = VEHICLE_PRESETS[state.vehicleModel].name;
  }
  els.selectedModelTag.textContent = modelName;

  // Başlama / Bitiş Saati
  const isDeparture = state.calcMode === 'departure';
  const displayDate = isDeparture ? result.startTime : result.finishTime;
  const friendly = formatFriendlyTime(displayDate, new Date());

  els.startTimeVal.textContent = friendly.time;
  els.resultDayBadge.textContent = friendly.dayLabel;

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

  // Hızlı İstatistik Matrisi
  if (result.deltaSoc === 0) {
    els.statDuration.textContent = '0 dk';
    els.statPower.textContent = `${result.gridPowerKw.toFixed(1)} kW`;
    els.statEnergy.textContent = '0.0 kWh';
    els.statSpeed.textContent = '0 km/sa';
  } else {
    els.statDuration.textContent = `${result.durationHours} sa ${result.durationMinutes} dk`;
    els.statPower.textContent = `${result.gridPowerKw.toFixed(1)} kW`;
    els.statEnergy.textContent = `+${result.neededBatteryKwh.toFixed(1)} kWh`;
    els.statSpeed.textContent = `~${Math.round(result.kmPerHour)} km/sa`;
  }

  // Batarya Görsel Çubuğu
  const curSoc = Math.min(100, Math.max(0, result.currentSoc));
  const tgtSoc = Math.min(100, Math.max(curSoc, result.targetSoc));
  const delta = tgtSoc - curSoc;

  els.batteryRangeText.textContent = `${curSoc}% ➔ ${tgtSoc}% (+${delta}%)`;
  els.barCurrent.style.width = `${curSoc}%`;
  els.barCurrent.innerHTML = `<span class="bar-tag current-tag">%${curSoc}</span>`;

  els.barTarget.style.width = `${delta}%`;
  els.barTarget.innerHTML = `<span class="bar-tag target-tag">%${tgtSoc}</span>`;

  // Gece Tarifesi Kartı
  const t = result.tariffAnalysis;
  els.tariffNightPct.textContent = `%${t.nightPercent}`;
  els.tariffMeterFill.style.width = `${t.nightPercent}%`;
  els.valTariffNight.textContent = `${t.nightKwh} kWh`;
  els.valTariffDay.textContent = `${t.dayKwh} kWh`;
  els.valTariffPeak.textContent = `${t.peakKwh} kWh`;
  els.valTariffTotal.textContent = `~${t.estimatedTotalCost.toFixed(2)} TL`;

  if (t.potentialSavings > 0) {
    els.tariffSavingsNote.style.display = 'block';
    els.tariffSavingsNote.innerHTML = `💡 Gece tarifesi sayesinde yaklaşık <strong>~${t.potentialSavings.toFixed(1)} TL</strong> tasarruf ediyorsunuz.`;
  } else {
    els.tariffSavingsNote.style.display = 'none';
  }

  // Tesla Rehber Modal Değerleri
  els.guideTargetTime.textContent = friendly.time;
  els.guideTargetAmp.textContent = `${result.amperage}A`;

  // Değerleri kaydet
  saveSettings(state);
}

// Event Listeners
function bindEventListeners() {
  // Mevcut Şarj Değişikliği
  const onCurrentSocChange = (val) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;
    num = Math.max(0, Math.min(100, num));
    state.currentSoc = num;
    els.inputCurrentSoc.value = num;
    els.rangeCurrentSoc.value = num;
    updateCurrentSocChips();
    recalculateAndRender();
  };

  els.inputCurrentSoc.addEventListener('input', (e) => onCurrentSocChange(e.target.value));
  els.rangeCurrentSoc.addEventListener('input', (e) => onCurrentSocChange(e.target.value));

  els.btnCurrentDec.addEventListener('click', () => {
    onCurrentSocChange(state.currentSoc - 5);
  });
  els.btnCurrentInc.addEventListener('click', () => {
    onCurrentSocChange(state.currentSoc + 5);
  });

  els.currentChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = Number(chip.getAttribute('data-current'));
      onCurrentSocChange(val);
    });
  });

  // Hedef Şarj Değişikliği
  const onTargetSocChange = (val) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 100;
    num = Math.max(1, Math.min(100, num));
    state.targetSoc = num;
    els.inputTargetSoc.value = num;
    updateTargetButtons();
    recalculateAndRender();
  };

  els.inputTargetSoc.addEventListener('input', (e) => onTargetSocChange(e.target.value));

  els.targetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.getAttribute('data-target'));
      onTargetSocChange(val);
    });
  });

  // Amper Butonları (13A & 10A & Diğer)
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

  // Hesaplama Modu
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

  // Çıkış Saati
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

  // Gece Tarifesi Akordeon
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

  // Voltaj
  els.inputVoltage.addEventListener('input', (e) => {
    state.voltage = Number(e.target.value);
    els.voltageDisplay.textContent = `${state.voltage} V`;
    recalculateAndRender();
  });

  // Verimlilik
  els.inputEfficiency.addEventListener('input', (e) => {
    state.efficiency = Number(e.target.value);
    els.efficiencyDisplay.textContent = `%${state.efficiency}`;
    recalculateAndRender();
  });

  // Tarife Fiyatları
  els.inputRateNight.addEventListener('input', (e) => {
    state.tariffNightRate = Number(e.target.value) || 1.45;
    recalculateAndRender();
  });
  els.inputRateDay.addEventListener('input', (e) => {
    state.tariffDayRate = Number(e.target.value) || 2.80;
    recalculateAndRender();
  });
  els.inputRatePeak.addEventListener('input', (e) => {
    state.tariffPeakRate = Number(e.target.value) || 4.30;
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

  // Tesla Rehber Modalı
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
    const textToCopy = isDeparture
      ? `Tesla Şarj: Sabah ${state.departureTime}'da %${state.targetSoc} olması için saat ${els.startTimeVal.textContent}'de (${els.resultDayBadge.textContent.toLowerCase()}) ${state.amperage}A ile şarja başlatmalısınız.`
      : `Tesla Şarj: Şu an ${state.amperage}A ile şarja başlarsanız saat ${els.startTimeVal.textContent}'de %${state.targetSoc} dolmuş olur.`;

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
          console.log('Tesla Şarj PWA Service Worker aktif:', reg.scope);
        })
        .catch(err => {
          console.warn('Service Worker kaydı yapılamadı:', err);
        });
    });
  }
}

// Başlat
document.addEventListener('DOMContentLoaded', initApp);
