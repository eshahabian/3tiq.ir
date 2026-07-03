#Requires -Version 5.1
param([switch]$SkipNotify)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$TopicsFile   = Join-Path $Root 'data\blog-topics.json'
$HistoryFile  = Join-Path $Root 'data\blog-history.json'
$ConfigFile   = Join-Path $Root 'data\reminder-config.json'
$SecretsFile  = Join-Path $Root 'data\reminder-secrets.json'
$BlogHtml     = Join-Path $Root 'blog.html'
$BlogDir      = Join-Path $Root 'blog'
$PostTemplate = Join-Path $PSScriptRoot 'blog-post-template.html'
$CardTemplate = Join-Path $PSScriptRoot 'blog-card-template.html'
$InsertMarker = '<!-- BLOG-GENERATOR-INSERT -->'
$DefaultGrad  = 'linear-gradient(135deg,#4a5040,#2a3020)'

function Get-PersianDateLabel {
    $pc = New-Object System.Globalization.PersianCalendar
    $monthsFile = Join-Path $Root 'data\persian-months.json'
    $months = Get-Content $monthsFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $now = Get-Date
    $m = $pc.GetMonth($now)
    $y = $pc.GetYear($now)
    return "$($months[$m - 1]) $y"
}

function Get-CategoryBadgeStyle {
    param([string]$Cat)
    switch ($Cat) {
        'safety' { return 'background:rgba(181,86,47,.85)' }
        'gear'   { return 'background:rgba(92,107,74,.85)' }
        'route'  { return 'background:rgba(58,104,140,.85)' }
        'nature' { return 'background:rgba(140,100,58,.85)' }
        default  { return 'background:rgba(110,80,150,.85)' }
    }
}

function Read-Utf8 {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.UTF8Encoding]::new($false))
}

