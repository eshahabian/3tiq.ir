#Requires -Version 5.1
$PeakDir = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'peaks'
$count = 0

Get-ChildItem $PeakDir -Filter '*.html' | ForEach-Object {
    $file = $_.FullName
    $html = [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false))
    if ($html -notmatch '<title>([^<]+)</title>') { return }
    $title = $Matches[1].Trim()
    $newLine = '<meta property="og:title" content="' + $title + '">'
    $html = [regex]::Replace($html, '<meta property="og:title" content="[^"]*">', $newLine)
    [System.IO.File]::WriteAllText($file, $html, [System.Text.UTF8Encoding]::new($false))
    $count++
}

Write-Host "Fixed og:title on $count peak pages"
