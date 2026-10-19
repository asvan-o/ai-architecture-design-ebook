param([Parameter(Mandatory=$true)][string]$Root)
$ErrorActionPreference='Stop'
$sortTempParent=[System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\')
$sortResolvedRoot=(Resolve-Path -LiteralPath $Root).Path.TrimEnd('\')
if([System.IO.Directory]::GetParent($sortResolvedRoot).FullName -ne $sortTempParent -or [System.IO.Path]::GetFileName($sortResolvedRoot) -notmatch '^DJ_L02_CLEAN_ROOM_[0-9a-f-]{36}_한글 공백$'){throw '검증 전용 임시 폴더만 삭제할 수 있습니다.'}
$sortEntries=@(Get-Item -LiteralPath $sortResolvedRoot -Force)+@(Get-ChildItem -LiteralPath $sortResolvedRoot -Recurse -Force)
if($sortEntries | Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }){throw '링크가 있는 폴더는 삭제 검증을 중단합니다.'}
$sortProgram=Join-Path $sortResolvedRoot 'AI_파일자동정리'
if(Test-Path -LiteralPath (Join-Path $sortProgram 'data\runtime.json')){throw '종료 기록을 먼저 확인하세요.'}
$sortResolvedProgram=(Resolve-Path -LiteralPath $sortProgram).Path
if(-not $sortResolvedProgram.StartsWith($sortResolvedRoot+'\',[System.StringComparison]::OrdinalIgnoreCase)){throw '대상 경로가 검증 폴더 밖입니다.'}
Remove-Item -LiteralPath $sortResolvedProgram -Recurse -Force
if(Test-Path -LiteralPath $sortResolvedProgram){throw '프로그램 삭제 실패'}
Remove-Item -LiteralPath $sortResolvedRoot -Recurse -Force
[pscustomobject]@{programDeleted=$true;cleanRootDeleted=(-not (Test-Path -LiteralPath $sortResolvedRoot));checkedRoot=$sortResolvedRoot;osOrBrowserCacheDeletionClaim=$false}|ConvertTo-Json -Compress
