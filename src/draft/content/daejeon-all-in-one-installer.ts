// 올인원 건축 AI · MCP · 스킬 통합 설치 빌더 (PowerShell 모듈형 생성기 & 의존성 안내 엔진)

export type BlenderProfile = 'lts36' | 'latest';
export type VersionPolicy = 'ask' | 'latest' | 'skip';

export interface InstallerSelection {
  git: boolean;
  node: boolean;
  pythonUv: boolean;
  optA: boolean;
  optB: boolean;
  blender: boolean;
  codexConfig: boolean;
  skills: boolean;
  blenderProfile: BlenderProfile;
  versionPolicy: VersionPolicy;
}

export interface SetupWarning {
  id: string;
  title: string;
  detail: string;
}

export const defaultInstallerSelection: InstallerSelection = {
  git: true,
  node: true,
  pythonUv: true,
  optA: true,
  optB: true,
  blender: true,
  codexConfig: true,
  skills: true,
  blenderProfile: 'lts36',
  versionPolicy: 'ask',
};

export const installerModuleMeta = [
  {
    key: 'git' as const,
    group: '공통 기반',
    badge: '필수 1',
    title: 'Git (Git for Windows)',
    summary: '공개 MCP 저장소와 건축 스킬을 내려받는 기본 도구입니다. 설치 직후 창을 닫지 않아도 PATH에 즉시 연결됩니다.',
  },
  {
    key: 'node' as const,
    group: '공통 기반',
    badge: '필수 2',
    title: 'Node.js LTS (node · npm · npx)',
    summary: '제2차시 로컬 자동화 생성기 서버 실행과 공개 건축 스킬 설치(npx)에 사용하는 실행 엔진입니다.',
  },
  {
    key: 'pythonUv' as const,
    group: '공통 기반',
    badge: '필수 3',
    title: 'Python 3.12 + uv / uvx + 도면 공통 패키지',
    summary: '모든 건축 MCP 서버 실행기(uv · uvx)와 도면·PDF 처리용 공통 라이브러리(ezdxf · pymupdf · matplotlib · pypdf · pillow)를 한 번에 준비합니다.',
  },
  {
    key: 'optA' as const,
    group: '건축 MCP',
    badge: '옵션 A · 2D 도면',
    title: 'LibreCAD + aiblueprint-mcp',
    summary: '유료 AutoCAD 없이 표준 2D DXF 평면도를 AI로 작도·수정하고 무료 CAD 뷰어로 레이어와 치수를 확인합니다.',
  },
  {
    key: 'optB' as const,
    group: '건축 MCP',
    badge: '옵션 B · 3D CAD/BIM',
    title: 'FreeCAD + freecad-mcp (백그라운드 & GUI 오류 방지 포함)',
    summary: 'FreeCAD 설치, v1-1\\Mod\\FreeCADMCP 플러그인 자동 복사, FreeCADCmd 백그라운드 연결 및 GUI 열람 오류 방지 설정을 함께 처리합니다.',
  },
  {
    key: 'blender' as const,
    group: '건축 MCP',
    badge: '메인 3D · 8·9차시',
    title: 'Blender (선택 사양 버전) + blender-mcp 자동 활성화',
    summary: '위에서 고른 사양(내장형 GPU용 3.6 LTS 포터블 또는 최신 버전)에 맞춰 Blender를 준비하고 MCP 애드온 등록·활성화까지 백그라운드로 자동 완료합니다.',
  },
  {
    key: 'codexConfig' as const,
    group: '자동 연결',
    badge: '자동 병합',
    title: '선택한 MCP만 Codex 설정(config.toml)에 스마트 병합 + 안전 종료',
    summary: '실행 중인 Codex 잔여 프로세스를 먼저 안전하게 내린 뒤, 체크·설치된 MCP만 기존 config.toml에 병합해 재실행 시 연결 충돌을 막습니다.',
  },
  {
    key: 'skills' as const,
    group: '선택 확장',
    badge: '건축 스킬 4종',
    title: 'Codex 건축 스킬 전역 설치 ($cad-drawings · 개념설계 · Gridline · $my-arch-dxf)',
    summary: '어느 작업 폴더를 열어도 바로 $ 기호로 호출할 수 있도록 사용자 전역 스킬 폴더(.agents\\skills)에 4종 스킬을 배치합니다.',
  },
] as const;

