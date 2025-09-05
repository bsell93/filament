# Filament Tier List

An interactive reference for 3D printing filaments with filtering, comparison tools, and detailed specs. Based on **Zack Freedman's video**  
👉 [The 3D Filament Tier List! Which Should YOU Use?](https://youtu.be/weeG9yOp3i4)

🔗 **Live demo**: [https://bsell93.github.io/filament/](https://bsell93.github.io/filament/)

---

## ✨ Features

- **Tiered view (S → F)** with temperatures, notes, and use cases
- **Smart search** across names, specs, and use cases
- **Interactive radar charts** showing performance metrics
- **Compare multiple filaments** side-by-side
- **Advanced filtering** by material, difficulty, price, requirements, and specs
- **State persistence** - your filters and selections are saved
- **Works offline** with embedded data fallback

---

## ⚠️ Disclaimer
This website is **generated from a community summary** of the video and may contain mistakes or inaccuracies.  
- Print temperatures vary by brand and printer.  
- Always check the manufacturer’s datasheet before printing.  
- Treat this as a **quick reference**, not an authoritative guide.

---

## 📂 Files
- `index.html` — main page with UI and embedded data
- `styles.css` — styling and responsive design
- `app.js` — filtering, charts, and comparison logic
- `filaments.json` — filament data with detailed specs

---

## 🚀 Hosting
This repo is designed for **GitHub Pages**:
1. Push the code to your repo (e.g., `filament`).
2. In **Settings → Pages**, select branch = `main`, folder = `/ (root)`.
3. The site will publish at `https://<your-username>.github.io/filament/`.

---

## 🛠 Development
Run locally with any static server:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

**Requirements**: Modern browser with Canvas support for charts

---

## 🙌 Credits

* [Zack Freedman](https://www.youtube.com/c/ZackFreedman) for the original video content
* Community data from [r/3Dprinting](https://www.reddit.com/r/3Dprinting)
* [Chart.js](https://www.chartjs.org/) for radar charts
* [Inter Font](https://rsms.me/inter/) for typography
