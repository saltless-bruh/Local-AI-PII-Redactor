# Architecture Design: Local AI PII Redactor (Windows Edition)

## 1. System Overview

The system follows a **Local Client-Server Architecture** pattern, even though it is a desktop application.

* **Frontend (UI):** A modern, responsive interface built with **Electron + React**. It handles user interaction, file selection, and visual feedback.
* **Backend (AI Engine):** A headless **Python** process spawned by the Frontend. It handles the heavy lifting: OCR, PII detection, and file manipulation.
* **Communication:** The two components communicate via **gRPC** or **ZeroMQ** over a local socket/pipe, ensuring high performance and decoupling.

## 2. Detailed Component Architecture

### A. The Frontend (The Controller)

* **Tech Stack:** Electron (Windows build), React, TailwindCSS (for "Rich Aesthetics").
* **Responsibilities:**
  * **Session Management:** Manage the queue of files to be processed.
  * **Visualizer:** Display document previews with "redaction candidates" highlighted for user approval (optional "Human-in-the-loop" mode).
  * **Orchestrator:** Spawns the Python backend process on startup and kills it on exit. Monitors backend health (heartbeats).

### B. The AI Engine (The Worker)

* **Tech Stack:** Python 3.10+ (Bundled/Frozen via PyInstaller).
* **Modules:**

#### 1. Input Processing & Pre-processing (The "Cleaner")

* **Library:** `OpenCV`, `pdf2image`, `PyMuPDF`.
* **Pipeline:**
  * **Format Normalization:** Convert all inputs (Word, Excel, Image) into a standardized stream (PDF or High-Res Images) for analysis.
  * **Intelligent Enhancement:**
    * *Deskewing:* Correct scanned document rotation.
    * *Denoising:* Remove scan artifacts.
    * *Red Stamp Separation (Color Filtering):* Use HSV color space to isolate "Red Stamps" from black text to improve OCR accuracy on overlapping regions.

#### 2. OCR Engine (The "Reader")

* **Primary Engine:** **PaddleOCR** (v2.6+).
  * *Why:* Superior performance on Asian languages and Vietnamese diacritics compared to Tesseract. Better layout analysis (Table detection).
* **Fallback/Verify:** Tesseract 5 (only if needed for specific edge cases).
* **Output:** HOCR or JSON format containing Text + Bounding Box coordinates + Confidence Score.

#### 3. PII Detection (The "Brain")

* **Framework:** **Microsoft Presidio**.
* **Customization for Vietnam:**
  * **NLP Model:** Integrating a Vietnamese-specific Spacy model (e.g., `vi_core_news_lg`) for Named Entity Recognition (Persons, Locations, Organizations).
  * **Regex Engine:** Custom patterns for:
    * CCCD (12 digits, valid province codes).
    * Old ID (9 digits).
    * Tax ID (MST).
    * Phone Numbers (+84, 09x).
    * License Plates.
  * **Context Logic:** Algorithms to validate checksums (where applicable) and check proximity keywords (e.g., "Họ và tên:", "Số ĐT:").

#### 4. Redaction Engine (The "Eraser")

* **Library:** `PyMuPDF` (for PDF), `Pillow` (for Images).
* **Mechanism:**
  * **Vector Redaction (PDF):** Remove the text object from the PDF command stream. Draw a black rectangle over the coordinate. Flatten the PDF to prevent layer removal.
  * **Raster Redaction (Images/Scanned PDF):** Alter the pixel values of the ROI (Region of Interest) to RGB(0,0,0). **Irreversible.**
* **Metadata Scrubbing:** `exiftool` or python native libs to strip Author, Creator, CreationDate, GPS tags.

## 3. Data Flow

1. **Ingest:** User drags PDF/Images into Electron UI.
2. **Dispatch:** Electron sends file path to Python Backend.
3. **Analyze (Parallel):**
    * Process A: Converts specific pages to images for OCR.
    * Process B: OCRs the images to get text + map.
    * Process C: Detecting PII in the text map.
4. **Review (Optional):** Backend returns a list of "Proposed Redactions" (Box coordinates & Types) to UI. User confirms.
5. **Finalize:** Backend performs the destructive write (Redaction) -> Saves as `filename_redacted.pdf`.
6. **Audit:** Append transaction to encrypted local log file (SQLite).

## 4. Key Technical Considerations for Windows

* **Packaging:** Using `PyInstaller` with `--onedir` mode for faster startup, wrapped in an `NSIS` installer.
* **Performance:** Utilizing `multiprocessing` in Python to utilize all CPU cores (critical for Batch Processing).
* **GPU Acceleration:** Optional support for ONNX Runtime (CPU optimized) since not all office PCs have dedicated GPUs. We will prioritize quantized models (int8) for speed on standard CPUs.