export function evaluateSetupWarnings(sel: InstallerSelection): SetupWarning[] {
  const anySelected =
    sel.git ||
    sel.node ||
    sel.pythonUv ||
    sel.optA ||
    sel.optB ||
    sel.blender ||
    sel.codexConfig ||
    sel.skills;

  if (!anySelected) {
    return [
      {
        id: 'none-selected',
        title: '선택된 설치 항목이 없습니다',
        detail: '위 체크박스에서 필요한 항목을 하나 이상 선택하면 맞춤 PowerShell 명령어가 바로 생성됩니다.',
      },
    ];
  }

  const warnings: SetupWarning[] = [];

  if (!sel.pythonUv && (sel.optA || sel.optB || sel.blender || sel.skills)) {
    warnings.push({
      id: 'missing-python-uv',
      title: 'Python 3.12 + uv/uvx가 선택되지 않았습니다',
      detail:
        '선택한 MCP 서버(aiblueprint · FreeCAD · Blender)와 건축 스킬은 Python 및 uv(uvx) 실행기를 사용합니다. 아직 설치하지 않은 PC라면 [필수 3 · Python 3.12 + uv/uvx]를 함께 체크하세요. (이미 설치된 PC라면 아래 명령어를 그대로 복사해 사용해도 됩니다.)',
    });
  }

  if (!sel.git && (sel.optA || sel.optB || sel.skills)) {
    warnings.push({
      id: 'missing-git',
      title: 'Git이 선택되지 않았습니다',
      detail:
        '공개 MCP 저장소와 스킬을 내려받을 때 Git을 사용합니다. 처음 세팅하는 PC라면 [필수 1 · Git]을 함께 체크하는 것을 권장합니다. (옵션 A·B에는 ZIP 자동 다운로드 예비 경로가 포함되어 있으며, 이미 Git이 설치된 PC라면 그대로 복사해 사용해도 됩니다.)',
    });
  }

  if (!sel.node && sel.skills) {
    warnings.push({
      id: 'missing-node-for-skills',
      title: 'Node.js LTS가 선택되지 않았습니다',
      detail:
        '공개 건축 스킬 자동 설치(npx skills add)에는 Node.js가 필요합니다. 아직 Node.js를 설치하지 않은 PC라면 [필수 2 · Node.js LTS]를 함께 체크하세요. (이미 설치된 PC라면 그대로 복사해 사용해도 됩니다.)',
    });
  }

  if (!sel.codexConfig && (sel.optA || sel.optB || sel.blender)) {
    warnings.push({
      id: 'missing-codex-config',
      title: 'Codex 설정(config.toml) 자동 병합이 해제되어 있습니다',
      detail:
        '현재 상태로는 프로그램과 애드온 파일만 설치되며 Codex 앱에는 MCP 서버가 등록되지 않습니다. 설치 직후 Codex에서 바로 사용하려면 [자동 병합 · Codex 설정]을 함께 체크하세요. (직접 수동 편집하려면 이대로 복사해 사용해도 됩니다.)',
    });
  }

  if (sel.codexConfig && !sel.optA && !sel.optB && !sel.blender) {
    warnings.push({
      id: 'config-without-mcp',
      title: 'Codex 설정 병합만 선택되었고 연결할 MCP가 선택되지 않았습니다',
      detail:
        '이미 PC에 설치해 둔 옵션 A · 옵션 B · Blender 중 실제 파일이 확인되는 항목만 config.toml에 반영됩니다. 새로 설치할 MCP가 있다면 해당 항목도 함께 체크하세요.',
    });
  }

  return warnings;
}

