@echo off
setlocal
pushd "%~dp0"
if not exist ".venv\Scripts\python.exe" (
 echo Run the README setup first.
 pause
 exit /b 1
)
".venv\Scripts\python.exe" "run_sr1033.py"
set "SR_EXIT=%ERRORLEVEL%"
popd
pause
exit /b %SR_EXIT%
