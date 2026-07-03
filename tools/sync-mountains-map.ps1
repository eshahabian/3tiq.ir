$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$mapsDir = Join-Path $root 'data\route-maps'
$mountainsPath = Join-Path $root 'js\mountains.json'

function Normalize-Name([string]$s) {
    if (-not $s) { return '' }
    $s = $s -replace '\u200c', ''
    $s = $s -replace '\s+', ''
    return $s.Trim().ToLowerInvariant()
}

$peakByNorm = @{}
$peakBySlug = @{}

Get-ChildItem (Join-Path $mapsDir '*.json') | ForEach-Object {
    $j = Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    $lat = $null
    $lng = $null
    if ($j.summit) {
        $lat = [double]$j.summit.lat
        $lng = [double]$j.summit.lng
    } elseif ($j.center) {
        $lat = [double]$j.center[0]
        $lng = [double]$j.center[1]
    }
    if ($null -eq $lat -or $null -eq $lng) { return }

    $entry = [PSCustomObject]@{
        slug     = $j.peakId
        name     = $j.peakName
        lat      = $lat
        lng      = $lng
        height   = [int]$j.peakElevation
        province = $null
    }
    $peakBySlug[$j.peakId] = $entry
    $peakByNorm[(Normalize-Name $j.peakName)] = $entry
}

$aliases = @{
    'شیرکوهیزد'       = 'shirkoh'
    'خلنو'            = 'khaleno'
    'زردکوهبختیاری'  = 'zardkooh'
    'قلهجنوبیدنا'    = 'dena-south'
    'زردکوه'          = 'zardkooh'
    'بوزقوش'          = 'bozghush'
    'سرکچال'          = 'sarchal'
}

$mountains = Get-Content $mountainsPath -Raw -Encoding UTF8 | ConvertFrom-Json
$updated = 0
$linked = 0
$out = foreach ($m in $mountains) {
    $norm = Normalize-Name $m.name
    $slug = $null
    if ($peakByNorm.ContainsKey($norm)) {
        $slug = $peakByNorm[$norm].slug
    } elseif ($aliases.ContainsKey($norm)) {
        $slug = $aliases[$norm]
    }

    if ($slug -and $peakBySlug.ContainsKey($slug)) {
        $p = $peakBySlug[$slug]
        $obj = [ordered]@{
            name     = $p.name
            lat      = [math]::Round($p.lat, 4)
            lng      = [math]::Round($p.lng, 4)
            height   = $p.height
            province = $m.province
            slug     = $slug
        }
        $linked++
        if ($m.lat -ne $p.lat -or $m.lng -ne $p.lng -or $m.height -ne $p.height) { $updated++ }
        $obj
    } else {
        [ordered]@{
            name     = $m.name
            lat      = $m.lat
            lng      = $m.lng
            height   = $m.height
            province = $m.province
        }
    }
}

$existingSlugs = @{}
foreach ($item in $out) {
    if ($item.slug) { $existingSlugs[$item.slug] = $true }
}

$provinceGuess = @{
    damavand = 'مازندران/تهران'; alamkooh = 'مازندران'; sabalan = 'اردبیل'
    zardkooh = 'چهارمحال و بختیاری'; tochal = 'تهران'; dena = 'کهگیلویه و بویراحمد'
    hezar = 'کرمان'; taftan = 'سیستان و بلوچستان'; sahand = 'آذربایجان شرقی'
    karkas = 'یزد'; shirkoh = 'یزد'; eshterankoh = 'لرستان'
}

foreach ($slug in $peakBySlug.Keys) {
    if ($existingSlugs.ContainsKey($slug)) { continue }
    $p = $peakBySlug[$slug]
    $prov = if ($provinceGuess.ContainsKey($slug)) { $provinceGuess[$slug] } else { 'ایران' }
    $out += ,([ordered]@{
        name     = $p.name
        lat      = [math]::Round($p.lat, 4)
        lng      = [math]::Round($p.lng, 4)
        height   = $p.height
        province = $prov
        slug     = $slug
    })
    $linked++
}

$json = $out | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($mountainsPath, $json, [System.Text.UTF8Encoding]::new($false))
Write-Host "Mountains: $($out.Count) total, $linked with slug, $updated coords corrected"
