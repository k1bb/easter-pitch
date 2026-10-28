# Easter Vigil Pitch Prompter

A mobile-friendly web application designed for Catholic priests celebrating the Easter Vigil in Japan.

It provides reference audio pitches for:
- **The Showing of the Paschal Candle** (*Lumen Christi* / キリストの光)
- **The Easter Proclamation** (*Exsultet* / 復活賛歌) solo chants

---

## 📖 Usage & Context

During the Easter Vigil in the darkened church, the priest wears a discrete wireless earphone. An altar server (or assistant) taps the buttons on a smartphone to feed the reference pitch directly into the priest's ear without disturbing the liturgy.

- **Hold to play**: The sound plays while the button is pressed down. The final note sustains as long as you hold it, and fades out smoothly when released.
- **Designed for darkness**: True black background (OLED-friendly) with soft candlelight colors to prevent screen glare in the dark church.
- **Single screen**: All buttons fit on one screen without any scrolling.
- **Works offline**: Service Worker caches audio files for reliable use in churches without mobile signal.

---

## 🚀 Free Deployment with Cloudflare Pages

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/easter-choir.git
   git push -u origin main
   ```
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
3. Select your repository, set the **Build output directory** to `public` (leave Build command blank), and click **Save and Deploy**.

---

## 📄 License

[MIT License](LICENSE)
