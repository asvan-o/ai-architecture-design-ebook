@echo off
setlocal
chcp 65001 >nul
pushd "%~dp0"
node scripts\lecture-kit-status.mjs --mode source --root "%CD%" --stop
set "LECTURE_EXIT=%ERRORLEVEL%"
popd
exit /b %LECTURE_EXIT%
