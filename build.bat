@echo off
REM Build script for Windows

echo Building Vyb for Windows...
go build -o vyb.exe cmd/vyb/main.go

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo Run: vyb.exe run examples/
) else (
    echo.
    echo ❌ Build failed!
    exit /b 1
)
