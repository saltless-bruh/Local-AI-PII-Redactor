# Local AI PII Redactor

> A secure, offline-first desktop application for detecting and redacting Personally Identifiable Information (PII) from documents using local AI models.

[![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue.svg)](https://github.com/saltless-bruh/Local-AI-PII-Redactor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🔒 Overview

**Local AI PII Redactor** is a Windows desktop application designed for secure document processing in environments where data privacy is paramount. It operates entirely offline, ensuring that sensitive documents never leave your local machine while using advanced AI models to detect and redact PII.

### Key Features

- **🔐 100% Offline Operation** - No internet required; all processing happens locally
- **🤖 AI-Powered Detection** - Leverages state-of-the-art OCR and NLP models
- **🇻🇳 Vietnamese Language Support** - Optimized for Vietnamese documents with support for:
  - CCCD (Citizen ID) - 12 digits
  - Old ID cards - 9 digits
  - Tax ID (MST)
  - Phone numbers (+84, 09x formats)
  - License plates
  - Vietnamese diacritics and text recognition
- **📄 Multi-Format Support** - Handles PDF, Word, Excel, and image files
- **👁️ Human-in-the-Loop** - Optional review interface for verification before redaction
- **🎨 Modern UI** - Clean, industrial design built with Electron and React
- **⚡ High Performance** - Multi-core processing for batch operations

## 🏗️ Architecture

The application follows a **local client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Electron + React)        │
│  • User Interface & File Selection                  │
│  • Document Preview & Redaction Review              │
│  • Job Queue Management                             │
└────────────────┬────────────────────────────────────┘
                 │
                 │ IPC (JSON over stdin/stdout)
                 │
┌────────────────▼────────────────────────────────────┐
│              Backend (Python)                       │
│  • OCR Engine (PaddleOCR)                           │
│  • PII Detection (Microsoft Presidio + Custom)      │
│  • Document Pre-processing (OpenCV)                 │
│  • Redaction Engine (PyMuPDF, Pillow)               │
└─────────────────────────────────────────────────────┘
```

### Component Details

**Frontend (The Controller)**
- Built with **Electron**, **React**, and **TailwindCSS**
- Manages file sessions and user interactions
- Spawns and monitors the Python backend process
- Provides visual feedback and redaction preview

**Backend (The AI Engine)**
- Python 3.10+ with bundled dependencies
- OCR using **PaddleOCR** (superior for Asian languages and Vietnamese diacritics)
- PII detection with **Microsoft Presidio** + custom Vietnamese regex patterns
- Image pre-processing with **OpenCV** (deskewing, denoising, red stamp separation)
- Secure redaction that is irreversible

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.10 or higher
- **Git**
- Windows 10/11 (primary target platform)

### Installation for Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/saltless-bruh/Local-AI-PII-Redactor.git
   cd Local-AI-PII-Redactor
   ```

2. **Setup the Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup the Backend**
   ```bash
   cd ../backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On Linux/Mac
   source venv/bin/activate
   
   # Install dependencies (when available)
   pip install -r requirements.txt
   ```

### Running in Development Mode

1. **Start the application**
   ```bash
   cd frontend
   npm run dev
   ```

   This will:
   - Start the Vite development server
   - Launch the Electron application
   - Automatically spawn the Python backend process

2. **Test the connection**
   - Click "Initiate Connection Test" in the UI
   - You should see a "pong" response indicating successful communication

## 📦 Building for Production

### Build the Electron App

```bash
cd frontend
npm run build
```

This will:
- Build the React application with Vite
- Package the Electron app using electron-builder
- Generate a Windows installer in the `release` directory

### Packaging the Python Backend

The Python backend will be frozen using **PyInstaller** to create a standalone executable:

```bash
cd backend
pyinstaller --onedir --name pii-backend main.py
```

## 🗂️ Project Structure

```
Local-AI-PII-Redactor/
├── frontend/                 # Electron + React application
│   ├── src/                 # React source code
│   │   ├── App.jsx          # Main application component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── electron/            # Electron main process
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS configuration
├── backend/                 # Python AI engine
│   └── main.py             # Backend entry point (IPC listener)
├── ARCHITECTURE_DESIGN.md  # Detailed architecture documentation
├── EXECUTION_ROADMAP.md    # Development roadmap and phases
└── README.md               # This file
```

## 🛠️ Technology Stack

### Frontend
- **Electron 40.4.0** - Desktop application framework
- **React 18.2** - UI library
- **Vite 7.3** - Build tool and dev server
- **TailwindCSS 3.3** - Utility-first CSS framework

### Backend
- **Python 3.10+** - Core language
- **PaddleOCR** - Advanced OCR engine with Vietnamese support
- **Microsoft Presidio** - PII detection framework
- **OpenCV** - Image preprocessing
- **PyMuPDF** - PDF manipulation
- **Pillow** - Image processing
- **ONNX Runtime** - Optimized inference engine

## 🎯 Current Status

**Version:** 0.1.0-alpha

The project is currently in **Phase 1: The Bedrock** of development:

- ✅ Basic Electron + React frontend structure
- ✅ Python backend with IPC communication
- ✅ Modern UI design with connection status
- ✅ Basic command handling (ping/pong)
- 🚧 OCR engine integration (Phase 2)
- 🚧 PII detection models (Phase 2)
- 🚧 Document redaction capabilities (Phase 2)
- 🚧 Review canvas and user approval flow (Phase 3)
- 🚧 Production packaging (Phase 4)

## 🗺️ Roadmap

### Phase 2: The Brain (In Progress)
- OCR engine integration with PaddleOCR
- Vietnamese-specific PII detection patterns
- Document pre-processing pipeline
- Redaction engine implementation

### Phase 3: The Interaction
- Human-in-the-loop review interface
- Drag-and-drop file ingestion
- PDF canvas with redaction overlay
- Batch processing queue

### Phase 4: The Fortification
- PyInstaller packaging for backend
- NSIS installer for Windows
- Offline license validation
- Security audit logging

## 🔐 Security & Privacy

- **No Network Calls** - All processing is 100% offline
- **Irreversible Redaction** - Redacted data cannot be recovered
- **Metadata Scrubbing** - Removes author, creation date, and other metadata
- **Audit Logging** - Encrypted local logs for compliance
- **Secure by Design** - No telemetry or data collection

## 📄 Documentation

- [Architecture Design](ARCHITECTURE_DESIGN.md) - Detailed system architecture
- [Execution Roadmap](EXECUTION_ROADMAP.md) - Phase-by-phase development plan
- [Analysis & Improvement Plan](ANALYSIS_AND_IMPROVEMENT_PLAN.md) - Technical analysis

## 🤝 Contributing

This is a private/internal project. If you have access and would like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- **PaddleOCR** - For excellent OCR capabilities with Vietnamese support
- **Microsoft Presidio** - For the robust PII detection framework
- **Electron & React** - For the powerful desktop application framework

---

**⚠️ Important Notice:** This application is designed for secure, offline document processing. Always verify redactions before distributing sensitive documents. The developers assume no liability for improper use or data leakage due to user error.
