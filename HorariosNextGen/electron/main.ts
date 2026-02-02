
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow | null = null;
let pythonProcess: ChildProcess | null = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Check if we are in dev mode (Vite typically runs on 5173)
    const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // Production build logic (loadFile index.html from dist)
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
};

// Spawn Python Backend
const startPythonBackend = () => {
    // Fix path: dist-electron/main.js -> ../core/main.py
    const pythonScript = path.join(__dirname, '../core/main.py');

    // In production, this might be a compiled executable
    // For dev, we assume 'python' is in PATH.
    console.log('Spawning Python backend from:', pythonScript);

    // Try to spawn 'python' (or 'py' on generic Windows setups if 'python' fails, but hard to do in one shot)
    // We use 'python' as default.
    // Verify file exists first for debugging
    const fs = require('fs');
    if (!fs.existsSync(pythonScript)) {
        console.error('CRITICAL: Python script not found at:', pythonScript);
    }

    pythonProcess = spawn('python', [pythonScript], {
        cwd: path.join(__dirname, '../core'), // Fix cwd as well
    });

    pythonProcess.on('error', (err) => {
        console.error('Failed to start python process.', err);
    });

    pythonProcess.stdout?.on('data', (data) => {
        console.log(`[Python]: ${data}`);
    });

    pythonProcess.stderr?.on('data', (data) => {
        console.error(`[Python API Error]: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`[Python] process exited with code ${code}`);
    });
};

app.on('ready', () => {
    startPythonBackend();
    createWindow();
});

app.on('window-all-closed', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});
