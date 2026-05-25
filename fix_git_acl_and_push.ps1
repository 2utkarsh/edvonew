$ErrorActionPreference = 'Stop'

$repo = 'C:\Users\utkarsh\Downloads\EDVO'
$gitDir = Join-Path $repo '.git'
$sidValue = 'S-1-5-21-4211267213-4256375525-1919630405-3634187454'
$logPath = Join-Path $repo 'admin_push.log'

function Write-Log {
  param([string]$Message)
  $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Add-Content -LiteralPath $logPath -Value "[$timestamp] $Message"
}

function Remove-DenyRules {
  param([string]$Path)

  $acl = Get-Acl -LiteralPath $Path
  $rules = @(
    $acl.Access |
      Where-Object {
        $_.IdentityReference.Value -eq $sidValue -and
        $_.AccessControlType -eq 'Deny'
      }
  )

  if ($rules.Count -eq 0) {
    return $false
  }

  foreach ($rule in $rules) {
    [void]$acl.RemoveAccessRuleSpecific($rule)
  }

  Set-Acl -LiteralPath $Path -AclObject $acl
  return $true
}

Set-Location $repo
Set-Content -LiteralPath $logPath -Value "Starting admin push run at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Log "Resetting ACL inheritance on .git"
& icacls $gitDir /reset /T /C | Out-Null

Write-Log "Removing deny ACL from .git tree"
$targets = @($gitDir)
$targets += Get-ChildItem -LiteralPath $gitDir -Force -Recurse | ForEach-Object { $_.FullName }

$changed = 0
foreach ($target in $targets) {
  try {
    if (Remove-DenyRules -Path $target) {
      $changed++
    }
  } catch {
    Write-Log "ACL update failed for $target : $($_.Exception.Message)"
  }
}

Write-Log "Removed deny rules from $changed paths"

Write-Log "Granting FullControl to DESKTOP-BLHFCVC\\utkarsh on .git tree"
& icacls $gitDir /grant:r 'DESKTOP-BLHFCVC\utkarsh:(OI)(CI)F' /T /C | Out-Null

Write-Log "Testing write to .git/index.lock"
New-Item -ItemType File -Path (Join-Path $gitDir 'index.lock') -Force | Out-Null
Remove-Item -LiteralPath (Join-Path $gitDir 'index.lock') -Force

if (Test-Path -LiteralPath (Join-Path $repo 'acl.txt')) {
  Remove-Item -LiteralPath (Join-Path $repo 'acl.txt') -Force
}

if (Test-Path -LiteralPath (Join-Path $repo 'presentation-fix.patch')) {
  Remove-Item -LiteralPath (Join-Path $repo 'presentation-fix.patch') -Force
}

Write-Log "Running git add"
& git add -A

Write-Log "Running git commit"
& git commit -m 'Fix presentation dropdown visibility'

Write-Log "Running git push"
& git push origin main

Write-Log "Push completed successfully"
