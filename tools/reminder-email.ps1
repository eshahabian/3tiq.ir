function Send-ReminderEmail {
    param(
        [object]$Config,
        [string]$Subject,
        [string]$Body,
        [string]$SecretsFile
    )

    if (-not $Config.email -or $Config.email.enabled -eq $false) { return $false }

    $to = [string]$Config.email.to
    if (-not $to -or $to -match 'YOUR@EMAIL') {
        Write-Host 'Set email.to in data/reminder-config.json'
        return $false
    }

    $password = $env:3TIQ_SMTP_PASSWORD
    if (-not $password -and (Test-Path $SecretsFile)) {
        $secrets = Get-Content $SecretsFile -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($secrets.smtpPassword -and $secrets.smtpPassword -notmatch 'YOUR-APP-PASSWORD') {
            $password = [string]$secrets.smtpPassword
        }
    }
    if (-not $password) {
        Write-Host 'Set smtpPassword in data/reminder-secrets.json (copy from reminder-secrets.example.json)'
        return $false
    }

    $hostName = [string]$Config.email.smtpHost
    $port = [int]$Config.email.smtpPort
    $user = [string]$Config.email.smtpUser
    $from = if ($Config.email.from) { [string]$Config.email.from } else { $user }

    $smtp = New-Object System.Net.Mail.SmtpClient($hostName, $port)
    $smtp.EnableSsl = $true
    $smtp.Credentials = New-Object System.Net.NetworkCredential($user, $password)

    $mail = New-Object System.Net.Mail.MailMessage
    $mail.From = $from
    $mail.To.Add($to) | Out-Null
    $mail.Subject = $Subject
    $mail.Body = $Body
    $mail.IsBodyHtml = $false
    $mail.BodyEncoding = [System.Text.Encoding]::UTF8
    $mail.SubjectEncoding = [System.Text.Encoding]::UTF8

    $smtp.Send($mail)
    $smtp.Dispose()
    $mail.Dispose()
    return $true
}