export function buildAllInOnePowerShell(
  sel: InstallerSelection,
  customSkillMarkdown: string,
): string {
  const anySelected =
    sel.git ||
    sel.node ||
    sel.pythonUv ||
    sel.optA ||
    sel.optB ||
    sel.blender ||
    sel.codexConfig ||
    sel.skills;

  if (!anySelected) {
    return '# 위 체크박스에서 설치할 항목을 하나 이상 선택해 주세요.';
  }

  const blocks: string[] = [];

  const profileLabel =
    sel.blenderProfile === 'lts36'
      ? '내장형 GPU · 교육장 추천 (Blender 3.6 LTS Portable + 저사양 안전모드)'
      : '외장형 GPU · 고사양 PC (설치 시점 최신 Blender)';
  const policyLabel =
    sel.versionPolicy === 'ask'
      ? '최신 버전 확인 후 구버전이면 업데이트 여부 질문 [Y/N]'
      : sel.versionPolicy === 'latest'
        ? '구버전 감지 시 최신 버전으로 자동 업데이트'
        : '이미 설치되어 있으면 버전 확인 없이 즉시 건너뛰기';

  // [구간 0] 공통 도우미 (64비트/32비트 PowerShell 및 관리자 System32 실행 모두 안전 대응)
  blocks.push(`# ============================================================================
# [건축 AI 올인원 환경 구축 스크립트 — Windows PowerShell 전용]
# - 그래픽/사양 기준 : ${profileLabel}
# - 기존 설치본 처리 : ${policyLabel}
# - 사용법 : 전체 복사 후 일반 PowerShell 창에 붙여넣고 Enter 키를 누르세요.
# - 부분 편집 : 각 [구간] 구분선 단위로 원하는 블록만 남기거나 지워서 실행해도 작동합니다.
# ============================================================================
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction SilentlyContinue
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ProgressPreference = 'SilentlyContinue'
Set-Location $env:USERPROFILE
$VersionPolicy = '${sel.versionPolicy}'
$BlenderProfile = '${sel.blenderProfile}'
$SetupSummary = [System.Collections.Generic.List[object]]::new()

function Add-SetupResult([string]$Item, [string]$Status, [string]$Note) {
  $SetupSummary.Add([PSCustomObject]@{ 항목 = $Item; 상태 = $Status; 비고 = $Note })
}

function Write-Utf8NoBom([string]$FilePath, [string]$Content) {
  $parent = Split-Path -Parent $FilePath
  if ($parent -and -not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  [System.IO.File]::WriteAllText($FilePath, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Get-AllProgramRoots {
  @(
    'C:\\Program Files',
    $env:ProgramW6432,
    $env:ProgramFiles,
    \${env:ProgramFiles(x86)},
    "$env:LOCALAPPDATA\\Programs",
    'C:\\tools'
  ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique
}

function Update-SessionPath {
  $mPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $uPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $pyDirs = @()
  if (Test-Path "$env:LOCALAPPDATA\\Programs\\Python") {
    $pyDirs = Get-ChildItem "$env:LOCALAPPDATA\\Programs\\Python\\Python3*" -Directory -ErrorAction SilentlyContinue |
      ForEach-Object { @($_.FullName, (Join-Path $_.FullName 'Scripts')) }
  }
  $extra = @(
    "$env:USERPROFILE\\.local\\bin",
    "$env:APPDATA\\npm",
    'C:\\Program Files\\Git\\cmd',
    "$env:ProgramW6432\\Git\\cmd",
    "$env:LOCALAPPDATA\\Programs\\Git\\cmd",
    'C:\\Program Files\\nodejs',
    "$env:ProgramW6432\\nodejs"
  ) + $pyDirs
  $merged = (@($mPath, $uPath) + $extra | Where-Object { $_ }) -join ';'
  $env:Path = ($merged -split ';' | Where-Object { $_ } | Select-Object -Unique) -join ';'
}

function Find-FreeCadExe([string]$ExeName = 'FreeCADCmd.exe') {
  foreach ($root in (Get-AllProgramRoots)) {
    $hit = Get-ChildItem -Path (Join-Path $root 'FreeCAD*') -Recurse -Filter $ExeName -ErrorAction SilentlyContinue |
      Sort-Object FullName -Descending | Select-Object -First 1
    if ($hit) { return $hit.FullName }
  }
  $regRoots = @(
    'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
    'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
    'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
  )
  foreach ($rp in $regRoots) {
    $locs = Get-ItemProperty $rp -ErrorAction SilentlyContinue |
      Where-Object { $_.DisplayName -like '*FreeCAD*' -and $_.InstallLocation } |
      Select-Object -ExpandProperty InstallLocation
    foreach ($loc in $locs) {
      if (Test-Path -LiteralPath $loc) {
        $hit = Get-ChildItem -LiteralPath $loc -Recurse -Filter $ExeName -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($hit) { return $hit.FullName }
      }
    }
  }
  return $null
}

function Find-BlenderExe([string]$PreferProfile = 'lts36') {
  if ($PreferProfile -eq 'lts36' -and (Test-Path -LiteralPath 'C:\\tools\\blender-3.6-lts\\blender.exe')) {
    return 'C:\\tools\\blender-3.6-lts\\blender.exe'
  }
  foreach ($root in (Get-AllProgramRoots)) {
    $bfDir = Join-Path $root 'Blender Foundation'
    if (Test-Path -LiteralPath $bfDir) {
      $hit = Get-ChildItem -LiteralPath $bfDir -Recurse -Filter 'blender.exe' -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1
      if ($hit) { return $hit.FullName }
    }
  }
  if (Test-Path -LiteralPath 'C:\\tools\\blender-3.6-lts\\blender.exe') {
    return 'C:\\tools\\blender-3.6-lts\\blender.exe'
  }
  $regRoots = @(
    'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
    'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
    'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
  )
  foreach ($rp in $regRoots) {
    $locs = Get-ItemProperty $rp -ErrorAction SilentlyContinue |
      Where-Object { $_.DisplayName -like '*Blender*' -and $_.InstallLocation } |
      Select-Object -ExpandProperty InstallLocation
    foreach ($loc in $locs) {
      if (Test-Path -LiteralPath $loc) {
        $hit = Get-ChildItem -LiteralPath $loc -Recurse -Filter 'blender.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($hit) { return $hit.FullName }
      }
    }
  }
  return $null
}

function Stop-CodexCleanly {
  $procs = Get-Process -Name @('Codex', 'codex', 'codex-computer-use', 'node_repl') -ErrorAction SilentlyContinue
  if ($procs) {
    Write-Host "  -> 실행 중인 Codex 백그라운드 프로세스를 안전하게 정리하고 있습니다 (재실행 충돌 방지)..." -ForegroundColor Yellow
    $procs | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
  }
}

function Test-RealPython {
  Update-SessionPath
  $cmds = Get-Command python -All -ErrorAction SilentlyContinue | Where-Object { $_.Source -notlike '*WindowsApps*' }
  foreach ($c in $cmds) {
    $ver = & $c.Source --version 2>&1
    if ($LASTEXITCODE -eq 0 -and "$ver" -match '^Python 3\\.(1[0-9]|[2-9][0-9])') { return $c.Source }
  }
  return $null
}

function Install-OrUpdateWinget([string]$Id, [string]$Label, [scriptblock]$CheckInstalled, [string]$ExtraArgs = '') {
  Write-Host "\`n▶ [$Label] 설치 상태 확인 중..." -ForegroundColor Cyan
  Update-SessionPath
  $isInstalled = & $CheckInstalled
  if (-not $isInstalled) {
    $listOut = winget list --exact --id $Id --source winget --accept-source-agreements 2>$null | Out-String
    if ($listOut -match [regex]::Escape($Id)) { $isInstalled = $true }
  }

  if (-not $isInstalled) {
    Write-Host "  -> 미설치 상태입니다. 공식 패키지($Id) 신규 설치를 시작합니다..." -ForegroundColor Yellow
    $argList = @('install', '--exact', '--id', $Id, '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements')
    if ($ExtraArgs) { $argList += ($ExtraArgs -split ' ') }
    & winget @argList
    Start-Sleep -Seconds 1
    Update-SessionPath
    Add-SetupResult $Label '신규 설치 완료' $Id
    return
  }

  if ($VersionPolicy -eq 'skip') {
    Write-Host "  [✓ 이미 설치됨] 버전 확인을 건너뛰고 바로 넘어갑니다." -ForegroundColor Green
    Add-SetupResult $Label '이미 설치됨 (건너뜀)' '기존 버전 유지'
    return
  }

  $upgOut = winget list --exact --id $Id --source winget --upgrade-available --accept-source-agreements 2>$null | Out-String
  if ($upgOut -match [regex]::Escape($Id)) {
    $doUpgrade = ($VersionPolicy -eq 'latest')
    if ($VersionPolicy -eq 'ask') {
      $ans = Read-Host "  [?] $Label 의 최신 버전이 있습니다. 지금 업데이트할까요? (Y=최신 설치 / Enter=현재 버전 유지)"
      $doUpgrade = ($ans -match '^[Yy]')
    }
    if ($doUpgrade) {
      Write-Host "  -> $Label 최신 버전으로 업데이트 중..." -ForegroundColor Yellow
      winget upgrade --exact --id $Id --source winget --accept-package-agreements --accept-source-agreements
      Update-SessionPath
      Add-SetupResult $Label '최신 업데이트 완료' $Id
    } else {
      Write-Host "  [→ 현재 버전 유지] 기존 설치 버전을 그대로 사용합니다." -ForegroundColor Green
      Add-SetupResult $Label '기존 버전 유지' '업데이트 생략'
    }
  } else {
    Write-Host "  [✓ 최신 버전 확인됨] 이미 최신 상태이므로 건너뜁니다." -ForegroundColor Green
    Add-SetupResult $Label '최신 버전 확인됨' '건너뜀'
  }
}

function Sync-GitHubRepo([string]$RepoSlug, [string]$Branch, [string]$TargetDir, [string]$Label) {
  $parentDir = Split-Path -Parent $TargetDir
  New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
  Update-SessionPath
  $gitCmd = Get-Command git -ErrorAction SilentlyContinue

  if (Test-Path -LiteralPath $TargetDir) {
    if ((Test-Path -LiteralPath (Join-Path $TargetDir '.git')) -and $gitCmd -and $VersionPolicy -ne 'skip') {
      git -C $TargetDir fetch origin $Branch --quiet 2>$null
      $localRev  = (git -C $TargetDir rev-parse HEAD 2>$null)
      $remoteRev = (git -C $TargetDir rev-parse "origin/$Branch" 2>$null)
      if ($localRev -and $remoteRev -and ($localRev -ne $remoteRev)) {
        $doPull = ($VersionPolicy -eq 'latest')
        if ($VersionPolicy -eq 'ask') {
          $ans = Read-Host "  [?] $Label 저장소에 새 업데이트가 있습니다. 반영할까요? (Y=업데이트 / Enter=유지)"
          $doPull = ($ans -match '^[Yy]')
        }
        if ($doPull) {
          git -C $TargetDir pull --ff-only origin $Branch
          Write-Host "  [✓ 업데이트 완료] $Label 최신 반영 완료" -ForegroundColor Green
          return
        }
      }
    }
    Write-Host "  [✓ 이미 준비됨] $TargetDir 폴더를 그대로 사용합니다." -ForegroundColor Green
    return
  }

  if ($gitCmd) {
    Write-Host "  -> Git으로 $Label 내려받는 중..." -ForegroundColor Yellow
    git clone "https://github.com/$RepoSlug.git" $TargetDir
  } else {
    Write-Host "  -> Git 미설치 감지: ZIP 압축본으로 $Label 내려받는 중..." -ForegroundColor Yellow
    $zipFile = Join-Path $env:TEMP (($RepoSlug -replace '/', '_') + '.zip')
    $extractTmp = Join-Path $env:TEMP (($RepoSlug -replace '/', '_') + '_extract')
    Remove-Item -LiteralPath $zipFile, $extractTmp -Recurse -Force -ErrorAction SilentlyContinue
    curl.exe -fsSL "https://github.com/$RepoSlug/archive/refs/heads/$Branch.zip" -o $zipFile
    Expand-Archive -LiteralPath $zipFile -DestinationPath $extractTmp -Force
    $inner = Get-ChildItem -LiteralPath $extractTmp -Directory | Select-Object -First 1
    Move-Item -LiteralPath $inner.FullName -Destination $TargetDir -Force
    Remove-Item -LiteralPath $zipFile, $extractTmp -Recurse -Force -ErrorAction SilentlyContinue
  }
}
# -------------------- [공통 준비 도우미 끝] --------------------`);

  // [구간 1] Git
  if (sel.git) {
    blocks.push(`# ============================================================================
# [구간 1] Git 설치 및 현재 창 PATH 즉시 반영
# ============================================================================
Install-OrUpdateWinget -Id 'Git.Git' -Label 'Git' -CheckInstalled {
  [bool](Get-Command git -ErrorAction SilentlyContinue)
}
# -------------------- [구간 1 끝] --------------------`);
  }

  // [구간 2] Node.js LTS
  if (sel.node) {
    blocks.push(`# ============================================================================
# [구간 2] Node.js LTS 설치 (로컬 자동화 서버 및 npx 스킬 설치용)
# ============================================================================
Install-OrUpdateWinget -Id 'OpenJS.NodeJS.LTS' -Label 'Node.js LTS' -CheckInstalled {
  [bool](Get-Command node -ErrorAction SilentlyContinue)
}
# -------------------- [구간 2 끝] --------------------`);
  }

  // [구간 3] Python 3.12 + uv / uvx + 공통 패키지
  if (sel.pythonUv) {
    blocks.push(`# ============================================================================
# [구간 3] Python 3.12 + uv / uvx 실행기 및 도면 처리 공통 패키지
# ============================================================================
Install-OrUpdateWinget -Id 'Python.Python.3.12' -Label 'Python 3.12' -ExtraArgs '--scope user' -CheckInstalled {
  [bool](Test-RealPython)
}

Write-Host "\`n▶ [uv / uvx 실행기] 설치 상태 확인 중..." -ForegroundColor Cyan
Update-SessionPath
$uvCheck = Get-Command uv -ErrorAction SilentlyContinue
if (-not $uvCheck -and (Test-Path "$env:USERPROFILE\\.local\\bin\\uv.exe")) {
  $uvCheck = Get-Item "$env:USERPROFILE\\.local\\bin\\uv.exe"
}
if (-not $uvCheck) {
  Write-Host "  -> uv / uvx 공식 설치 진행 중..." -ForegroundColor Yellow
  irm https://astral.sh/uv/install.ps1 | iex
  Update-SessionPath
  Add-SetupResult 'uv / uvx' '신규 설치 완료' "$env:USERPROFILE\\.local\\bin"
} else {
  if ($VersionPolicy -eq 'latest') {
    uv self update 2>$null | Out-Null
    Add-SetupResult 'uv / uvx' '최신 확인 완료' 'uv self update'
  } else {
    Write-Host "  [✓ 이미 설치됨] uv / uvx 실행기를 그대로 사용합니다." -ForegroundColor Green
    Add-SetupResult 'uv / uvx' '이미 설치됨 (건너뜀)' (& uv --version)
  }
}

$realPy = Test-RealPython
if ($realPy) {
  Write-Host "  -> 건축 도면·스킬 공통 Python 패키지(ezdxf · pymupdf · pypdf · matplotlib · pillow) 점검 중..." -ForegroundColor Cyan
  & $realPy -m pip install --quiet --disable-pip-version-check ezdxf pymupdf pypdf matplotlib pillow
  Add-SetupResult '도면 공통 Python 패키지' '준비 완료' 'ezdxf, pymupdf, pypdf, matplotlib, pillow'
}
# -------------------- [구간 3 끝] --------------------`);
  }

  // [구간 4] 옵션 A: LibreCAD + aiblueprint-mcp
  if (sel.optA) {
    blocks.push(`# ============================================================================
# [구간 4] 옵션 A (2D 도면) · LibreCAD 뷰어 + aiblueprint-mcp 준비
# ============================================================================
Install-OrUpdateWinget -Id 'LibreCAD.LibreCAD' -Label 'LibreCAD (2D CAD 뷰어)' -CheckInstalled {
  [bool]((Get-AllProgramRoots) | Where-Object { Test-Path (Join-Path $_ 'LibreCAD\\LibreCAD.exe') } | Select-Object -First 1)
}

Write-Host "\`n▶ [옵션 A · aiblueprint-mcp] 저장소 및 가상환경 점검 중..." -ForegroundColor Cyan
Sync-GitHubRepo -RepoSlug 'thebossnow/aiblueprint-mcp' -Branch 'main' -TargetDir 'C:\\mcp\\aiblueprint-mcp' -Label 'aiblueprint-mcp'
Update-SessionPath
if (Get-Command uv -ErrorAction SilentlyContinue) {
  uv --directory 'C:\\mcp\\aiblueprint-mcp' sync --quiet
  $optAOk = Test-Path 'C:\\mcp\\aiblueprint-mcp\\.venv\\Scripts\\aiblueprint-mcp.exe'
  Add-SetupResult '옵션 A (aiblueprint-mcp)' ($(if ($optAOk) { '준비 완료' } else { '확인 필요' })) 'C:\\mcp\\aiblueprint-mcp'
} else {
  Write-Host "  [!] uv가 아직 설치되지 않아 uv sync를 건너뛰었습니다. [구간 3]을 먼저 실행해 주세요." -ForegroundColor Yellow
  Add-SetupResult '옵션 A (aiblueprint-mcp)' '보류 (uv 필요)' '폴더 다운로드만 완료'
}
# -------------------- [구간 4 끝] --------------------`);
  }

  // [구간 5] 옵션 B: FreeCAD + freecad-mcp + GUI 에러 방지
  if (sel.optB) {
    blocks.push(`# ============================================================================
# [구간 5] 옵션 B (3D CAD/BIM) · FreeCAD + freecad-mcp + GUI 오류 방지 설정
# ============================================================================
Install-OrUpdateWinget -Id 'FreeCAD.FreeCAD' -Label 'FreeCAD' -CheckInstalled {
  [bool](Find-FreeCadExe 'FreeCADCmd.exe')
}

Write-Host "\`n▶ [옵션 B · freecad-mcp] 플러그인 자동 복사 및 백그라운드 엔진 점검 중..." -ForegroundColor Cyan
Sync-GitHubRepo -RepoSlug 'neka-nat/freecad-mcp' -Branch 'main' -TargetDir 'C:\\mcp\\freecad-mcp' -Label 'freecad-mcp'

foreach ($modSub in @('FreeCAD\\v1-1\\Mod', 'FreeCAD\\Mod')) {
  $destMod = Join-Path $env:APPDATA $modSub
  New-Item -ItemType Directory -Force -Path $destMod | Out-Null
  Copy-Item -Recurse -Force 'C:\\mcp\\freecad-mcp\\addon\\FreeCADMCP' "$destMod\\"
}

if ($BlenderProfile -eq 'lts36') {
  $fcGuiPath = Find-FreeCadExe 'FreeCAD.exe'
  if ($fcGuiPath) {
    $desk = [Environment]::GetFolderPath('Desktop')
    $safeCmd = Join-Path $desk 'FreeCAD (내장GPU 안전실행).cmd'
    $cmdBody = "@echo off\`r\`nset QT_OPENGL=software\`r\`nstart \`"\`" \`"$fcGuiPath\`" %*\`r\`n"
    Write-Utf8NoBom $safeCmd $cmdBody
    Write-Host "  [✓ 저사양 보호] 바탕화면에 'FreeCAD (내장GPU 안전실행).cmd' 생성 완료" -ForegroundColor Green
  }
}

if (Get-Command uvx -ErrorAction SilentlyContinue) {
  uvx freecad-mcp --help 2>$null | Out-Null
}
$fcCmdConfirm = Find-FreeCadExe 'FreeCADCmd.exe'
Add-SetupResult '옵션 B (FreeCAD + MCP)' ($(if ($fcCmdConfirm) { '준비 완료' } else { '경로 확인 필요' })) ($(if ($fcCmdConfirm) { $fcCmdConfirm } else { 'FreeCADCmd 미검출' }))
# -------------------- [구간 5 끝] --------------------`);
  }

  // [구간 6] 메인 3D: Blender (3.6 LTS Portable vs Latest) + blender-mcp 무인 애드온 등록
  if (sel.blender) {
    if (sel.blenderProfile === 'lts36') {
      blocks.push(`# ============================================================================
# [구간 6] 메인 3D · Blender 3.6 LTS Portable (내장형 GPU 추천) + MCP 애드온 자동 활성화
# ============================================================================
Write-Host "\`n▶ [Blender 3.6 LTS Portable] 설치 상태 확인 중..." -ForegroundColor Cyan
$blenderDir = 'C:\\tools\\blender-3.6-lts'
$blenderExe = Join-Path $blenderDir 'blender.exe'

if (Test-Path -LiteralPath $blenderExe) {
  Write-Host "  [✓ 이미 설치됨] 내장형 GPU 호환용 Blender 3.6 LTS Portable을 그대로 유지합니다." -ForegroundColor Green
} else {
  Write-Host "  -> 공식 Blender 3.6.23 LTS Portable 다운로드 중 (내장 그래픽 OpenGL 3.3 완벽 호환)..." -ForegroundColor Yellow
  New-Item -ItemType Directory -Force -Path 'C:\\tools' | Out-Null
  $blZip = Join-Path $env:TEMP 'blender-3.6.23-windows-x64.zip'
  $blTmp = Join-Path $env:TEMP 'blender_36_extract'
  Remove-Item -LiteralPath $blZip, $blTmp -Recurse -Force -ErrorAction SilentlyContinue
  curl.exe -fL --retry 3 'https://download.blender.org/release/Blender3.6/blender-3.6.23-windows-x64.zip' -o $blZip
  Write-Host "  -> C:\\tools\\blender-3.6-lts 폴더로 압축 해제 중..." -ForegroundColor Yellow
  Expand-Archive -LiteralPath $blZip -DestinationPath $blTmp -Force
  $extractedRoot = Get-ChildItem -LiteralPath $blTmp -Directory | Select-Object -First 1
  if (Test-Path -LiteralPath $blenderDir) { Remove-Item -LiteralPath $blenderDir -Recurse -Force }
  Move-Item -LiteralPath $extractedRoot.FullName -Destination $blenderDir -Force
  Remove-Item -LiteralPath $blZip, $blTmp -Recurse -Force -ErrorAction SilentlyContinue

  $desk = [Environment]::GetFolderPath('Desktop')
  $wsh = New-Object -ComObject WScript.Shell
  $lnk = $wsh.CreateShortcut((Join-Path $desk 'Blender 3.6 LTS (실습용).lnk'))
  $lnk.TargetPath = $blenderExe
  $lnk.WorkingDirectory = $blenderDir
  $lnk.Save()
  Write-Host "  [✓ 설치 완료] 바탕화면에 'Blender 3.6 LTS (실습용)' 바로가기를 만들었습니다." -ForegroundColor Green
}`);
    } else {
      blocks.push(`# ============================================================================
# [구간 6] 메인 3D · 최신 Blender (외장형 GPU · 고사양) + MCP 애드온 자동 활성화
# ============================================================================
Install-OrUpdateWinget -Id 'BlenderFoundation.Blender' -Label 'Blender (최신 버전)' -CheckInstalled {
  [bool](Find-BlenderExe 'latest')
}
$blenderExe = Find-BlenderExe 'latest'`);
    }

    blocks.push(`Write-Host "\`n▶ [Blender MCP 애드온] 다운로드 및 백그라운드 자동 활성화 중..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path 'C:\\mcp\\blender-mcp' | Out-Null
$addonPy = 'C:\\mcp\\blender-mcp\\blender_mcp_addon.py'
if (-not (Test-Path -LiteralPath $addonPy) -or $VersionPolicy -eq 'latest') {
  curl.exe -fsSL 'https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py' -o $addonPy 2>$null
  if (-not (Test-Path -LiteralPath $addonPy)) {
    curl.exe -fsSL 'https://asvan-o.github.io/ai-architecture-design-ebook/workbook/downloads/lesson-08/blender_mcp_addon.py' -o $addonPy
  }
}

if ($blenderExe -and (Test-Path -LiteralPath $blenderExe) -and (Test-Path -LiteralPath $addonPy)) {
  $regPy = 'C:\\mcp\\blender-mcp\\register_blender_mcp.py'
  $pyLines = @(
    'import bpy',
    "bpy.ops.preferences.addon_install(overwrite=True, filepath=r'$addonPy')",
    "bpy.ops.preferences.addon_enable(module='blender_mcp_addon')",
    'bpy.ops.wm.save_userpref()',
    "print('BLENDER_MCP_READY')"
  ) -join "\`n"
  Write-Utf8NoBom $regPy $pyLines
  & $blenderExe -b --python $regPy 2>$null | Out-Null
  Write-Host "  [✓ 애드온 자동 등록 완료] Blender 실행 후 N키 -> MCP for Blender 탭에서 서버만 켜면 바로 연결됩니다." -ForegroundColor Green
  Add-SetupResult '메인 3D (Blender + MCP)' '준비 완료' $blenderExe
} else {
  Write-Host "  [!] Blender 실행 파일을 찾지 못해 애드온 자동 등록을 건너뛰었습니다." -ForegroundColor Yellow
  Add-SetupResult '메인 3D (Blender + MCP)' '확인 필요' 'Blender 경로 미검출'
}

if (Get-Command uvx -ErrorAction SilentlyContinue) {
  uvx blender-mcp --help 2>$null | Out-Null
}
# -------------------- [구간 6 끝] --------------------`);
  }

  // [구간 7] Codex 안전 종료 + config.toml 스마트 부분 병합 + FreeCAD 안전 규칙
  if (sel.codexConfig) {
    const mergeTargets: string[] = [];
    if (sel.optA) mergeTargets.push("'aiblueprint'");
    if (sel.optB) mergeTargets.push("'freecad'");
    if (sel.blender) mergeTargets.push("'blender'");
    const targetListExpr =
      mergeTargets.length > 0
        ? `@(${mergeTargets.join(', ')})`
        : "@('aiblueprint', 'freecad', 'blender')";

    blocks.push(`# ============================================================================
# [구간 7] Codex 안전 종료 후 선택한 MCP만 config.toml에 스마트 병합 (기존 설정 보존)
# ============================================================================
Write-Host "\`n▶ [Codex 통합 연결] 잔여 프로세스 정리 후 선택·설치된 MCP를 config.toml에 병합 중..." -ForegroundColor Cyan
Stop-CodexCleanly
Update-SessionPath
$codexDir = Join-Path $env:USERPROFILE '.codex'
$configPath = Join-Path $codexDir 'config.toml'
New-Item -ItemType Directory -Force -Path $codexDir | Out-Null

$uvBin  = (Get-Command uv -ErrorAction SilentlyContinue).Source
if (-not $uvBin)  { $uvBin  = Join-Path $env:USERPROFILE '.local\\bin\\uv.exe' }
$uvxBin = (Get-Command uvx -ErrorAction SilentlyContinue).Source
if (-not $uvxBin) { $uvxBin = Join-Path $env:USERPROFILE '.local\\bin\\uvx.exe' }
$fcCmdPath = Find-FreeCadExe 'FreeCADCmd.exe'
$blExePath = Find-BlenderExe $BlenderProfile

$requestedMcps = ${targetListExpr}
$mcpBlocks = [ordered]@{}

if (($requestedMcps -contains 'aiblueprint') -and (Test-Path 'C:\\mcp\\aiblueprint-mcp\\pyproject.toml')) {
  $mcpBlocks['aiblueprint'] = @(
    '[mcp_servers.aiblueprint]',
    "command = '$uvBin'",
    'args = ["run", "--directory", ''C:\\mcp\\aiblueprint-mcp'', "aiblueprint-mcp"]',
    'startup_timeout_sec = 60'
  ) -join "\`n"
}

if (($requestedMcps -contains 'freecad') -and $fcCmdPath) {
  $mcpBlocks['freecad'] = @(
    '[mcp_servers.freecad]',
    "command = '$uvxBin'",
    "args = [\`"freecad-mcp\`", \`"--host\`", \`"127.0.0.1\`", \`"--freecadcmd\`", '$fcCmdPath']",
    'startup_timeout_sec = 60'
  ) -join "\`n"
}

if (($requestedMcps -contains 'blender') -and ($blExePath -or (Test-Path 'C:\\mcp\\blender-mcp\\blender_mcp_addon.py'))) {
  $mcpBlocks['blender'] = @(
    '[mcp_servers.blender]',
    "command = '$uvxBin'",
    'args = ["blender-mcp"]',
    'startup_timeout_sec = 60'
  ) -join "\`n"
}

if ($mcpBlocks.Count -gt 0) {
  $existingToml = ''
  if (Test-Path -LiteralPath $configPath) {
    Copy-Item -LiteralPath $configPath -Destination ($configPath + '.bak') -Force
    $existingToml = [System.IO.File]::ReadAllText($configPath, [System.Text.Encoding]::UTF8)
  }

  foreach ($mcpName in $mcpBlocks.Keys) {
    $pattern = "(?ms)^\\s*\\[mcp_servers\\." + [regex]::Escape($mcpName) + "\\]\\s*\\r?\\n.*?(?=^\\s*\\[|\\z)"
    $existingToml = [regex]::Replace($existingToml, $pattern, '')
  }

  $existingToml = $existingToml.TrimEnd()
  $newSections = ($mcpBlocks.Values -join "\`n\`n")
  $finalToml = if ($existingToml) { $existingToml + "\`n\`n" + $newSections + "\`n" } else { $newSections + "\`n" }
  Write-Utf8NoBom $configPath $finalToml
  Write-Host "  [✓ config.toml 반영 완료] 등록된 MCP: $($mcpBlocks.Keys -join ', ')" -ForegroundColor Green
  Add-SetupResult 'Codex config.toml 병합' '등록 완료' ($mcpBlocks.Keys -join ', ')
} else {
  Write-Host "  [!] 등록할 설치 완료 MCP가 없어 config.toml을 변경하지 않았습니다." -ForegroundColor Yellow
  Add-SetupResult 'Codex config.toml 병합' '변경 없음' '설치된 대상 MCP 없음'
}

if ($mcpBlocks.Contains('freecad')) {
  $agentsPath = Join-Path $codexDir 'AGENTS.md'
  $guardStart = '<!-- ARCH-FREECAD-HEADLESS-GUARD-START -->'
  $guardEnd   = '<!-- ARCH-FREECAD-HEADLESS-GUARD-END -->'
  $guardBlock = @(
    $guardStart,
    '## FreeCAD MCP 무오류 실행 규칙 (GUI 충돌 방지)',
    '- FreeCAD 파일 생성·치수 검증 요청 시 반드시 execute_code_headless 도구와 순수 Part 솔리드(Part::Feature)만 사용하세요.',
    '- 헤드리스 모드에서 GUI ViewObject 오류를 일으키는 FreeCADGui, Draft, Arch 모듈 호출과 FreeCAD.exe 창 직접 실행을 금지합니다.',
    '- 저장 시 .FCStd와 함께 호환용 .step 또는 .obj 파일을 함께 저장하고, 화면 열기는 사용자가 직접 수행하도록 경로만 안내하세요.',
    $guardEnd
  ) -join "\`n"
  $existingAgents = if (Test-Path -LiteralPath $agentsPath) { [System.IO.File]::ReadAllText($agentsPath, [System.Text.Encoding]::UTF8) } else { '' }
  $guardPattern = "(?ms)" + [regex]::Escape($guardStart) + ".*?" + [regex]::Escape($guardEnd)
  $existingAgents = [regex]::Replace($existingAgents, $guardPattern, '').TrimEnd()
  $finalAgents = if ($existingAgents) { $existingAgents + "\`n\`n" + $guardBlock + "\`n" } else { $guardBlock + "\`n" }
  Write-Utf8NoBom $agentsPath $finalAgents
  Write-Host "  [✓ FreeCAD GUI 오류 방지 규칙] .codex\\AGENTS.md 자동 적용 완료" -ForegroundColor Green
}
# -------------------- [구간 7 끝] --------------------`);
  }

  // [구간 8] Codex 건축 스킬 4종 전역 설치
  if (sel.skills) {
    const escapedSkillLines = customSkillMarkdown
      .split(/\r?\n/)
      .map((line) => `'${line.replace(/'/g, "''")}'`)
      .join(',\n  ');

    blocks.push(`# ============================================================================
# [구간 8] Codex 건축 스킬 4종 사용자 전역 설치 (어느 작업 폴더에서든 $ 호출 가능)
# ============================================================================
Write-Host "\`n▶ [Codex 건축 스킬 4종] 전역 설치 점검 중..." -ForegroundColor Cyan
Update-SessionPath
$npxCmd = Get-Command npx.cmd -ErrorAction SilentlyContinue
if (-not $npxCmd) { $npxCmd = Get-Command npx -ErrorAction SilentlyContinue }
$agentsSkillsRoot = Join-Path $env:USERPROFILE '.agents\\skills'
$codexSkillsRoot  = Join-Path $env:USERPROFILE '.codex\\skills'
New-Item -ItemType Directory -Force -Path $agentsSkillsRoot, $codexSkillsRoot | Out-Null

if ($npxCmd) {
  $publicSkills = @(
    @{ Folder = 'cad-drawings'; Label = 'cad-drawings'; Args = @('--yes', 'skills', 'add', 'numikel/cad-drawings', '-g', '--skill', 'cad-drawings', '-a', 'codex', '--copy', '-y') },
    @{ Folder = 'architectural-concept-design'; Label = 'architectural-concept-design'; Args = @('--yes', 'skills', 'add', 'Mhrnqaruni/ai-agent-skill-architectural-concept-design', '-g', '--skill', 'architectural-concept-design', '-a', 'codex', '--copy', '-y') },
    @{ Folder = 'architecture-programming'; Label = 'Gridline 3종'; Args = @('--yes', 'skills', 'add', 'MakeItEzzz555/Gridline', '-g', '--skill', 'architecture-programming', '--skill', 'architectural-drawing-generation', '--skill', 'visualization-rendering', '-a', 'codex', '--copy', '-y') }
  )
  foreach ($sk in $publicSkills) {
    $exists = (Test-Path -LiteralPath (Join-Path $agentsSkillsRoot ($sk.Folder + '\\SKILL.md'))) -or
              (Test-Path -LiteralPath (Join-Path $codexSkillsRoot  ($sk.Folder + '\\SKILL.md')))
    if ($exists -and $VersionPolicy -eq 'skip') {
      Write-Host "  [✓ 이미 설치됨] $($sk.Label) 스킬 건너뜀" -ForegroundColor Green
    } elseif ($exists -and $VersionPolicy -eq 'ask') {
      $ans = Read-Host "  [?] $($sk.Label) 스킬이 이미 설치되어 있습니다. 최신본으로 갱신할까요? (Y=갱신 / Enter=유지)"
      if ($ans -match '^[Yy]') { & $npxCmd.Source @($sk.Args) }
    } else {
      Write-Host "  -> $($sk.Label) 스킬 전역 설치 중..." -ForegroundColor Yellow
      & $npxCmd.Source @($sk.Args)
    }
  }
} else {
  Write-Host "  [!] Node.js(npx)가 없어 공개 스킬 3종 자동 설치를 건너뛰었습니다. [구간 2]를 함께 실행해 주세요." -ForegroundColor Yellow
}

$customSkillBody = @(
  ${escapedSkillLines}
) -join "\`n"
foreach ($rootDir in @($agentsSkillsRoot, $codexSkillsRoot)) {
  Write-Utf8NoBom (Join-Path $rootDir 'my-arch-dxf\\SKILL.md') $customSkillBody
}
Write-Host '  [✓ 나만의 스킬 준비 완료] $my-arch-dxf 전역 등록 완료' -ForegroundColor Green
Add-SetupResult 'Codex 건축 스킬 4종' '전역 배치 완료' '$cad-drawings · 개념설계 · Gridline · $my-arch-dxf'
# -------------------- [구간 8 끝] --------------------`);
  }

  // [최종 요약표]
  blocks.push(`# ============================================================================
# [최종 완료 요약표]
# ============================================================================
Write-Host "\`n============================================================================" -ForegroundColor Green
Write-Host "  건축 AI 올인원 환경 준비가 끝났습니다! 아래 요약표를 확인하세요." -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
$SetupSummary | Format-Table -AutoSize
Write-Host "▶ 다음 할 일 1) 이제 시작 메뉴에서 Codex 앱을 새로 실행하세요. (이전 백그라운드 프로세스는 자동 정리됨)" -ForegroundColor Cyan
Write-Host "▶ 다음 할 일 2) 옵션 A·B 파일 생성은 별도 창 없이 바로 실행되며, Blender 실시간 조작 시에만 N키 -> Start MCP Server를 켜세요.\`n" -ForegroundColor Cyan`);

  return blocks.join('\n\n');
}
