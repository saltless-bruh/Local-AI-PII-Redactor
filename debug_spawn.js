const { spawn } = require('child_process');
const path = require('path');

const pythonPath = path.join(__dirname, 'backend/venv/bin/python');
const scriptPath = path.join(__dirname, 'backend/main.py');

console.log(`Testing Spawn: ${pythonPath} ${scriptPath}`);

const pythonProcess = spawn(pythonPath, [scriptPath]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`STDERR: ${data}`);
});

pythonProcess.on('error', (err) => {
  console.error(`FAILED TO SPAWN: ${err}`);
});

pythonProcess.on('close', (code) => {
  console.log(`EXITED: ${code}`);
});

// Send ping
setTimeout(() => {
    console.log("Sending Ping...");
    pythonProcess.stdin.write(JSON.stringify({command: "ping"}) + "\n");
}, 1000);

// Kill after 3s
setTimeout(() => {
    pythonProcess.kill();
}, 3000);
