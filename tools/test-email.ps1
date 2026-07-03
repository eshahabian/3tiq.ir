#Requires -Version 5.1
<#
  Test email reminder without generating a new blog post.
  Usage: .\tools\test-email.ps1
#>
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
. (Join-Path $PSScriptRoot 'reminder-email.ps1')

$config = Get-Content (Join-Path $Root 'data\reminder-config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$SecretsFile = Join-Path $Root 'data\reminder-secrets.json'

$body = @"
این یک تست یادآوری deploy سه تیغ است.

اگر این ایمیل را روی آیفون دیدی، تنظیمات درست است.
"@

$subject = if ($config.notifyTitle) { $config.notifyTitle + ' (test)' } else { '3tiq test' }

try {
    if (Send-ReminderEmail -Config $config -Subject $subject -Body $body -SecretsFile $SecretsFile) {
        Write-Host "Test email sent to $($config.email.to)"
    } else {
        exit 1
    }
} catch {
    Write-Host "Failed: $($_.Exception.Message)"
    exit 1
}