function Write-Utf8 {
    param([string]$Path, [string]$Content)
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Apply-Placeholders {
    param([string]$Text, [hashtable]$Map)
    foreach ($key in $Map.Keys) {
        $Text = $Text.Replace("{{$key}}", [string]$Map[$key])
    }
    return $Text
}

. (Join-Path $PSScriptRoot 'reminder-email.ps1')

$topics  = Get-Content $TopicsFile -Raw -Encoding UTF8 | ConvertFrom-Json
$history = Get-Content $HistoryFile -Raw -Encoding UTF8 | ConvertFrom-Json
$config  = Get-Content $ConfigFile -Raw -Encoding UTF8 | ConvertFrom-Json

$published = @($history.published)
$available = @($topics | Where-Object { $published -notcontains $_.slug })

if ($available.Count -eq 0) {
    Write-Host 'All topics used once - resetting pool.'
    $history.published = @()
    $available = @($topics)
}

$topic = $available | Get-Random
$fileName = "blog-$($topic.slug).html"
$filePath = Join-Path $BlogDir $fileName

if (Test-Path $filePath) {
    throw "File already exists: $fileName"
}

$dateLabel = Get-PersianDateLabel
$canonical = "https://3tiq.ir/blog/$fileName"
$badgeStyle = Get-CategoryBadgeStyle $topic.category
$grad = if ($topic.heroGradient) { [string]$topic.heroGradient } else { $DefaultGrad }

if ($topic.heroImage) {
    $heroBlock = "        <img class=`"post-hero-img`" src=`"../$($topic.heroImage)`" alt=`"$($topic.title)`">"
    $cardImg = "                        <img src=`"$($topic.heroImage)`" alt=`"$($topic.title)`" loading=`"lazy`">"
    $ogImage = "https://3tiq.ir/$($topic.heroImage)"
} else {
    $heroBlock = "        <div class=`"post-hero-bg`" style=`"position:absolute;inset:0;background:$grad;`"></div>"
    $cardImg = "                        <div style=`"width:100%;height:100%;background:$grad;`"></div>"
    $ogImage = 'https://3tiq.ir/images/peaks/damavand.jpg'
}

$postMap = @{
    TITLE        = $topic.title
    DESCRIPTION  = $topic.description
    CANONICAL    = $canonical
    OG_IMAGE     = $ogImage
    BADGE_STYLE  = $badgeStyle
    HERO_BLOCK   = $heroBlock
    CAT_LABEL    = $topic.catLabel
    DATE_LABEL   = $dateLabel
    READ_MINUTES = $topic.readMinutes
    CONTENT      = $topic.content
}

$postHtml = Apply-Placeholders (Read-Utf8 $PostTemplate) $postMap
Write-Utf8 $filePath $postHtml
Write-Host "Created: blog\$fileName"

$blogContent = Read-Utf8 $BlogHtml
if ($blogContent -notmatch [regex]::Escape($InsertMarker)) {
    throw "Marker BLOG-GENERATOR-INSERT not found in blog.html"
}

$cardMap = @{
    FILE_NAME   = $fileName
    CATEGORY    = $topic.category
    CARD_IMG    = $cardImg
    CAT_CLASS   = $topic.catClass
    CAT_LABEL   = $topic.catLabel
    DATE_LABEL   = $dateLabel
    READ_MINUTES = $topic.readMinutes
    TITLE       = $topic.title
    DESCRIPTION = $topic.description
}

$newCard = Apply-Placeholders (Read-Utf8 $CardTemplate) $cardMap
$blogContent = $blogContent.Replace($InsertMarker, $InsertMarker + "`n" + $newCard)
Write-Utf8 $BlogHtml $blogContent
Write-Host 'Updated: blog.html'

$history.published += $topic.slug
$history | ConvertTo-Json | Set-Content $HistoryFile -Encoding UTF8

$msg = if ($config.notifyMessage) {
    $config.notifyMessage.Replace('{title}', $topic.title).Replace('{file}', "blog\$fileName")
} else {
    "$($topic.title)`n`nblog\$fileName + blog.html`n`nUpload D:\3tiq.ir to 3tiq.ir (cPanel)."
}

if (-not $SkipNotify) {
    if ($config.notifyWindows -ne $false) {
        try {
            [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
            [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
            $title = if ($config.notifyTitle) { $config.notifyTitle } else { '3tiq blog deploy' }
            $body = if ($config.notifyBody) { $config.notifyBody } else { $topic.title }
            $template = "<toast><visual><binding template=`"ToastText02`"><text id=`"1`">$title</text><text id=`"2`">$body</text></binding></visual></toast>"
            $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
            $xml.LoadXml($template)
            [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('3tiq').Show((New-Object Windows.UI.Notifications.ToastNotification($xml)))
        } catch {
            Write-Host "Windows toast failed: $($_.Exception.Message)"
        }
    }

    $emailSubject = if ($config.notifyTitle) { $config.notifyTitle } else { '3tiq blog deploy' }
    try {
        if (Send-ReminderEmail -Config $config -Subject $emailSubject -Body $msg -SecretsFile $SecretsFile) {
            Write-Host "Email reminder sent to $($config.email.to)"
        }
    } catch {
        Write-Host "Email error: $($_.Exception.Message)"
    }

    $ntfy = [string]$config.ntfyTopic
    if ($ntfy -and $ntfy -notmatch 'YOURNAME') {
        try {
            $ntfyTitle = if ($config.notifyTitle) { $config.notifyTitle } else { '3tiq blog deploy' }
            Invoke-RestMethod -Uri "https://ntfy.sh/$ntfy" -Method Post `
                -Headers @{ Title = $ntfyTitle; Priority = 'high'; Tags = 'mountain' } `
                -Body $msg -ContentType 'text/plain; charset=utf-8'
            Write-Host "Reminder sent to ntfy.sh/$ntfy"
        } catch {
            Write-Host "ntfy error: $($_.Exception.Message)"
        }
    }
}

Write-Host ''
Write-Host $msg
