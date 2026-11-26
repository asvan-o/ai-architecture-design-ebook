// 제7-3차시 · AutoCAD & SketchUp MCP 올인원 체크박스 설치 빌더 (PowerShell / BAT / JSON / TOML 생성기)

export type AutoCadBackend = 'auto' | 'com' | 'ezdxf';
export type ExistingPolicy = 'skip' | 'update';

export interface CadSkpInstallerSelection {
  pythonUv: boolean;
  autocadMcp: boolean;
  sketchupPlugin: boolean;
  sketchupMcp: boolean;
  codexConfig: boolean;
  antigravityConfig: boolean;
  claudeConfig: boolean;
  cursorConfig: boolean;
  backupExisting: boolean;
  runDiagnostics: boolean;
  autocadBackend: AutoCadBackend;
  existingPolicy: ExistingPolicy;
}

export interface CadSkpSetupWarning {
  id: string;
  title: string;
  detail: string;
}

export const defaultCadSkpSelection: CadSkpInstallerSelection = {
  pythonUv: true,
  autocadMcp: true,
  sketchupPlugin: true,
  sketchupMcp: true,
  codexConfig: true,
  antigravityConfig: true,
  claudeConfig: true,
  cursorConfig: false,
  backupExisting: true,
  runDiagnostics: true,
  autocadBackend: 'auto',
  existingPolicy: 'skip',
};

export const cadSkpModuleMeta = [
  {
    key: 'pythonUv' as const,
    group: '공통 기반',
    badge: '필수 1',
    title: 'uv / uvx 실행기 확인 및 자동 설치',
    summary:
      'AutoCAD MCP와 SketchUp MCP를 별도 가상환경 없이 즉시 실행하는 도구입니다. 이미 설치된 PC는 자동으로 건너뜁니다.',
  },
  {
    key: 'autocadMcp' as const,
    group: 'AutoCAD MCP',
    badge: '2D·3D CAD',
    title: 'AutoCAD MCP (autocad-mcp-pro[com] 듀얼 엔진)',
    summary:
      'Windows AutoCAD(일반판·체험판) 실시간 COM 제어와 미설치·LT 환경용 ezdxf 도면 생성을 모두 지원합니다. (AutoCAD 본체는 공식 사이트에서 직접 설치)',
  },
  {
    key: 'sketchupPlugin' as const,
    group: 'SketchUp MCP',
    badge: '1계층 자동 배치',
    title: 'SketchUp su_mcp 루비 플러그인 자동 설치 (이중 중첩 자동 방지)',
    summary:
      'PC에 설치된 SketchUp 2021~2027 프로필 폴더를 자동 탐지해 Plugins\\su_mcp.rb + Plugins\\su_mcp\\main.rb 정상 1계층 구조로 배치하고 기존 중첩 오류 폴더를 정리합니다.',
  },
  {
    key: 'sketchupMcp' as const,
    group: 'SketchUp MCP',
    badge: '로컬 9876 연결',
    title: 'SketchUp MCP 브리지 (uvx sketchup-mcp)',
    summary:
      'AI 클라이언트와 SketchUp 내부 루비 서버(127.0.0.1:9876)를 실시간으로 이어 주는 표준 MCP 서버 항목을 구성합니다.',
  },
  {
    key: 'codexConfig' as const,
    group: 'AI 클라이언트',
    badge: 'Codex',
    title: 'OpenAI Codex (config.toml) 스마트 병합 + 안전 종료',
    summary:
      '실행 중인 Codex 잔여 프로세스를 안전하게 내린 뒤, 기존 MCP(Blender·FreeCAD 등)는 그대로 보존하고 체크한 항목만 %USERPROFILE%\\.codex\\config.toml에 반영합니다.',
  },
  {
    key: 'antigravityConfig' as const,
    group: 'AI 클라이언트',
    badge: 'Antigravity',
    title: 'Antigravity · Gemini (mcp_config.json) 스마트 병합',
    summary:
      '%USERPROFILE%\\.gemini\\config\\mcp_config.json에 기존 MCP 설정을 유지하면서 선택한 AutoCAD·SketchUp MCP만 추가합니다.',
  },
  {
    key: 'claudeConfig' as const,
    group: 'AI 클라이언트',
    badge: 'Claude Desktop',
    title: 'Claude Desktop (claude_desktop_config.json) 스마트 병합',
    summary:
      '%APPDATA%\\Claude\\claude_desktop_config.json에 선택한 MCP 항목을 JSON 문법 오류 없이 자동 병합합니다.',
  },
  {
    key: 'cursorConfig' as const,
    group: 'AI 클라이언트',
    badge: 'Cursor IDE',
    title: 'Cursor IDE (mcp.json) 스마트 병합',
    summary:
      '%USERPROFILE%\\.cursor\\mcp.json에 선택한 MCP 항목을 자동 병합합니다. Cursor를 사용하지 않는다면 해제해 두세요.',
  },
  {
    key: 'backupExisting' as const,
    group: '안전 옵션',
    badge: '백업 권장',
    title: '기존 설정 파일 자동 백업 (.bak 생성)',
    summary:
      '설정 파일을 수정하기 직전 타임스탬프가 붙은 .bak 사본을 남겨 언제든 이전 상태로 되돌릴 수 있게 보호합니다.',
  },
  {
    key: 'runDiagnostics' as const,
    group: '검증 옵션',
    badge: '자동 진단',
    title: '설치 완료 후 PC 연동 상태 자동 진단표 출력',
    summary:
      'uvx 경로, AutoCAD 감지 여부, SketchUp su_mcp 1계층 정상 여부, 포트 9876 열림 상태, AI 설정 등록 결과를 한눈에 표로 점검합니다.',
  },
] as const;

