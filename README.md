# 3D Filament Tier List Website

A static reference site that organizes popular 3D printing filaments by tier, based on **Zack Freedman’s video**  
👉 [The 3D Filament Tier List! Which Should YOU Use?](https://youtu.be/weeG9yOp3i4)

🔗 **Live demo (GitHub Pages)**: [https://bsell93.github.io/filament/](https://bsell93.github.io/filament/)

---

## ✨ Features
- **Tiered view (S → F)** with print temperatures, notes, and use cases.
- **Search bar** to quickly find filaments by name, notes, or use case.
- **Filter controls** for tiers and flags:
  - Prefers enclosure
  - Requires hardened nozzle
  - Moisture sensitive
  - Aesthetic
- Works fully static — no backend required.
- Includes **embedded JSON fallback** so it still loads when opened locally with `file://`.

---

## ⚠️ Disclaimer
This website is **generated from a community summary** of the video and may contain mistakes or inaccuracies.  
- Print temperatures vary by brand and printer.  
- Always check the manufacturer’s datasheet before printing.  
- Treat this as a **quick reference**, not an authoritative guide.

---

## 📂 Structure
- `index.html` — main page
- `styles.css` — styling
- `app.js` — search/filter logic
- `filaments.json` — filament dataset (also embedded inline as a fallback)

---

## 🚀 Hosting
This repo is designed for **GitHub Pages**:
1. Push the code to your repo (e.g., `filament`).
2. In **Settings → Pages**, select branch = `main`, folder = `/ (root)`.
3. The site will publish at `https://<your-username>.github.io/filament/`.

---

## 🛠 Development
You can run it locally with any static server, for example:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

---

## 🙌 Credits

* [Zack Freedman](https://www.youtube.com/c/ZackFreedman) for the original video content.
* Community TL;DR and summaries from [r/3Dprinting](https://www.reddit.com/r/3Dprinting).
* Generated and assembled into this static site for convenience.
