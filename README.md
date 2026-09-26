# ⚡ Tesla Şarj Zamanlayıcı (PWA)

Ev prizinden (10A - 13A) Tesla şarj edenler için geliştirilmiş parametrik şarj başlama saati ve süre hesaplayıcı web uygulaması.

Sabah belirlediğiniz saatte (örneğin **07:30**) aracınızdan prizi çektiğinizde bataryanın **%100** (veya belirlediğiniz hedef seviyede) hazır olması için şarja saat kaçta başlamanız gerektiğini geriye doğru hesaplar.

---

## 🌟 Öne Çıkan Özellikler

- **Değerleri Otomatik Hatırlama (`localStorage`):**
  - Seçtiğiniz son amperaj (**13A** veya **10A**), mevcut şarj yüzdesi, hedef şarj yüzdesi, çıkış saati (**07:30**) ve araç modeli otomatik olarak cihazınızda saklanır. Sayfayı her açtığınızda kaldığınız yerden devam edersiniz.
- **Hızlı Amper Geçişleri:**
  - **13A (~3.0 kW):** Günlük tercih edilen standart ev tipi şarj.
  - **10A (~2.3 kW):** Gece uyurken tesisat güvenliğini korumak için düşük akım modu.
  - **Diğer (6A - 32A):** İsteğe bağlı hassas akım ayarı.
- **Akıllı Yetişmeme Uyarısı:**
  - Eğer mevcut şarj gücüyle sabah 07:30'a kadar bataryanın dolması fiziksel olarak mümkün değilse sizi uyarır: *"Şu an başlasanız bile en erken 09:15'te biter veya en az 16A gereklidir."*
- **Gece Tarifesi (22:00 - 06:00) Analizi:**
  - Şarj sürenizin ne kadarının indirimli gece tarifesine denk geldiğini ve tahmini maliyet tasarrufunuzu hesaplar.
- **Tesla Uygulaması Ayar Rehberi:**
  - Tesla mobil uygulamasında *"Zamanlanmış Kalkış / Şarjı Başlat"* ekranında saati nasıl gireceğinizi adım adım gösterir.
- **Tam PWA (Progressive Web App) Desteği:**
  - iOS Safari'de *"Ana Ekrana Ekle"* veya Android Chrome'da *"Uygulamayı Yükle"* diyerek tıpkı yerel bir mobil uygulama gibi kullanabilir ve internetsiz (çevrimdışı) çalıştırabilirsiniz.

---

## 📱 Ekran Görüntüsü / Akış

1. **Mevcut Şarjınızı Belirtin:** Slider veya +/- butonlarıyla anlık bataryanızı seçin (örn: %30).
2. **Akımı Seçin:** Tek tıkla **13A** veya **10A**.
3. **Çıkış Saatinizi Girin:** Varsayılan **07:30** (veya dilediğiniz saat).
4. **Sonuç:** Ekranda kocaman şarja başlama saati (örn: **Bugün 22:45**) ve toplam süre belirir. *"Kopyala"* veya *"Tesla Uygulaması Ayarı"* ile hemen uygulayabilirsiniz.

---

## 🚀 Cloudflare Pages (`*.pages.dev`) ile Yayınlama

Bu proje sıfır harici paket bağımlılığı ile saf modern web standartlarında geliştirilmiştir. Cloudflare Pages'e 2 kolay yöntemle ücretsiz yayınlayabilirsiniz:

### Yöntem 1: Cloudflare Dashboard üzerinden (Sürükle & Bırak veya GitHub)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)'a giriş yapın.
2. Sol menüden **Workers & Pages** > **Create application** > **Pages** sekmesine tıklayın.
3. **Seçenek A (Doğrudan Yükleme):** **Upload assets** seçeneğini seçin. Bu klasördeki tüm dosyaları sürükleyip bırakın.
4. **Seçenek B (GitHub):** Bu projeyi GitHub reponuza push edin ve Cloudflare Pages'e bağlayın.
   - Framework preset: `None`
   - Build command: *(Boş bırakın)*
   - Output directory: *(Boş bırakın veya `.`)*
5. **Deploy Site** butonuna basın. Birkaç saniye içinde projeniz `https://tesla-sarj.pages.dev` benzeri bir adreste canlıya alınacaktır!

### Yöntem 2: Terminal / Wrangler CLI ile (10 saniyede)

Terminalden şu komutu çalıştırmanız yeterlidir:

```bash
npx wrangler pages deploy . --project-name=tesla-charging
```

İlk çalıştırmada tarayıcınızda Cloudflare girişi onaylandıktan sonra siteniz anında `https://tesla-charging.pages.dev` olarak yayına girer.

---

## 💻 Yerel Geliştirme & Test

Bilgisayarınızda test etmek için herhangi bir statik sunucu çalıştırabilirsiniz:

```bash
# Python ile:
python -m http.server 8080

# veya Node.js ile:
npx serve .
```

Ardından tarayıcınızda `http://localhost:8080` adresini açabilirsiniz.
