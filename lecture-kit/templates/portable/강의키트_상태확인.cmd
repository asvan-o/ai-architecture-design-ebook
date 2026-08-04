@echo off
setlocal
chcp 65001 >nul
set "KIT_ROOT=%~dp0"
set "KIT_ROOT=%KIT_ROOT:~0,-1%"
pushd "%KIT_ROOT%"
"runtime\node.exe" "app\lecture-kit-status.mjs" --mode portable --root "%KIT_ROOT%"
set "LECTURE_EXIT=%ERRORLEVEL%"
popd
exit /b %LECTURE_EXIT%
