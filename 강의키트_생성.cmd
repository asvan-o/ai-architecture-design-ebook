@echo off
setlocal
chcp 65001 >nul
pushd "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Building the lecture kit requires Node.js 22.12 or later.
  popd
  exit /b 1
)
node scripts\build-lecture-kit.mjs %*
set "LECTURE_EXIT=%ERRORLEVEL%"
popd
exit /b %LECTURE_EXIT%
