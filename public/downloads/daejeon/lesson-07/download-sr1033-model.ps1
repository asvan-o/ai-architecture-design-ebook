$ErrorActionPreference = 'Stop'
$ModelDir = Join-Path $PSScriptRoot 'model'
New-Item -ItemType Directory -Force -Path $ModelDir | Out-Null
$ModelBase = 'https://storage.openvinotoolkit.org/repositories/open_model_zoo/2023.0/models_bin/1/single-image-super-resolution-1033/FP16'
foreach ($ModelExtension in @('xml','bin')) {
  $ModelName = 'single-image-super-resolution-1033.' + $ModelExtension
  Invoke-WebRequest -Uri ($ModelBase+'/'+$ModelName) -OutFile (Join-Path $ModelDir $ModelName)
}
Get-ChildItem -LiteralPath $ModelDir
