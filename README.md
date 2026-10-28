# Easter Vigil Pitch Prompter (復活徹夜祭 音取り)

A lightweight, mobile-first Progressive Web App (PWA) designed for Roman Catholic priests celebrating the **Easter Vigil in the Holy Night** in Japan.

It allows altar servers or liturgists to discreetly provide pitch-pipe audio cues to the priest for:
1. **The Showing of the Paschal Candle** (*Lumen Christi* / キリストの光)
2. **The Easter Proclamation** (*Exsultet* / 復活賛歌) solo chants

---

## 🕊️ Operational Concept & Use Case

During the Easter Vigil, the entire sanctuary is plunged into darkness during the *Lucernarium* (Service of Light) through the *Exsultet*.

- **Priest's Ear**: The celebrating priest wears a small, discreet wireless earphone (e.g., a single in-ear bud) that remains hidden and unobtrusive during the sacred liturgy.
- **Server's Operation**: An altar server, acolyte, or choir director standing quietly nearby holds a smartphone in the dark, pressing the corresponding button at liturgical cues to send the reference pitch directly into the priest's ear.

---

## 🕯️ Liturgically-Informed Design Principles

- **OLED True Black (`#000000`)**:  
  Engineered with pure black pixels so OLED/AMOLED displays emit zero light. There is no screen glow to break the sacred darkness or distract the congregation.
- **Gentle Candlelight Palette (Zero Pure White)**:  
  Pure white (`#ffffff`) is strictly avoided to protect dark-adapted eyes. Text uses warm candle ivory (`#cbbfa8`) and section titles use beeswax amber (`#b47b2b`), lighting up like a living candle flame when pressed.
- **100% Scroll-Free Single Screen**:  
  Every button fits cleanly on a single screen without any vertical scrolling, eliminating mis-taps and clumsy navigation in the dark.
- **Hold-to-Sustain Audio Engine**:  
  Plays **only while pressed**. The audio plays the melodic intonation, and holding down the button sustains the final note indefinitely—just like an organ pedal—allowing the priest ample time to internalize the pitch. Releasing the button instantly initiates a smooth 0.3s fade-out.
- **100% Offline PWA**:  
  Cached via Service Worker upon first load. Works reliably in thick-walled stone cathedrals, remote sanctuaries, or crypts without Wi-Fi or cellular signal.

---

## 🎵 Liturgical Cue Buttons (9 Buttons)

### 【キリストの光 (Lumen Christi - Paschal Candle)】
1. **１回目** – 1st Chant at Church Entrance (*Lumen Christi*)
2. **２回目** – 2nd Chant in the Middle of the Church (one step higher)
3. **３回目** – 3rd Chant before the Altar (highest pitch)

### 【復活賛歌 (Exsultet - Easter Proclamation)】
4. **神の使いよ** – Introduction (*Exsultet iam angelica turba caelorum...*)
5. **主は皆さんとともに** – Versicle & Response (*Dominus vobiscum...*)
6. **目に見えない神** – Section 1 (*Vere dignum et iustum est... invisibilem Deum...*)
7. **キリストは私たちのために** – Section 2 (*Qui pro nobis aeterno Patri Adae debitum solvit...*)
8. **今日こそまことの** – Section 3 (*Haec sunt enim festa paschalia...*)
9. **いつくしみ深い父よ** – Concluding Prayer (*Oramus ergo te, Domine...*)

---

## 🚀 Free Deployment with Cloudflare Pages & GitHub

### Method A: Automated Deployment via GitHub (Recommended)

Any commit pushed to GitHub will automatically trigger Cloudflare Pages to update the live production web app in seconds.

1. **Push to GitHub**:
   ```bash
   cd /Users/andrew/.gemini/antigravity/scratch/easter-choir-app
   git remote add origin https://github.com/<your-username>/easter-choir.git
   git push -u origin main
   ```
2. **Connect to Cloudflare Pages**:
   - Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) (100% free).
   - Go to **Workers & Pages** > **Create** > **Pages** tab > **Connect to Git**.
   - Select your `easter-choir` repository.
3. **Build Settings**:
   - **Framework preset**: `None`
   - **Build command**: *(leave blank)*
   - **Build output directory**: `public`
4. **Deploy**:
   - Click **Save and Deploy**. Your custom HTTPS URL (e.g. `https://easter-choir.pages.dev`) will be live instantly!

---

### Method B: Direct Upload (No Git Required)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create** > **Pages**.
2. Select **Upload assets**.
3. Drag & drop the pre-built `deploy-package.zip` (or the `public` folder).
4. Click **Deploy site**.

---

## 💻 Local Testing & Preview

To preview on your Mac or test on a mobile device connected to the same Wi-Fi:

```bash
cd /Users/andrew/.gemini/antigravity/scratch/easter-choir-app
./preview.sh
```

---

## 📄 License

This open-source project is licensed under the [MIT License](LICENSE).  
Parishes, dioceses, religious communities, and liturgical ministers worldwide are welcome to use, adapt, and customize this app for their own liturgical needs.
