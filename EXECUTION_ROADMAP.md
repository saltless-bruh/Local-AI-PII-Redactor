# Full Execution Roadmap: Local AI PII Redactor

This roadmap covers the entire lifecycle, from empty folder to shipping the `Setup.exe`. It emphasizes usage of "Cement" (Shared Protocols & IPC) to glue the isolated Python and JS worlds together.

---

## Phase 1: The Bedrock (Scaffolding & Architecture)

**Goal:** A running Electron app that talks to a "dumb" Python backend.
**The Cement:** `IPC_Protocol v1` (Simple JSON over Stdin/Stdout).

### 1.1. Physical Structure

- [ ] **Git Init:** `.gitignore` handling both `node_modules` and `venv`.
- [ ] **Directories:**
  - `backend/` (The "Black Box")
  - `frontend/` (The UI Shell)
  - `shared/` (JSON Schemas/Type definitions if applicable)

### 1.2. Python Core Setup (The Worker)

- [ ] **Virtual Env:** `backend/venv` (Python 3.10+).
- [ ] **Dependencies:** `onnxruntime` (CPU), `opencv-python-headless`.
- [ ] **Entry Point:** `backend/main.py` -> Implements the `StdIO` listener loop.
- [ ] **Test:** Manual "Ping" test via terminal.

### 1.3. Electron Shell (The Controller)

- [ ] **Vite + React:** Setup strictly in `frontend/`.
- [ ] **Electron Main Process:** `electron-main.js` (Handles OS interaction).
- [ ] **The "Cement" Logic (IPC Bridge):**
  - Implement `spawn_python_process()` with environment detection (Dev vs Prod paths).
  - Implement `send_command(json)` and `on_response(callback)`.

---

## Phase 2: The Brain (Heavy Logic Implementation)

**Goal:** The Python backend can read a file and output redaction coordinates without UI.
**The Cement:** `Command: "SCAN_FILE"` -> `Response: { "pii": [...] }`.

### 2.1. The "Eyes" (Pre-processing)

- [ ] **Red Channel Extraction:** Implement `cv2.split()[2]` to nuke red stamps.
- [ ] **CLAHE:** Enhancing contrast for faded old documents.
- [ ] **Resize Strategy:** Standardize inputs to 200 DPI for consistent OCR speed.

### 2.2. The "Brain" (Inference)

- [ ] **ONNX Integration:** Load `ch_PP-OCRv4_det_infer.onnx` and `vi_mobile_v2.0_rec_infer.onnx`.
- [ ] **Regex Engine:** Implement Vietnamese logic (CCCD Checksum, Phone, Tax ID).
- [ ] **Pipeline Assembly:** Image -> Preprocess -> Text Detection -> Text Recognition -> PII Filter -> JSON Output.

### 2.3. The "Hands" (Redaction)

- [ ] **Hybrid Rasterization:**
  - Input: Page + Coordinates.
  - Action: Render Page to Image -> Draw Black Box on Pixels -> Save as PDF.
  - **Optimization:** Use JBIG2 compression to keep file size low.

---

## Phase 3: The Interaction (UI/UX)

**Goal:** Allow "Human-in-the-loop" review (Crucial for Trust).
**The Cement:** Visual Canvas mapping PDF coordinates to Screen pixels.

### 3.1. Ingestion

- [ ] **Drop Zone:** Handle file paths (Electron), prevent reading large files into JS RAM (Video memory constraints).

### 3.2. The Review Canvas

- [ ] **PDF Renderer:** Render PDF page to HTML Canvas.
- [ ] **Overlay Layer:** Draw "Redaction Boxes" based on Python's JSON output.
- [ ] **User Action:** Click box to delete, Drag to create new box.

### 3.3. Job Queue

- [ ] **Batch Manager:** Handle "Processing... 1/50 files".
- [ ] **Error Handling:** If Python crashes on file #12, restart process and continue with #13.

---

## Phase 4: The Fortification (Packaging & Trust)

**Goal:** A distributable, secure `.exe` that runs without Internet.
**The Cement:** File System paths (Production Resources).

### 4.1. The Frozen Core

- [ ] **PyInstaller:** Create `build.spec` using `onedir` mode (Faster startup).
- [ ] **Asset Bundling:** Embed ONNX models into the executable folder.
- [ ] **Trim Fat:** Exclude standard heavy libraries (matplotlib, unittest).

### 4.2. The Installer

- [ ] **Inno Setup:** Write `.iss` script.
- [ ] **Registry:** Register file associations (Optional).
- [ ] **VC++ Redist:** Auto-install Visual C++ runtime if missing.

### 4.3. Trust & Licensing

- [ ] **Hardware ID:** CPU Serial + Disk Serial -> Hash.
- [ ] **License Key:** Public Key verification offline.
- [ ] **Audit Log:** Write JSON logs to hidden `%APPDATA%` folder for IT audit.

---
**Code Order Strategy:** Phase 1 (Structure) -> Phase 2 (Logic) -> Phase 3 (UI) -> Phase 4 (Ship).
