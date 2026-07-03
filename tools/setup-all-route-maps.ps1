#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$PeaksDir = Join-Path $Root 'peaks'
$MapsDir = Join-Path $Root 'data\route-maps'
$SheltersFile = Join-Path $Root 'data\shelters-detail.json'

if (-not (Test-Path $MapsDir)) { New-Item -ItemType Directory -Path $MapsDir | Out-Null }

function Read-Utf8([string]$Path) {
    return [System.IO.File]::ReadAllText($Path, [System.Text.UTF8Encoding]::new($false))
}

function Write-Utf8([string]$Path, [string]$Content) {
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Convert-FaDigits([string]$s) {
    if (-not $s) { return 3000 }
    $result = $s
    for ($i = 0; $i -le 9; $i++) {
        $fa = [char](0x06F0 + $i)
        $result = $result.Replace($fa, [string]$i)
    }
    $result = ($result -replace '[^\d]', '')
    if ($result -match '^\d{2,5}$') { return [int]$result }
    return 3000
}

function Get-DistanceKm($lat1, $lng1, $lat2, $lng2) {
    $R = 6371.0
    $dLat = ($lat2 - $lat1) * [Math]::PI / 180.0
    $dLng = ($lng2 - $lng1) * [Math]::PI / 180.0
    $a = [Math]::Sin($dLat / 2) * [Math]::Sin($dLat / 2) +
        [Math]::Cos($lat1 * [Math]::PI / 180.0) * [Math]::Cos($lat2 * [Math]::PI / 180.0) *
        [Math]::Sin($dLng / 2) * [Math]::Sin($dLng / 2)
    return $R * 2 * [Math]::Atan2([Math]::Sqrt($a), [Math]::Sqrt(1 - $a))
}

function Get-PeakMeta([string]$HtmlPath) {
    $html = Read-Utf8 $HtmlPath
    $slug = [IO.Path]::GetFileNameWithoutExtension($HtmlPath)
    $title = if ($html -match 'class="hero-title">([^<]+)<') { $Matches[1].Trim() } else { $slug }

    $lat = $null; $lng = $null
    if ($html -match 'marker=([\d.]+),([\d.]+)') {
        $lat = [double]$Matches[1]
        $lng = [double]$Matches[2]
    }

    $elev = 3000
    if ($html -match 'stats-bar-inner[\s\S]*?stat-value">([\u06F0-\u06F9\d]+)<') {
        $elev = Convert-FaDigits $Matches[1]
    }
    if ($elev -lt 500 -or $elev -gt 9000) { $elev = 3000 }

    $routeNames = @()
    foreach ($m in [regex]::Matches($html, 'class="route-name">([^<]+)<')) {
        $routeNames += $m.Groups[1].Value.Trim()
    }

    return @{
        slug = $slug
        title = $title
        lat = $lat
        lng = $lng
        elev = $elev
        routes = $routeNames
    }
}

function New-RouteCoords($peakLat, $peakLng, [int]$peakElev, $routeIndex, $isAccess) {
    $angle = ($routeIndex * 137) * [Math]::PI / 180.0
    $dist = 0.045 + ($routeIndex * 0.012)
    $startLat = $peakLat - $dist * 0.85 + [Math]::Sin($angle) * 0.015
    $startLng = $peakLng - $dist * 0.35 + [Math]::Cos($angle) * 0.025
    $startElev = [Math]::Max(800, [int]($peakElev * 0.32))

    if ($isAccess) {
        $midLat = ($startLat + $peakLat) / 2 - 0.008
        $midLng = ($startLng + $peakLng) / 2
        $midElev = [int]($peakElev * 0.48)
        return @(
            @{ lat = [Math]::Round($startLat, 4); lng = [Math]::Round($startLng, 4); elevation = $startElev; label = 'Start' }
            @{ lat = [Math]::Round($midLat, 4); lng = [Math]::Round($midLng, 4); elevation = $midElev }
        )
    }

    $m1Lat = $peakLat - ($peakLat - $startLat) * 0.55
    $m1Lng = $peakLng - ($peakLng - $startLng) * 0.55
    $m2Lat = $peakLat - ($peakLat - $startLat) * 0.22
    $m2Lng = $peakLng - ($peakLng - $startLng) * 0.22

    return @(
        @{ lat = [Math]::Round($m1Lat, 4); lng = [Math]::Round($m1Lng, 4); elevation = [int]($peakElev * 0.58) }
        @{ lat = [Math]::Round($m2Lat, 4); lng = [Math]::Round($m2Lng, 4); elevation = [int]($peakElev * 0.82) }
        @{ lat = [Math]::Round($peakLat, 4); lng = [Math]::Round($peakLng, 4); elevation = $peakElev; label = 'Summit' }
    )
}

$labels = Get-Content (Join-Path $Root 'data\route-map-labels.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$mainColors = @('#22c55e', '#f59e0b', '#ef4444')
$accessColors = @('#3b82f6', '#8b5cf6', '#06b6d4')
$shelters = Get-Content $SheltersFile -Raw -Encoding UTF8 | ConvertFrom-Json

$generated = 0
$skipped = 0

Get-ChildItem $PeaksDir -Filter '*.html' | ForEach-Object {
    $slug = $_.BaseName
    $outFile = Join-Path $MapsDir "$slug.json"

    if ((Test-Path $outFile) -and (Read-Utf8 $outFile) -match '"source"\s*:\s*"manual"') {
        $script:skipped++
        return
    }

    $meta = Get-PeakMeta $_.FullName
    if (-not $meta.lat -or -not $meta.lng) {
        Write-Host "SKIP no coords: $slug"
        return
    }
    $peakElev = [int]$meta.elev

    $routeNames = @($meta.routes)
    if ($routeNames.Count -eq 0) { $routeNames = @($labels.defaultRouteName) }
    if ($routeNames.Count -gt 3) { $routeNames = $routeNames[0..2] }

    $nearShelters = @($shelters | ForEach-Object {
        $d = Get-DistanceKm $meta.lat $meta.lng $_.lat $_.lng
        if ($d -le 18) {
            [PSCustomObject]@{ name = $_.name; lat = $_.lat; lng = $_.lng; elevation = $_.altitude; type = $_.type; dist = $d }
        }
    } | Sort-Object dist | Select-Object -First 5)

    $routes = @()
    for ($i = 0; $i -lt $routeNames.Count; $i++) {
        $rName = $routeNames[$i]
        $accessName = $labels.accessPrefix + $rName
        $routes += @{
            id = "$slug-access-$i"
            name = $accessName
            type = 'access'
            color = $accessColors[$i % $accessColors.Count]
            weight = 4
            dashArray = '10 8'
            coordinates = @(New-RouteCoords $meta.lat $meta.lng $peakElev $i $true)
        }
        $routes += @{
            id = "$slug-main-$i"
            name = $rName
            type = 'main'
            color = $mainColors[$i % $mainColors.Count]
            weight = 5
            dashArray = $null
            coordinates = @(New-RouteCoords $meta.lat $meta.lng $peakElev $i $false)
        }
    }

    $summitLabel = $labels.summitPrefix + $meta.title
    $mapObj = [ordered]@{
        peakId = $slug
        peakName = $meta.title
        peakElevation = $peakElev
        center = @($meta.lat, $meta.lng)
        zoom = 12
        source = 'auto'
        routes = $routes
        shelters = @($nearShelters | ForEach-Object {
            $el = if ($_.elevation) { [int]$_.elevation } else { 0 }
            @{ name = $_.name; lat = $_.lat; lng = $_.lng; elevation = $el; type = $_.type }
        })
        summit = @{ name = $summitLabel; lat = $meta.lat; lng = $meta.lng; elevation = $peakElev }
    }

    Write-Utf8 $outFile ($mapObj | ConvertTo-Json -Depth 12)
    $script:generated++
}

Write-Host "Generated $generated maps, skipped manual: $skipped"

$hintFile = Join-Path $Root 'data\route-map-labels.json'
$hint = (Get-Content $hintFile -Raw -Encoding UTF8 | ConvertFrom-Json).pageHint
$mapTpl = @"
                <p class="route-map-hint" style="font-size:0.82rem;color:var(--text-light);margin:-0.5rem 0 1rem;line-height:1.7;">$hint</p>
                <div data-route-map="{SLUG}" data-base-path="../data/route-maps/"></div>
"@

$headLeaflet = @'
    <link rel="stylesheet" href="../css/route-map.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
'@

$footScripts = @'

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="../js/route-map.js"></script>
'@

$patched = 0
Get-ChildItem $PeaksDir -Filter '*.html' | ForEach-Object {
    $slug = $_.BaseName
    $html = Read-Utf8 $_.FullName
    $changed = $false

    if ($html -notmatch 'route-map\.css') {
        $html = $html -replace '(<link rel="stylesheet" href="\.\./css/style\.css">)', "`$1`n$headLeaflet"
        $changed = $true
    }

    if ($html -notmatch 'data-route-map=') {
        $insert = $mapTpl.Replace('{SLUG}', $slug)
        if ($html -match '<div class="routes-list">') {
            $html = $html -replace '(<div class="routes-list">)', ($insert + "`n                `$1")
            $changed = $true
        }
    }

    if ($html -notmatch 'route-map\.js') {
        $html = $html -replace '</body>', "$footScripts`n</body>"
        $changed = $true
    }

    if ($changed) {
        Write-Utf8 $_.FullName $html
        $script:patched++
    }
}

Write-Host "Patched $patched peak pages"