export function evaluateCadSkpWarnings(sel: CadSkpInstallerSelection): CadSkpSetupWarning[] {
  const anyWork =
    sel.pythonUv ||
    sel.autocadMcp ||
    sel.sketchupPlugin ||
    sel.sketchupMcp ||
    sel.codexConfig ||
    sel.antigravityConfig ||
    sel.claudeConfig ||
    sel.cursorConfig;

  if (!anyWork) {
    return [
      {
        id: 'none-selected',
        title: '선택된 설치 항목이 없습니다',
        detail: '위 체크박스에서 필요한 항목을 하나 이상 선택하면 맞춤 PowerShell 명령어와 설정 코드가 바로 생성됩니다.',
      },
    ];
  }

  const warnings: CadSkpSetupWarning[] = [];
  const anyMcp = sel.autocadMcp || sel.sketchupMcp;
  const anyClient = sel.codexConfig || sel.antigravityConfig || sel.claudeConfig || sel.cursorConfig;

  if (!sel.pythonUv && anyMcp) {
    warnings.push({
      id: 'missing-uv',
      title: 'uv / uvx 사전 도구가 선택되지 않았습니다',
      detail:
        'AutoCAD MCP와 SketchUp MCP는 uvx 실행기를 사용합니다. 처음 세팅하는 PC라면 [필수 1 · uv / uvx]를 함께 체크하세요. (이미 uvx가 설치된 PC라면 이대로 복사해 실행해도 됩니다.)',
    });
  }

  if (sel.sketchupMcp && !sel.sketchupPlugin) {
    warnings.push({
      id: 'sketchup-missing-plugin',
      title: 'SketchUp 내부 플러그인(su_mcp)이 해제되어 있습니다',
      detail:
        'SketchUp MCP가 실제로 동작하려면 SketchUp Plugins 폴더에 su_mcp.rb와 su_mcp\\main.rb가 있어야 합니다. 아직 설치하지 않았다면 [SketchUp su_mcp 루비 플러그인]도 함께 체크하세요.',
    });
  }

  if (anyMcp && !anyClient) {
    warnings.push({
      id: 'mcp-without-client',
      title: '연동할 AI 클라이언트가 하나도 선택되지 않았습니다',
      detail:
        'Codex · Antigravity · Claude Desktop · Cursor 중 실제로 사용하는 AI 도구를 1개 이상 체크해야 설정 파일에 MCP가 등록됩니다. (직접 수동 붙여넣기를 원하면 아래 JSON/TOML 미리보기를 복사하세요.)',
    });
  }

  if (anyClient && !anyMcp) {
    warnings.push({
      id: 'client-without-mcp',
      title: 'AI 클라이언트는 선택되었지만 등록할 MCP가 없습니다',
      detail:
        'AutoCAD MCP 또는 SketchUp MCP(uvx sketchup-mcp) 중 하나 이상을 체크해야 AI 설정 파일에 새 항목이 추가됩니다.',
    });
  }

  return warnings;
}

