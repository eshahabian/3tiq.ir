#Requires -Version 5.1
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Base = 'https://3tiq.ir'
$PeakDir = Join-Path $Root 'peaks'
$DefaultImage = "$Base/images/peaks/damavand.jpg"
$count = 0

Get-ChildItem $PeakDir -Filter '*.html' | ForEach-Object {
    $file = $_.FullName
    $slug = $_.BaseName
    $url = "$Base/peaks/$slug.html"
    $html = [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false))

    if ($html -match 'rel="canonical"') { return }

    $title = if ($html -match '<title>([^<]+)</title>') { $Matches[1].Trim() } else { $slug }
    $desc = if ($html -match '<meta name="description" content="([^"]*)"') { $Matches[1] } else { '' }
    $imgPath = Join-Path $Root "images\peaks\$slug.jpg"
    $ogImage = if (Test-Path $imgPath) { "$Base/images/peaks/$slug.jpg" } else { $DefaultImage }

    $seoBlock = @"

    <link rel="canonical" href="$url">
    <meta property="og:type" content="website">
    <meta property="og:url" content="$url">
    <meta property="og:title" content="$title">
    <meta property="og:description" content="$desc">
    <meta property="og:image" content="$ogImage">
    <meta property="og:locale" content="fa_IR">
"@

    $html = $html -replace '(<meta name="description" content="[^"]*">)', "`$1$seoBlock"
    [System.IO.File]::WriteAllText($file, $html, [System.Text.UTF8Encoding]::new($false))
    $count++
}

Write-Host "SEO tags added to $count peak pages"
