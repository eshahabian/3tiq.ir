#Requires -Version 5.1
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Base = 'https://3tiq.ir'
$regions = @(
    'alborz-gharbi.html','alborz-markazi.html','alborz-shargi.html',
    'zagros-shomal.html','zagros-markazi.html','zagros-jonoob.html',
    'koohaye-markazi.html','koohaye-atashfeshani.html'
)

foreach ($name in $regions) {
    $file = Join-Path $Root $name
    if (-not (Test-Path $file)) { continue }
    $html = [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false))
    if ($html -match 'property="og:title"') { continue }
    if ($html -notmatch '<title>([^<]+)</title>') { continue }
    $title = $Matches[1].Trim()
    $desc = if ($html -match '<meta name="description" content="([^"]*)"') { $Matches[1] } else { '' }
    $url = "$Base/$name"
    $block = @"

    <meta property="og:type" content="website">
    <meta property="og:url" content="$url">
    <meta property="og:title" content="$title">
    <meta property="og:description" content="$desc">
    <meta property="og:image" content="$Base/images/peaks/damavand.jpg">
    <meta property="og:locale" content="fa_IR">
"@
    $html = $html -replace '(<link rel="canonical" href="[^"]*">)', "`$1$block"
    [System.IO.File]::WriteAllText($file, $html, [System.Text.UTF8Encoding]::new($false))
    Write-Host "OG added: $name"
}
