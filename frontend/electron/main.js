const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = !app.isPackaged;
  const startUrl = isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist/index.html')}`;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

function getPythonPath() {
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // Development Mode
    if (process.platform === 'win32') {
      return path.join(__dirname, '../../backend/venv/Scripts/python.exe');
    }
    return path.join(__dirname, '../../backend/venv/bin/python');
  }
  
  // Production Mode (Bundled)
  // Logic: In prod, we usually ship the python folder in 'resources/backend'
  if (process.platform === 'win32') {
     return path.join(process.resourcesPath, 'backend', 'main.exe'); // If compiled to exe
  }
  return path.join(process.resourcesPath, 'backend', 'main'); 
}

function startPythonBackend() {
  const pythonPath = getPythonPath();
  const scriptPath = path.join(__dirname, '../../backend/main.py');
  
  console.log(`Starting Python Backend: ${pythonPath} ${scriptPath}`);

  // Spawn Python process
  // In dev, run python executable with script. In prod, run the frozen exe.
  const isDev = !app.isPackaged;
  
  if (isDev) {
      pythonProcess = spawn(pythonPath, [scriptPath]);
  } else {
      // In prod, pythonPath points to the exe itself
      pythonProcess = spawn(pythonPath);
  }

  if (pythonProcess) {
    pythonProcess.stdout.on('data', (data) => {
      console.log(`[Python Stdout]: ${data}`);
      // Parse JSON from Python and send to Renderer if needed
      try {
          const jsonResponse = JSON.parse(data.toString());
          if (mainWindow) {
              mainWindow.webContents.send('python-response', jsonResponse);
          }
      } catch (e) {
          // Ignore partial chunks or non-json logs
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[Python Stderr]: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
    });
  }
}

app.on('ready', () => {
    createWindow();
    startPythonBackend();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
    // Kill Python process on exit
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

// IPC Handler for sending commands to Python
ipcMain.handle('send-to-python', async (event, command) => {
    if (pythonProcess && pythonProcess.stdin) {
        const jsonCmd = JSON.stringify(command) + "\n";
        pythonProcess.stdin.write(jsonCmd);
        return { status: "sent", command: command };
    }
    return { status: "error", message: "Python backend not connected" };
});
