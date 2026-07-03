#Requires -RunAsAdministrator
<#
  زمان‌بندی روزانه تولید مطلب وبلاگ — ساعت ۹ صبح
  اجرا: PowerShell as Admin → .\tools\install-daily-task.ps1
#>
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Script = Join-Path $PSScriptRoot 'generate-blog.ps1'
$Config = Get-Content (Join-Path $Root 'data\reminder-config.json') -Raw | ConvertFrom-Json
$Hour = if ($Config.dailyHour) { [int]$Config.dailyHour } else { 9 }

$Action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Script`""

$Trigger = New-ScheduledTaskTrigger -Daily -At "$($Hour.ToString('00')):00"

Register-ScheduledTask -TaskName '3tiq-DailyBlog' `
    -Action $Action -Trigger $Trigger `
    -Description 'تولید مطلب وبلاگ تصادفی + یادآوری deploy سه تیغ' `
    -Force | Out-Null

Write-Host "✅ Task Scheduler ثبت شد: هر روز ساعت $Hour`:00"
Write-Host "   تست دستی: powershell -File `"$Script`""
