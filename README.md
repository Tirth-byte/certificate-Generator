<p align="center">
  <img src="assets/banner.jpg" alt="Cert Studio - Certificate Generator Banner" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-blue?style=for-the-badge&logo=python" alt="Python Version">
  <img src="https://img.shields.io/badge/flask-3.0%2B-green?style=for-the-badge&logo=flask" alt="Flask Version">
  <img src="https://img.shields.io/badge/Render-Ready-darkviolet?style=for-the-badge&logo=render" alt="Render Ready">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License">
</p>

---

## 🎨 About Cert Studio

**Cert Studio** is a professional, high-performance Python application and browser-based dashboard designed to automate the batch generation of beautiful certificates. It works by overlaying recipient data from an Excel spreadsheet onto an image template with pixel-perfect control.

Whether you are hosting a hackathon, virtual conference, or graduation, Cert Studio eliminates the chore of manual editing, bridging the gap between raw data spreadsheets and publication-quality credentials in seconds.

---

## 🚀 Key Features

*   **🖥️ Interactive Dark-Theme Web UI**: A modern dashboard served on localhost (`http://127.0.0.1:5000`) for full visual control.
*   **🎯 Visual Coordinate Picker**: Drag and click directly on your certificate image template to map dynamic field coordinates instantly.
*   **📊 Dynamic Excel Mapping**: Auto-map any spreadsheet columns (e.g. `Name`, `Role`, `University`, `Date`) to certificate fields.
*   **🔤 Automated Font Downloader**: Automatically downloads and caches premium typography (e.g. Montserrat, Playfair Display) from Google Fonts on the first run.
*   **✨ Dynamic Text Templates**: Customize layouts with mixed static text and placeholders (e.g., `"For outstanding performance as {Role} in {Event}"`).
*   **🎨 Custom Styling**: Adjust font sizes, alignment anchors (`left`, `center`, `right`), and colors using Hex codes or RGB values.
*   **🗓️ Smart Date Formatting**: Automatically converts serial Excel date cells into elegant human-readable strings (e.g., `"June 19, 2026"`).
*   **🔍 Live Preview Mode**: Instantly render and preview the certificate layout for the first recipient before executing the entire batch.
*   **📦 One-Click ZIP Downloader**: Download all batch-generated certificate files in a single compressed archive.
*   **☁️ Headless Google Drive Sync**: Seamlessly sync outputs directly to a Google Drive folder via Service Account keys or OAuth.

---

## 📁 Repository Structure

```text
.
├── app.py                 # Flask server & web dashboard
├── generator.py           # Core certificate generation & font loading
├── main.py                # Command-line interface (CLI) entry point
├── drive_sync.py          # Google Drive sync integration (OAuth / Service Account)
├── requirements.txt       # Python packages (Pillow, openpyxl, Flask, google-api)
├── Dockerfile             # Production container definition
├── Procfile               # Production WSGI process definition
├── render.yaml            # Render Cloud Blueprint deployment configuration
│
├── templates/
│   └── index.html         # Frontend interface for the web dashboard
│
├── assets/
│   └── banner.jpg         # Premium README header banner
│
├── fonts/                 # Local directory for cached Google Fonts (git ignored)
└── output/                # Generated certificates output directory (git ignored)
```

---

## 🛠️ Local Installation & Quick Start

### Prerequisites
Make sure you have **Python 3.10+** installed on your system.

### 1. Clone & Navigate
```bash
git clone https://github.com/Tirth-byte/certificate-Generator.git
cd certificate-Generator
```

### 2. Set Up Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
*   **Option A: Interactive Dashboard (Recommended)**
    ```bash
    python app.py
    ```
    Then open your browser and navigate to 👉 **[http://127.0.0.1:5001/dashboard](http://127.0.0.1:5001/dashboard)** (or your custom `$PORT`/dashboard).
    
*   **Option B: Command Line CLI**
    ```bash
    python main.py
    ```
    *(Run `python main.py --help` to see advanced arguments like custom template paths and data overrides).*

---

## ☁️ Deployment on Render

This repository is pre-configured and ready for deployment to **Render** in just a few clicks using Render Blueprints.

### ⚡ One-Click Blueprint Deploy
1. Push your repository to GitHub.
2. In your Render Dashboard, click **New +** -> **Blueprint**.
3. Connect your repository.
4. Render will parse `render.yaml` and configure the Web Service automatically:
   *   **Build Command**: `pip install -r requirements.txt`
   *   **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`

### 🔒 Secure Google Drive Environment Variables
Since Render's storage is ephemeral, configure Google Drive syncing in the **Environment** settings of the Render dashboard:
*   `GOOGLE_SERVICE_ACCOUNT_JSON`: Paste your Google Cloud service account JSON contents directly.
*   `GOOGLE_OAUTH_TOKEN_JSON`: Paste the JSON content of your locally authenticated `token.json` file for OAuth.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
