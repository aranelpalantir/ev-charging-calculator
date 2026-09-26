# ⚡ EV Şarj Zamanlayıcı (PWA)

Ev prizinden (10A - 13A) Tesla, Togg, BYD, Renault ve tüm elektrikli araçları şarj edenler için geliştirilmiş parametrik şarj başlama saati, gece akımı planlayıcı ve elektrik faturası maliyet hesaplama web uygulaması.

Sabah belirlediğiniz saatte (örneğin **07:30**) aracınızdan prizi çektiğinizde bataryanın **%100** (veya belirlediğiniz hedef seviyede) hazır olması için şarja saat kaçta başlamanız gerektiğini geriye doğru hesaplar.

---

## 🌟 Öne Çıkan Özellikler

- **Değerleri Otomatik Hatırlama (`localStorage`):**
  - Seçtiğiniz araç modeli, akım (**13A** veya **10A**), voltaj (**220V**), mevcut şarj yüzdeniz ve sabah çıkış saatiniz (**07:30**) otomatik olarak cihazınızda saklanır.
- **İki Fazlı Gece Güvenlik Akımı Planı (13A ➔ 10A):**
  - Şarja akşam **13A** ile başlayıp gece uyurken güvenlik için belirlediğiniz saatte (örneğin **00:00**) akımı **10A**'e düşürmeyi planlayabilirsiniz. Uygulama bu iki fazlı güç eğrisini geriye doğru hesaplayarak tam başlama saatini belirler!
- **Şeffaf Fatura Formülü:**
  - `Fatura Tutarı (TL) ÷ Toplam Tüketim (kWh) = Birim Fiyat` formülüyle faturanızdaki net tutarı anında girip şarj maliyetinizi hesaplayabilirsiniz.
- **Tüm Elektrikli Araçlar (EV Veritabanı):**
  - Başta **Tesla Model Y Standart (60 kWh LFP)** olmak üzere Togg, BYD, Renault, MG, Hyundai, Kia, Volvo, BMW, Mercedes ve Özel batarya girişini destekler.
- **Pratik Kullanım & Hızlı Giriş:**
  - Mevcut şarj yüzdesi için `+1% / -1%` adımları, kutuya tıklayınca anında tümünü seçip silerek hızlı yazma imkanı.
  - Ana ekranda priz şebeke voltajını canlı görme (**220V**).
- **Tam PWA (Progressive Web App):**
  - iOS ve Android'de ana ekrana eklenebilir, 100% çevrimdışı (offline) çalışır.

---

## 🌐 Canlı Demo (Web / PWA)

Uygulamaya tarayıcınızdan veya telefonunuzdan doğrudan erişebilirsiniz:
👉 **[https://aranelpalantir.github.io/ev-charging-calculator/](https://aranelpalantir.github.io/ev-charging-calculator/)**

*(iPhone Safari veya Android Chrome'da "Ana Ekrana Ekle" diyerek tam ekran ve internetsiz mobil uygulama olarak kullanabilirsiniz.)*

---

## ⚡ Desteklenen Şarj Güçleri ve Cihazlar

- **10A (2.2 kW):** Standart güvenli priz şarjı
- **13A (2.9 kW):** Standart ev prizi (Schuko)
- **16A (3.7 kW):** 16A Mavi Endüstriyel Priz (Monofaze CEE)
- **7.4 kW:** 32A Mavi Endüstriyel Priz (Tesla 32A Adaptör) / Monofaze Wallbox
- **11 kW:** 3-Faz 16A Trifaze Wallbox (En yaygın AC istasyon)
- **22 kW:** 3-Faz 32A Hızlı AC İstasyon & Wallbox
- **Özel Ayar:** 6A - 32A hassas akım kaydırıcısı ve 1 Faz / 3 Faz seçimi

---

## 🚀 Cloudflare Pages ile Yayınlama (Alternatif)

İsterseniz Cloudflare Pages üzerinden de tek komutla yayına alabilirsiniz:

```bash
npx wrangler pages deploy . --project-name=ev-charging
```
