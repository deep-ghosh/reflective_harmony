# Check if pnpm is installed
Write-Host "Checking for pnpm..."
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "pnpm is not installed. Please install pnpm first."
    exit 1
}
Write-Host "pnpm is installed." -ForegroundColor Green

# Setup backend
Write-Host "`nSetting up backend..."
Push-Location backend
try {
    pnpm install
} finally {
    Pop-Location
}

# Setup Student_app
Write-Host "`nSetting up Student_app..."
Push-Location Student_app
try {
    pnpm install
} finally {
    Pop-Location
}

# Setup Emotion_Engine
Write-Host "`nSetting up Emotion_Engine..."
Push-Location Emotion_Engine
try {
    if (-not (Test-Path .venv)) {
        Write-Host "Creating virtual environment..."
        python -m venv .venv
    } else {
        Write-Host "Virtual environment already exists."
    }

    # Activate venv and install requirements
    # We use the python executable in the venv to run pip module. This is robust.
    
    $pythonPath = ".\.venv\Scripts\python.exe"
    if (-not (Test-Path $pythonPath)) {
         # Fallback for non-windows
         $pythonPath = ".\.venv\bin\python"
    }
    
    if (Test-Path $pythonPath) {
        Write-Host "Installing requirements..."
        & $pythonPath -m pip install -r requirements.txt
    } else {
        Write-Error "Could not find python in virtual environment."
    }

} finally {
    Pop-Location
}

Write-Host "`nSetup complete!" -ForegroundColor Green
