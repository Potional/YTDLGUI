; Custom NSIS Installer Script
; This script runs during installation to download the latest GitHub release

!include "MUI2.nsh"
!include "x64.nsh"
!include "LogicLib.nsh"

; Define variables
Var GitHubReleaseDownloaded

; Custom page for GitHub release download
Function CustomPageGitHub
  nsDialogs::Create 1018
  Pop $0
  
  ${If} $0 == error
    Abort
  ${EndIf}
  
  ; Title
  ${NSD_CreateLabel} 0 0 100% 20 "Downloading Required Components"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $HeaderFont 0
  
  ; Description
  ${NSD_CreateLabel} 0 20 100% 30 "The installer will now download the latest release from GitHub. This may take a few moments."
  Pop $0
  
  ; Progress bar
  ${NSD_CreateProgressBar} 0 60 100% 15 ""
  Pop $ProgressBar
  
  ; Status text
  ${NSD_CreateLabel} 0 80 100% 20 "Initializing download..."
  Pop $StatusLabel
  
  ; Download button
  ${NSD_CreateButton} 0 110 100% 14 "Download Latest Release"
  Pop $DownloadButton
  ${NSD_OnClick} $DownloadButton DownloadGitHubRelease
  
  nsDialogs::Show
FunctionEnd

; Download GitHub release
Function DownloadGitHubRelease
  ; Configure download parameters
  StrCpy $GitHubOwner "yt-dlp"
  StrCpy $GitHubRepo "yt-dlp"
  StrCpy $AssetName "yt-dlp.exe"
  StrCpy $DownloadPath "$INSTDIR\bin"
  
  ; Create bin directory if needed
  CreateDirectory "$DownloadPath"
  
  ; Call Node.js script to download
  ExecWait 'node "$INSTDIR\installer\download-github-release.js" "$GitHubOwner" "$GitHubRepo" "$AssetName" "$DownloadPath"' $0
  
  ${If} $0 == 0
    StrCpy $GitHubReleaseDownloaded "1"
    SendMessage $StatusLabel ${WM_SETTEXT} 0 "STR:✓ Download completed successfully"
    Sleep 2000
  ${Else}
    MessageBox MB_OK "Failed to download GitHub release. Error code: $0"
  ${EndIf}
FunctionEnd

; Installer sections
Section "Install"
  SetOutPath "$INSTDIR"
  
  ; Check if GitHub release was downloaded
  ${If} $GitHubReleaseDownloaded == "1"
    DetailPrint "GitHub release successfully downloaded to bin folder"
  ${EndIf}
SectionEnd
