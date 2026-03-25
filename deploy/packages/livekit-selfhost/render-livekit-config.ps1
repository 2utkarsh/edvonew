param(
  [string]$EnvFile = '.env',
  [string]$TemplateFile = 'livekit.yaml.template',
  [string]$OutputFile = 'generated/livekit.yaml'
)

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $baseDir $EnvFile
$templatePath = Join-Path $baseDir $TemplateFile
$outputPath = Join-Path $baseDir $OutputFile

if (!(Test-Path $envPath)) {
  throw "Env file not found: $envPath"
}

if (!(Test-Path $templatePath)) {
  throw "Template file not found: $templatePath"
}

$values = @{}
Get-Content $envPath | ForEach-Object {
  $line = $_.Trim()
  if (!$line -or $line.StartsWith('#')) { return }
  $parts = $line.Split('=', 2)
  if ($parts.Count -eq 2) {
    $values[$parts[0].Trim()] = $parts[1].Trim()
  }
}

$content = Get-Content $templatePath -Raw
foreach ($key in $values.Keys) {
  $token = "{{${key}}}"
  $content = $content.Replace($token, $values[$key])
}

$missingTokens = [regex]::Matches($content, '{{[A-Z0-9_]+}}') | ForEach-Object { $_.Value } | Select-Object -Unique
if ($missingTokens) {
  throw "Missing values for: $($missingTokens -join ', ')"
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outputPath) | Out-Null
Set-Content -LiteralPath $outputPath -Value $content
Write-Host "Rendered $outputPath"