export function buildCadSkpJsonSnippet(sel: CadSkpInstallerSelection): string {
  const mcpServers: Record<string, unknown> = {};
  if (sel.autocadMcp) {
    mcpServers.autocad = {
      command: 'uvx',
      args: ['--from', 'autocad-mcp-pro[com]', 'autocad-mcp'],
      env: {
        AUTOCAD_MCP_BACKEND: sel.autocadBackend,
        DISCOVERY_MODE: 'search',
      },
    };
  }
  if (sel.sketchupMcp) {
    mcpServers.sketchup = {
      command: 'uvx',
      args: ['sketchup-mcp'],
    };
  }
  if (Object.keys(mcpServers).length === 0) {
    return '// 위에서 AutoCAD MCP 또는 SketchUp MCP를 1개 이상 체크하면 JSON 설정이 생성됩니다.';
  }
  return JSON.stringify({ mcpServers }, null, 2);
}

export function buildCadSkpCodexSnippet(sel: CadSkpInstallerSelection): string {
  const blocks: string[] = [];
  if (sel.autocadMcp) {
    blocks.push(
      [
        '[mcp_servers.autocad]',
        'command = "uvx"',
        'args = ["--from", "autocad-mcp-pro[com]", "autocad-mcp"]',
        'startup_timeout_sec = 90',
        '',
        '[mcp_servers.autocad.env]',
        `AUTOCAD_MCP_BACKEND = "${sel.autocadBackend}"`,
        'DISCOVERY_MODE = "search"',
      ].join('\n'),
    );
  }
  if (sel.sketchupMcp) {
    blocks.push(
      [
        '[mcp_servers.sketchup]',
        'command = "uvx"',
        'args = ["sketchup-mcp"]',
        'startup_timeout_sec = 60',
      ].join('\n'),
    );
  }
  if (blocks.length === 0) {
    return '# 위에서 AutoCAD MCP 또는 SketchUp MCP를 1개 이상 체크하면 Codex config.toml 블록이 생성됩니다.';
  }
  return blocks.join('\n\n');
}

