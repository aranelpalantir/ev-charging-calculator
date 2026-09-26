# ⚡ EV Şarj Zamanlayıcı

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA: Offline Ready](https://img.shields.io/badge/PWA-Offline%20Ready-00d2ff.svg?logo=pwa&logoColor=white)](#)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20with-Cloudflare%20Pages-F38020.svg?logo=cloudflare)](https://ev-sarj.pages.dev/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-ev--sarj.pages.dev-success.svg)](https://ev-sarj.pages.dev/)
[![Mobile: iOS & Android](https://img.shields.io/badge/Mobile-iOS%20%7C%20Android-black.svg?logo=apple&logoColor=white)](#)
[![AI-Assisted](https://img.shields.io/badge/Developed%20with-AI%20Pair%20Programming-8A2BE2.svg)](#)

> *"Sabah 07:30'da yola çıkacağım, batarya %80 olsun. Peki şarjı akşam tam saat kaçta başlatmalıyım?"*

**EV Şarj Zamanlayıcı**, ev prizinden (10A - 13A Schuko) veya Wallbox üzerinden elektrikli araç şarj edenler için geliştirilmiş parametrik şarj başlama saati, gece akımı planlayıcı ve elektrik faturası maliyet hesaplama web uygulamasıdır.

Ev prizindeki şebeke voltaj düşüşünü (**215V - 220V**), şarj dönüştürme kayıplarını ve uykudayken priz güvenliği için akım düşürme adımlarını hesaba katarak sabah belirlediğiniz saatte aracınızın tam zamanında hazır olması için şarja saat kaçta başlamanız gerektiğini geriye doğru hesaplar.

---

## 🌐 Canlı Kullanım (Web & Mobil)

Uygulamaya tarayıcınızdan veya telefonunuzdan doğrudan erişebilirsiniz:
- 🚀 **Cloudflare Pages (Birincil):** **[https://ev-sarj.pages.dev/](https://ev-sarj.pages.dev/)**
- 🐙 **GitHub Pages (Yedek):** **[https://aranelpalantir.github.io/ev-charging-calculator/](https://aranelpalantir.github.io/ev-charging-calculator/)**

*(iPhone Safari veya Android Chrome'da **"Ana Ekrana Ekle"** diyerek tam ekran ve kapalı otoparkta bile internetsiz açılan yerel mobil uygulama olarak kullanabilirsiniz.)*

---

## ✨ Öne Çıkan Özellikler

- ⏰ **Çıkış Saatine Göre Geriye Doğru Zamanlama:**
  - Sabah evden çıkış saatinizi (örneğin **07:30**) ve hedef şarj yüzdenizi (**%80** veya **%100**) seçin. Sistem tüm voltaj ve şarj kayıplarını hesaplayarak aracı tam saat kaçta şarja takmanız veya araç içi zamanlayıcıyı kaça kurmanız gerektiğini gösterir.
- 🛡️ **İki Fazlı Gece Güvenlik Akımı Planı (13A ➔ 10A):**
  - Şarja akşam prizin başında uyanıkken **13A** ile başlayıp, gece uyurken priz ve kablo güvenliği için belirlediğiniz saatte (örneğin **00:00**) akımı **10A**'e düşürmeyi planlayabilirsiniz. Uygulama bu iki fazlı güç eğrisini geriye doğru hesaplayarak tam başlama saatini belirler.
- 🔌 **Gerçekçi Şebeke Voltajı & Kayıp Oranı (215V):**
  - Türkiye'deki ev prizlerinde yük altındaki voltaj düşüşünü yansıtan **215V** varsayılan voltaj değeri ve şarj kayıp katsayısı ile gerçeğe en yakın süre tahmini.
- 💰 **Şeffaf Fatura Formülü:**
  - `Fatura Tutarı (TL) ÷ Toplam Tüketim (kWh) = Birim Fiyat` formülüyle faturanızdaki net tutarı anında girip şarj maliyetinizi ve km başına tüketim tutarınızı hesaplayabilirsiniz.
- 🚗 **Geniş Elektrikli Araç (EV) Veritabanı:**
  - **Tesla:** Yeni Model Y Juniper (Standart 60.5 kWh kullanılabilir, Long Range, Performance), Model 3 Highland.
  - **Togg:** T10X V1 Standart Menzil, T10X V2 Uzun Menzil.
  - **BYD, Renault, MG, Hyundai, Kia, Volvo, BMW, Mercedes** ve özel batarya giriş desteği.
- 💾 **Değerleri Otomatik Hatırlama (`localStorage`):**
  - Aracınız, priz akımınız, sabah çıkış saatiniz ve şebeke voltajınız cihazınızda otomatik olarak saklanır; her girişte yeniden girmek zorunda kalmazsınız.
- 📲 **Mobil Kurulum & Çevrimdışı Çalışma:**
  - Ana ekrana eklenebilir; kapalı otoparkta veya internetsiz (çevrimdışı) ortamda bile yerel bir uygulama gibi anında açılır.

---

## ⚡ Desteklenen Şarj Güçleri ve Cihazlar

- **10A (2.15 kW - 2.2 kW):** Standart güvenli ev prizi şarjı (gece uyku modu)
- **13A (2.8 kW - 2.9 kW):** Standart ev prizi (Schuko) maksimum sürekli güç
- **16A (3.4 kW - 3.7 kW):** 16A Mavi Endüstriyel Priz (Monofaze CEE)
- **7.4 kW:** 32A Mavi Endüstriyel Priz (Tesla 32A Adaptör) / Monofaze Wallbox
- **11 kW:** 3-Faz 16A Trifaze Wallbox (En yaygın AC istasyon)
- **22 kW:** 3-Faz 32A Hızlı AC İstasyon & Wallbox
- **Özel Ayar:** 6A - 32A hassas akım kaydırıcısı ve 1 Faz / 3 Faz seçimi

---

## 📁 Proje Mimarisi

```text
ev-charging-calculator/
├── index.html            # Ana arayüz, kartlar, araç seçici ve ayar modalları
├── css/
│   └── style.css         # Modern cam-morfik (glassmorphism) karanlık tema & duyarlı tasarım
├── js/
│   ├── app.js            # UI olay yönetimi, form etkileşimleri ve PWA kaydı
│   ├── calculator.js     # Şarj süresi, iki fazlı gece akımı ve geriye zamanlama motoru
│   └── storage.js        # Araç profilleri veritabanı ve localStorage kalıcılık katmanı
├── sw.js                 # Safari WebKit uyumlu, çevrimdışı önbellekleyen Service Worker
└── manifest.webmanifest  # PWA kurulum ve ana ekran meta yapılandırması
```

---

## 🤖 Geliştirme Süreci (AI-Assisted Engineering)

Bu proje; elektrikli araçları ev prizinden şarj ederken yaşanan günlük pratik zorlukları (şebeke voltaj düşüşleri, uyurken priz güvenliği için gece akımını düşürme ve sabah çıkış saatine göre geriye dönük zamanlama) çözmek amacıyla **AI Pair Programming (Yapay Zeka Destekli Eşli Geliştirme)** yaklaşımıyla sıfırdan tasarlanıp hayata geçirilmiştir.

- **Mimari:** %100 İstemci Taraflı (Vanilla ES6+ JS, Sıfır Harici Kütüphane / Sıfır Framework)
- **Gizlilik:** Hiçbir kullanıcı veya şarj verisi sunucuya iletilmez, tamamen cihaz üzerinde işlenir.
- **Performans:** ~150 KB toplam paket boyutu ve Service Worker önbelleği ile anında yükleme.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında açık kaynak olarak lisanslanmıştır.
