# 🎨 Theme Studio

**Theme Studio** is a tool for creating, editing, and testing themes in JSON format, with automatic generation of the corresponding CSS.  
It provides a simple workflow: define design tokens → preview them live → export ready-to-use CSS.

---

## 🚀 Features

- **Default theme loading** from JSON file
- **Import/Export** themes in `.json` format
- **Full CSS generation** from variables
- **Live theme application** to the page
- **Automatic HSL palette generation** from a base color
- **LocalStorage saving** to preserve changes
- **Test page** to preview results instantly

---

## 📂 Project Structure

```
/theme-studio
│
├── index.html                # Test page with theme switcher
├── app.js                    # Main logic
├── styles.css                # (Optional) Base styles
└── data/
    ├── default-theme.json
    ├── dark-theme.json
    └── high-contrast-theme.json
```

---

## 🛠 Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/bocaletto-luca/theme-studio.git
   cd theme-studio
   ```

2. **Open `index.html` in a browser**  
   This can be done by double-clicking the file or serving it locally.

3. **Switch between themes**  
   - `Default`
   - `Dark Mode`
   - `High Contrast`

4. **Import a custom theme**  
   Use the **Import JSON** button and select a file.

5. **Export**  
   - Theme JSON
   - Generated CSS

---

## 📜 License

This project is released under the **MIT** License.  
Free to use, modify, and distribute.

---

## ✨ Author

**Luca Bocaletto**  
[GitHub](https://github.com/bocaletto-luca)
