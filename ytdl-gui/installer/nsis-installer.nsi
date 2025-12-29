; NSIS Installer Script with GitHub Release Download
; Simplified version without MUI2 language issues

!include "LogicLib.nsh"

Name "YTDL GUI"
OutFile "YTDL-GUI-Installer.exe"
InstallDir "$PROGRAMFILES\YTDL GUI"
RequestExecutionLevel admin

; Installer sections
Section "Install"
  SetOutPath "$INSTDIR"
  
  DetailPrint "Installing YTDL GUI..."
  
  ; Create tools directory for downloaded files
  CreateDirectory "$INSTDIR\tools"
  
  ; Download yt-dlp from GitHub using PowerShell
  DetailPrint "Downloading yt-dlp from GitHub..."
  
  ExecWait 'powershell -NoProfile -Command "$$ErrorActionPreference = \"Stop\"; $$uri = (Invoke-RestMethod -Uri https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest | Select-Object -ExpandProperty assets | Where-Object name -eq yt-dlp.exe | Select-Object -ExpandProperty browser_download_url); Invoke-WebRequest -Uri $$uri -OutFile \"$INSTDIR\tools\yt-dlp.exe\" | Out-Null"' $0
  
  ${If} $0 == 0
    DetailPrint "yt-dlp successfully downloaded to $INSTDIR\tools"
  ${Else}
    DetailPrint "Warning: yt-dlp download failed (error code: $0). You can configure it manually later."
  ${EndIf}
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  DetailPrint "Installation complete!"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\YTDL GUI"
SectionEnd


