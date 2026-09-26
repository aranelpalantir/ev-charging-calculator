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

## 🚀 Cloudflare Pages (`*.pages.dev`) ile Yayınlama

Terminalinizden `d:\AiProjects\Charging` klasöründeyken şu komutu çalıştırabilirsiniz:

```bash
npx wrangler pages deploy . --project-name=ev-charging
```

İlk çalıştırmada tarayıcınızda Cloudflare girişi onaylandıktan sonra siteniz anında `https://ev-charging.pages.dev` olarak yayına girer.
