param(
  [int]$SecretBytes = 32
)

$characters = 'abcdefghijklmnopqrstuvwxyz0123456789'.ToCharArray()
$apiKey = 'edvo-live-' + (-join (1..8 | ForEach-Object { $characters[(Get-Random -Minimum 0 -Maximum $characters.Length)] }))

$bytes = New-Object 'System.Byte[]' ($SecretBytes)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$apiSecret = ([System.BitConverter]::ToString($bytes)).Replace('-', '').ToLower()

Write-Host "LIVEKIT_API_KEY=$apiKey"
Write-Host "LIVEKIT_API_SECRET=$apiSecret"