export function buildCadSkpAllInOnePowerShell(sel: CadSkpInstallerSelection): string {
  const anyWork =
    sel.pythonUv ||
    sel.autocadMcp ||
    sel.sketchupPlugin ||
    sel.sketchupMcp ||
    sel.codexConfig ||
    sel.antigravityConfig ||
    sel.claudeConfig ||
    sel.cursorConfig;

  if (!anyWork) {
    return '# 위 체크박스에서 설치할 항목을 하나 이상 선택해 주세요.';
  }

  const psBool = (v: boolean) => (v ? '$true' : '$false');
  const lines: string[] = [];

  lines.push('# ====================================================================');
  lines.push('# 제7-3차시 · AutoCAD & SketchUp MCP 올인원 자동 연동 스크립트 (Windows)');
  lines.push('# 안내: AutoCAD / SketchUp 상용 본체는 공식 체험판에서 직접 설치하세요.');
  lines.push('#       이미 설치된 프로그램은 건드리지 않고 패스하며 MCP와 플러그인만 구성합니다.');
  lines.push('# ====================================================================');
  lines.push('$ErrorActionPreference = "Stop"');
  lines.push('[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12');
  lines.push('');
  lines.push(`$DoUv          = ${psBool(sel.pythonUv)}`);
  lines.push(`$DoAutoCAD     = ${psBool(sel.autocadMcp)}`);
  lines.push(`$CadBackend    = "${sel.autocadBackend}"`);
  lines.push(`$DoSkpPlugin   = ${psBool(sel.sketchupPlugin)}`);
  lines.push(`$DoSkpMcp      = ${psBool(sel.sketchupMcp)}`);
  lines.push(`$DoCodex       = ${psBool(sel.codexConfig)}`);
  lines.push(`$DoAntigravity = ${psBool(sel.antigravityConfig)}`);
  lines.push(`$DoClaude      = ${psBool(sel.claudeConfig)}`);
  lines.push(`$DoCursor      = ${psBool(sel.cursorConfig)}`);
  lines.push(`$DoBackup      = ${psBool(sel.backupExisting)}`);
  lines.push(`$DoDiag        = ${psBool(sel.runDiagnostics)}`);
  lines.push(`$ExistingMode  = "${sel.existingPolicy}"`);
  lines.push('');
  lines.push('function Write-Utf8NoBom([string]$Path, [string]$Text) {');
  lines.push('  $dir = Split-Path -Parent $Path');
  lines.push('  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }');
  lines.push('  [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))');
  lines.push('}');
  lines.push('');
  lines.push('function Backup-Config([string]$Path) {');
  lines.push('  if ($DoBackup -and (Test-Path $Path)) {');
  lines.push("    $bak = \"$Path.bak_$(Get-Date -Format 'yyyyMMdd_HHmmss')\"");
  lines.push('    Copy-Item -Path $Path -Destination $bak -Force');
  lines.push('    Write-Host "  [백업] $bak" -ForegroundColor DarkGray');
  lines.push('  }');
  lines.push('}');
  lines.push('');
  lines.push('function Refresh-SessionPath {');
  lines.push('  $m = [System.Environment]::GetEnvironmentVariable("Path", "Machine")');
  lines.push('  $u = [System.Environment]::GetEnvironmentVariable("Path", "User")');
  lines.push('  $localBin = Join-Path $env:USERPROFILE ".local\\bin"');
  lines.push('  $env:Path = "$localBin;$u;$m"');
  lines.push('}');
  lines.push('');
  lines.push('function Resolve-UvxExe {');
  lines.push('  $c = Get-Command uvx -ErrorAction SilentlyContinue');
  lines.push('  if ($c -and $c.Source) { return $c.Source }');
  lines.push('  foreach ($cand in @(');
  lines.push('    (Join-Path $env:USERPROFILE ".local\\bin\\uvx.exe"),');
  lines.push('    (Join-Path $env:USERPROFILE ".cargo\\bin\\uvx.exe"),');
  lines.push('    (Join-Path $env:LOCALAPPDATA "Microsoft\\WinGet\\Links\\uvx.exe")');
  lines.push('  )) {');
  lines.push('    if (Test-Path $cand) { return $cand }');
  lines.push('  }');
  lines.push('  return "uvx"');
  lines.push('}');
  lines.push('');
  lines.push('function Find-AutoCAD {');
  lines.push('  $out = @()');
  lines.push('  foreach ($g in @("C:\\Program Files\\Autodesk\\AutoCAD *\\acad.exe", "C:\\Program Files\\Autodesk\\AutoCAD LT *\\acadlt.exe")) {');
  lines.push('    foreach ($it in @(Get-Item $g -ErrorAction SilentlyContinue)) {');
  lines.push('      if ($null -ne $it) { $out += [PSCustomObject]@{ Path = $it.FullName; IsLT = ($it.FullName -match "AutoCAD LT") } }');
  lines.push('    }');
  lines.push('  }');
  lines.push('  return $out');
  lines.push('}');
  lines.push('');
  lines.push('function Find-SketchUpProfiles {');
  lines.push('  $base = Join-Path $env:APPDATA "SketchUp"');
  lines.push('  $out = @()');
  lines.push('  if (Test-Path $base) {');
  lines.push('    foreach ($v in @(Get-ChildItem -Path $base -Directory -Filter "SketchUp *" -ErrorAction SilentlyContinue | Sort-Object Name -Descending)) {');
  lines.push('      $out += [PSCustomObject]@{ Version = $v.Name; PluginsPath = (Join-Path $v.FullName "SketchUp\\Plugins") }');
  lines.push('    }');
  lines.push('  }');
  lines.push('  return $out');
  lines.push('}');
  lines.push('');
  lines.push('Write-Host ""');
  lines.push('Write-Host "============================================================" -ForegroundColor Cyan');
  lines.push('Write-Host " 제7-3차시 · AutoCAD & SketchUp MCP 올인원 연동 시작" -ForegroundColor Cyan');
  lines.push('Write-Host "============================================================" -ForegroundColor Cyan');
  lines.push('');

  if (sel.pythonUv) {
    lines.push('# ===== [구간 1] uv / uvx 사전 도구 확인 및 설치 =====');
    lines.push('Write-Host "[구간 1] uv / uvx 확인 중..." -ForegroundColor Yellow');
    lines.push('$uvxExe = Resolve-UvxExe');
    lines.push('if ($uvxExe -ne "uvx" -and (Test-Path $uvxExe)) {');
    lines.push('  if ($ExistingMode -eq "update") {');
    lines.push('    Write-Host "  [갱신] 기존 uv를 최신 버전으로 확인합니다..." -ForegroundColor DarkCyan');
    lines.push('    try { & (Join-Path (Split-Path $uvxExe) "uv.exe") self update 2>$null } catch {}');
    lines.push('  }');
    lines.push('  Write-Host "  [OK] uvx 준비 완료 (기존 설치 패스): $uvxExe" -ForegroundColor Green');
    lines.push('} else {');
    lines.push('  $wg = Get-Command winget -ErrorAction SilentlyContinue');
    lines.push('  if ($wg) {');
    lines.push('    winget install --id astral-sh.uv -e --accept-source-agreements --accept-package-agreements');
    lines.push('  } else {');
    lines.push('    Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression');
    lines.push('  }');
    lines.push('  Refresh-SessionPath');
    lines.push('  $uvxExe = Resolve-UvxExe');
    lines.push('  Write-Host "  [OK] uvx 설치 완료: $uvxExe" -ForegroundColor Green');
    lines.push('}');
    lines.push('');
  } else {
    lines.push('$uvxExe = Resolve-UvxExe');
    lines.push('');
  }

  if (sel.autocadMcp) {
    lines.push('# ===== [구간 2] AutoCAD 본체 설치 상태 점검 (상용 본체는 직접 설치) =====');
    lines.push('Write-Host "[구간 2] AutoCAD 본체 설치 여부 확인 중..." -ForegroundColor Yellow');
    lines.push('$acads = @(Find-AutoCAD)');
    lines.push('if ($acads.Count -gt 0) {');
    lines.push('  foreach ($a in $acads) {');
    lines.push('    if ($a.IsLT) {');
    lines.push('      Write-Host "  [주의] AutoCAD LT 감지됨: $($a.Path) (LT는 COM 미지원 -> auto/ezdxf 모드 권장)" -ForegroundColor Yellow');
    lines.push('    } else {');
    lines.push('      Write-Host "  [OK] 기존 AutoCAD 감지됨 (본체 패스): $($a.Path)" -ForegroundColor Green');
    lines.push('    }');
    lines.push('  }');
    lines.push('} else {');
    lines.push('  Write-Host "  [안내] AutoCAD 본체 미설치 상태입니다. 공식 체험판(autodesk.co.kr)에서 직접 설치하세요." -ForegroundColor Yellow');
    lines.push('  Write-Host "         (미설치 상태에서도 auto/ezdxf 모드로 .dxf 도면 생성 MCP는 바로 작동합니다.)" -ForegroundColor DarkGray');
    lines.push('}');
    lines.push('');
  }

  if (sel.sketchupPlugin) {
    lines.push('# ===== [구간 3] SketchUp su_mcp 루비 플러그인 1계층 자동 배치 =====');
    lines.push('Write-Host "[구간 3] SketchUp su_mcp 플러그인 점검 및 설치 중..." -ForegroundColor Yellow');
    lines.push('$skpProfiles = @(Find-SketchUpProfiles)');
    lines.push('if ($skpProfiles.Count -eq 0) {');
    lines.push('  Write-Host "  [안내] 설치된 SketchUp 프로필(%APPDATA%\\SketchUp\\SketchUp 20XX)이 없습니다." -ForegroundColor Yellow');
    lines.push('  Write-Host "         공식 체험판(sketchup.com/ko-kr/try-sketchup) 설치 후 1회 실행 뒤 이 스크립트를 다시 실행하세요." -ForegroundColor DarkGray');
    lines.push('} else {');
    lines.push('  $tmpSkp = Join-Path $env:TEMP ("su_mcp_" + [guid]::NewGuid().ToString("N"))');
    lines.push('  New-Item -ItemType Directory -Force -Path $tmpSkp | Out-Null');
    lines.push('  try {');
    lines.push('    $rbSrc = Join-Path $tmpSkp "su_mcp.rb"');
    lines.push('    $mainSrc = Join-Path $tmpSkp "main.rb"');
    lines.push('    $needDownload = $false');
    lines.push('    foreach ($sp in $skpProfiles) {');
    lines.push('      $hasRb = Test-Path (Join-Path $sp.PluginsPath "su_mcp.rb")');
    lines.push('      $hasMain = Test-Path (Join-Path $sp.PluginsPath "su_mcp\\main.rb")');
    lines.push('      $hasNested = Test-Path (Join-Path $sp.PluginsPath "su_mcp\\su_mcp\\main.rb")');
    lines.push('      if ($ExistingMode -eq "update" -or -not ($hasRb -and $hasMain) -or $hasNested) { $needDownload = $true }');
    lines.push('    }');
    lines.push('    if ($needDownload) {');
    lines.push('      Invoke-WebRequest -Uri "https://raw.githubusercontent.com/mhyrr/sketchup-mcp/main/su_mcp/su_mcp.rb" -OutFile $rbSrc -UseBasicParsing');
    lines.push('      Invoke-WebRequest -Uri "https://raw.githubusercontent.com/mhyrr/sketchup-mcp/main/su_mcp/su_mcp/main.rb" -OutFile $mainSrc -UseBasicParsing');
    lines.push('    }');
    lines.push('    foreach ($sp in $skpProfiles) {');
    lines.push('      $pDir = $sp.PluginsPath');
    lines.push('      $subDir = Join-Path $pDir "su_mcp"');
    lines.push('      $nestedDir = Join-Path $subDir "su_mcp"');
    lines.push('      $hasRb = Test-Path (Join-Path $pDir "su_mcp.rb")');
    lines.push('      $hasMain = Test-Path (Join-Path $subDir "main.rb")');
    lines.push('      $hasNested = Test-Path (Join-Path $nestedDir "main.rb")');
    lines.push('      if ($ExistingMode -eq "skip" -and $hasRb -and $hasMain -and -not $hasNested) {');
    lines.push('        Write-Host "  [OK] $($sp.Version) su_mcp 이미 정상 설치됨 (패스)" -ForegroundColor Green');
    lines.push('        continue');
    lines.push('      }');
    lines.push('      New-Item -ItemType Directory -Force -Path $subDir | Out-Null');
    lines.push('      Copy-Item -Path $rbSrc -Destination (Join-Path $pDir "su_mcp.rb") -Force');
    lines.push('      Copy-Item -Path $mainSrc -Destination (Join-Path $subDir "main.rb") -Force');
    lines.push('      if (Test-Path $nestedDir) {');
    lines.push('        Remove-Item -Path $nestedDir -Recurse -Force -ErrorAction SilentlyContinue');
    lines.push('        Write-Host "  [자동수정] 기존 이중 중첩 폴더(su_mcp\\su_mcp) 정리 완료" -ForegroundColor Cyan');
    lines.push('      }');
    lines.push('      Write-Host "  [OK] $($sp.Version) 1계층 배치 완료 -> $pDir" -ForegroundColor Green');
    lines.push('    }');
    lines.push('  } finally {');
    lines.push('    Remove-Item -Path $tmpSkp -Recurse -Force -ErrorAction SilentlyContinue');
    lines.push('  }');
    lines.push('}');
    lines.push('');
  }

  const anyClient = sel.codexConfig || sel.antigravityConfig || sel.claudeConfig || sel.cursorConfig;
  const anyMcp = sel.autocadMcp || sel.sketchupMcp;

  if (anyClient && anyMcp) {
    lines.push('# ===== [구간 4] 선택한 AI 클라이언트 설정 파일 스마트 병합 =====');
    lines.push('Write-Host "[구간 4] AI 클라이언트 MCP 설정 반영 중..." -ForegroundColor Yellow');
    lines.push('$mcpEntries = [ordered]@{}');
    if (sel.autocadMcp) {
      lines.push('$mcpEntries["autocad"] = [ordered]@{');
      lines.push('  command = $uvxExe');
      lines.push('  args    = @("--from", "autocad-mcp-pro[com]", "autocad-mcp")');
      lines.push('  env     = [ordered]@{ AUTOCAD_MCP_BACKEND = $CadBackend; DISCOVERY_MODE = "search" }');
      lines.push('}');
    }
    if (sel.sketchupMcp) {
      lines.push('$mcpEntries["sketchup"] = [ordered]@{');
      lines.push('  command = $uvxExe');
      lines.push('  args    = @("sketchup-mcp")');
      lines.push('}');
    }
    lines.push('');
    lines.push('function Merge-JsonClient([string]$CfgPath, [string]$Label) {');
    lines.push('  Backup-Config $CfgPath');
    lines.push('  $root = @{}');
    lines.push('  if (Test-Path $CfgPath) {');
    lines.push('    $raw = [System.IO.File]::ReadAllText($CfgPath, [System.Text.Encoding]::UTF8)');
    lines.push('    if (-not [string]::IsNullOrWhiteSpace($raw)) {');
    lines.push('      try {');
    lines.push('        $parsed = $raw | ConvertFrom-Json');
    lines.push('        foreach ($pr in $parsed.PSObject.Properties) { $root[$pr.Name] = $pr.Value }');
    lines.push('      } catch { $root = @{} }');
    lines.push('    }');
    lines.push('  }');
    lines.push('  $srvs = @{}');
    lines.push('  if ($root.ContainsKey("mcpServers") -and $null -ne $root["mcpServers"]) {');
    lines.push('    foreach ($pr in $root["mcpServers"].PSObject.Properties) { $srvs[$pr.Name] = $pr.Value }');
    lines.push('  }');
    lines.push('  foreach ($k in $mcpEntries.Keys) { $srvs[$k] = $mcpEntries[$k] }');
    lines.push('  $root["mcpServers"] = $srvs');
    lines.push('  Write-Utf8NoBom $CfgPath (($root | ConvertTo-Json -Depth 10) + "`r`n")');
    lines.push('  Write-Host "  [OK] $Label 설정 저장 완료 -> $CfgPath" -ForegroundColor Green');
    lines.push('}');
    lines.push('');

    if (sel.antigravityConfig) {
      lines.push('Merge-JsonClient (Join-Path $env:USERPROFILE ".gemini\\config\\mcp_config.json") "Antigravity (Gemini)"');
    }
    if (sel.claudeConfig) {
      lines.push('Merge-JsonClient (Join-Path $env:APPDATA "Claude\\claude_desktop_config.json") "Claude Desktop"');
    }
    if (sel.cursorConfig) {
      lines.push('Merge-JsonClient (Join-Path $env:USERPROFILE ".cursor\\mcp.json") "Cursor IDE"');
    }
    if (sel.codexConfig) {
      lines.push('$codexProcs = @(Get-Process -Name "Codex","codex" -ErrorAction SilentlyContinue)');
      lines.push('if ($codexProcs.Count -gt 0) {');
      lines.push('  Write-Host "  [정리] 실행 중인 Codex 프로세스를 안전 종료한 뒤 config.toml을 병합합니다..." -ForegroundColor DarkCyan');
      lines.push('  $codexProcs | Stop-Process -Force -ErrorAction SilentlyContinue');
      lines.push('}');
      lines.push('$codexPath = Join-Path $env:USERPROFILE ".codex\\config.toml"');
      lines.push('Backup-Config $codexPath');
      lines.push('$toml = if (Test-Path $codexPath) { [System.IO.File]::ReadAllText($codexPath, [System.Text.Encoding]::UTF8) } else { "" }');
      lines.push('$tomlBlocks = @()');
      if (sel.autocadMcp) {
        lines.push("$toml = [regex]::Replace($toml, '(?ms)^\\r?\\n?\\[mcp_servers\\.autocad\\.env\\][^\\[]*', '')");
        lines.push("$toml = [regex]::Replace($toml, '(?ms)^\\r?\\n?\\[mcp_servers\\.autocad\\][^\\[]*', '')");
        lines.push('$tomlBlocks += "[mcp_servers.autocad]`r`ncommand = \'$uvxExe\'`r`nargs = [`"--from`", `"autocad-mcp-pro[com]`", `"autocad-mcp`"]`r`nstartup_timeout_sec = 90`r`n`r`n[mcp_servers.autocad.env]`r`nAUTOCAD_MCP_BACKEND = `"$CadBackend`"`r`nDISCOVERY_MODE = `"search`""');
      }
      if (sel.sketchupMcp) {
        lines.push("$toml = [regex]::Replace($toml, '(?ms)^\\r?\\n?\\[mcp_servers\\.sketchup(?:\\.env)?\\][^\\[]*', '')");
        lines.push('$tomlBlocks += "[mcp_servers.sketchup]`r`ncommand = \'$uvxExe\'`r`nargs = [`"sketchup-mcp`"]`r`nstartup_timeout_sec = 60"');
      }
      lines.push('$mergedToml = $toml.TrimEnd()');
      lines.push('if ($mergedToml.Length -gt 0) { $mergedToml += "`r`n`r`n" }');
      lines.push('$mergedToml += ($tomlBlocks -join "`r`n`r`n") + "`r`n"');
      lines.push('Write-Utf8NoBom $codexPath $mergedToml');
      lines.push('Write-Host "  [OK] OpenAI Codex 설정 저장 완료 -> $codexPath" -ForegroundColor Green');
    }
    lines.push('');
  }

  if (sel.runDiagnostics) {
    lines.push('# ===== [구간 5] 설치 후 자동 상태 진단 =====');
    lines.push('Write-Host ""');
    lines.push('Write-Host "--- [자동 상태 진단 결과] ---" -ForegroundColor Cyan');
    lines.push('Write-Host " - uvx 경로   : $(Resolve-UvxExe)"');
    lines.push('$cadDiag = @(Find-AutoCAD)');
    lines.push('Write-Host " - AutoCAD    : $(if ($cadDiag.Count -gt 0) { $cadDiag[0].Path } else { \'미설치 (auto/ezdxf로 .dxf 생성 가능)\' })"');
    lines.push('$skpDiag = @(Find-SketchUpProfiles)');
    lines.push('if ($skpDiag.Count -gt 0) {');
    lines.push('  foreach ($sd in $skpDiag) {');
    lines.push('    $ok1 = (Test-Path (Join-Path $sd.PluginsPath "su_mcp.rb")) -and (Test-Path (Join-Path $sd.PluginsPath "su_mcp\\main.rb"))');
    lines.push('    Write-Host " - $($sd.Version) : su_mcp 1계층 정상=$ok1"');
    lines.push('  }');
    lines.push('} else {');
    lines.push('  Write-Host " - SketchUp   : 미설치 (공식 체험판 설치 후 1회 실행 필요)"');
    lines.push('}');
    lines.push('$p9876 = Get-NetTCPConnection -LocalPort 9876 -State Listen -ErrorAction SilentlyContinue');
    lines.push('Write-Host " - 포트 9876  : $(if ($p9876) { \'LISTENING (실행 중)\' } else { \'대기 (SketchUp > 확장(X) > MCP Server > Start Server 클릭 필요)\' })"');
    lines.push('');
  }

  lines.push('Write-Host ""');
  lines.push('Write-Host "============================================================" -ForegroundColor Green');
  lines.push('Write-Host " 제7-3차시 올인원 MCP 연동 완료! 마무리 실행 순서:" -ForegroundColor Green');
  if (sel.sketchupPlugin || sel.sketchupMcp) {
    lines.push('Write-Host "  1) SketchUp 재시작 -> 상단 [확장(X) > MCP Server > Start Server] 클릭"');
  }
  if (sel.autocadMcp) {
    lines.push('Write-Host "  2) AutoCAD(일반판/체험판) 실행 후 새 도면(.dwg) 열어두기"');
  }
  lines.push('Write-Host "  3) 선택한 AI 프로그램(Codex / Antigravity / Claude / Cursor) 새로 실행"');
  lines.push('Write-Host "============================================================" -ForegroundColor Green');

  return lines.join('\n');
}
