@echo off
setlocal
chcp 65001 >nul
pushd "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Source mode requires Node.js 22.12 or later.
  echo Use the portable lecture kit when Node.js is not installed.
  popd
  exit /b 1
)
node scripts\lecture.mjs
set "LECTURE_EXIT=%ERRORLEVEL%"
popd
exit /b %LECTURE_EXIT%
