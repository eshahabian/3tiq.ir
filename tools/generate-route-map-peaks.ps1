$dir = Join-Path $PSScriptRoot '..\data\route-maps'
$out = Join-Path $PSScriptRoot '..\data\route-map-peaks.json'
$peaks = Get-ChildItem (Join-Path $dir '*.json') | ForEach-Object {
    $j = Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    [PSCustomObject]@{ id = $j.peakId; name = $j.peakName; elevation = [int]$j.peakElevation }
}
$peaks | Sort-Object elevation -Descending | ConvertTo-Json -Depth 3 |
    Set-Content $out -Encoding UTF8
Write-Host "Wrote $($peaks.Count) peaks to $out"
