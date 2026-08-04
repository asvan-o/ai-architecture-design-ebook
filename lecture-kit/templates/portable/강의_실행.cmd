@echo off
setlocal
chcp 65001 >nul
set "KIT_ROOT=%~dp0"
set "KIT_ROOT=%KIT_ROOT:~0,-1%"
pushd "%KIT_ROOT%"
if not exist "runtime\node.exe" (
  echo [ERROR] Portable Node.js runtime was not found.
  popd
  exit /b 1
)
"runtime\node.exe" "app\lecture-kit-server.mjs" --mode portable --root "%KIT_ROOT%"
set "LECTURE_EXIT=%ERRORLEVEL%"
popd
exit /b %LECTURE_EXIT%
