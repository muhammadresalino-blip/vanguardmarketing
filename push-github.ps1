<#
.SYNOPSIS
  Commit perubahan lokal lalu dorong branch main ke GitHub.

.DESCRIPTION
  Skrip ini:
  1. memastikan remote origin menunjuk ke repo yang benar,
  2. membuat commit bila ada perubahan,
  3. memeriksa bahwa branch lokal memuat commit terbaru dari GitHub,
  4. melakukan push.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\push-github.ps1

.EXAMPLE
  .\push-github.ps1 -Token "ghp_xxxxxxxx"
#>
[CmdletBinding()]
param(
  [string]$Url = 'https://github.com/muhammadresalino-blip/vanguardmarketing.git',
  [string]$Branch = 'main',
  [string]$Remote = 'origin',
  [string]$Token = $env:GITHUB_TOKEN
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$Text) {
  Write-Host "`n== $Text ==" -ForegroundColor Cyan
}

# --- 1. Cari Git (PATH bisa belum ter-refresh setelah instalasi) -----------
$git = $null
$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if ($gitCommand) {
  $git = $gitCommand.Source
}
if (-not $git) {
  $candidates = @()
  if ($env:ProgramFiles) { $candidates += (Join-Path $env:ProgramFiles 'Git\cmd\git.exe') }
  if (${env:ProgramFiles(x86)}) { $candidates += (Join-Path ${env:ProgramFiles(x86)} 'Git\cmd\git.exe') }
  $git = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $git) {
  throw 'Git tidak ditemukan. Instal Git, buka terminal baru, lalu jalankan skrip ini lagi.'
}
Write-Host "Git: $git"

# --- 2. Pastikan dijalankan di dalam repo ----------------------------------
Set-Location $PSScriptRoot
if (-not (Test-Path (Join-Path $PSScriptRoot '.git'))) {
  throw "Folder $PSScriptRoot bukan repo Git."
}

# --- 3. Identitas lokal (tidak menimpa yang sudah diatur) ------------------
if (-not (& $git config user.name)) {
  & $git config user.name 'Raul'
}
if (-not (& $git config user.email)) {
  & $git config user.email 'raul@vanguardmarketing.local'
}
Write-Host "Author: $(& $git config user.name) <$(& $git config user.email)>"

# --- 4. Remote -------------------------------------------------------------
$current = & $git remote get-url $Remote 2>$null
if ($LASTEXITCODE -ne 0 -or -not $current) {
  & $git remote add $Remote $Url
} elseif ($current -ne $Url) {
  & $git remote set-url $Remote $Url
  Write-Host "URL remote diperbarui."
}
Write-Host "Remote ${Remote}: $Url"

# --- 5. Commit perubahan yang belum masuk ----------------------------------
$pending = & $git status --porcelain
if ($pending) {
  Write-Step 'Commit perubahan lokal'
  & $git add -A
  & $git commit -m "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  if ($LASTEXITCODE -ne 0) { throw 'Commit gagal. Periksa pesan di atas.' }
} else {
  Write-Host 'Tidak ada perubahan baru untuk di-commit.'
}

# --- 6. Pastikan branch benar ---------------------------------------------
$currentBranch = & $git branch --show-current
if ($currentBranch -ne $Branch) {
  Write-Host "Pindah dari branch '$currentBranch' ke '$Branch'..."
  & $git checkout $Branch
}

# --- 7. Cek apakah lokal sudah memuat commit terbaru dari GitHub -----------
Write-Step 'Sinkronisasi dengan GitHub'
& $git fetch $Remote
if ($LASTEXITCODE -ne 0) { throw 'Gagal menghubungi GitHub. Periksa koneksi internet.' }

$remoteRef = "$Remote/$Branch"
& $git rev-parse --verify --quiet $remoteRef | Out-Null
if ($LASTEXITCODE -eq 0) {
  & $git merge-base --is-ancestor $remoteRef HEAD
  if ($LASTEXITCODE -ne 0) {
    throw "Branch lokal belum memuat commit terbaru dari GitHub.`nJalankan: git pull --rebase $Remote $Branch`nlalu ulangi skrip ini."
  }
}

# --- 8. Push ---------------------------------------------------------------
Write-Step 'Push ke GitHub'
if ($Token) {
  # Token dipakai hanya untuk perintah ini, tidak disimpan di konfigurasi remote.
  $authUrl = $Url -replace '^https://', "https://x-access-token:$Token@"
  & $git push $authUrl "HEAD:$Branch"
} else {
  & $git push -u $Remote "HEAD:$Branch"
}

if ($LASTEXITCODE -ne 0) {
  throw @"
Push gagal — kemungkinan belum login ke GitHub. Pilih salah satu:

  1) Login lewat GitHub CLI (sudah terpasang di laptop ini):
       gh auth login
     lalu jalankan ulang skrip ini.

  2) Buat Personal Access Token (scope: repo) di
       https://github.com/settings/tokens
     lalu jalankan:
       .\push-github.ps1 -Token "ghp_xxxxxxxx"

  3) Login lewat Git Credential Manager: jalankan
       git push -u origin main
     di terminal biasa, ikuti jendela login yang muncul.
"@
}

& $git branch --set-upstream-to="$remoteRef" $Branch 2>$null | Out-Null

Write-Step 'Selesai'
Write-Host "Repo: https://github.com/muhammadresalino-blip/vanguardmarketing" -ForegroundColor Green
Write-Host "Commit terakhir: $(& $git log --oneline -1)"
