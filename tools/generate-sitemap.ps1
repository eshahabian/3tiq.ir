#Requires -Version 5.1
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Base = 'https://3tiq.ir'
$Today = (Get-Date).ToString('yyyy-MM-dd')

$exclude = @('_archive', 'tools', 'Panahgah.html', 'mountain-profile.html')
$rootPeakDupes = @(
    'damavand.html','alamkooh.html','sabalan.html','zardkooh.html','hezar.html',
    'dena.html','eshterankoh.html','shirkoh.html','tochal.html','sahand.html',
    'taftan.html','karkas.html'
)

$urls = New-Object System.Collections.Generic.List[string]
$urls.Add("$Base/")

function Add-Url {
    param([string]$Path, [string]$Priority = '0.6', [string]$Freq = 'monthly')
    $clean = ($Path -replace '\\','/').TrimStart('/')
    $loc = if ($clean) { "$Base/$clean" } else { "$Base/" }
    if ($urls -notcontains $loc) {
        $script:entries += @"
  <url>
    <loc>$loc</loc>
    <lastmod>$Today</lastmod>
    <changefreq>$Freq</changefreq>
    <priority>$Priority</priority>
  </url>
"@
        $urls.Add($loc) | Out-Null
    }
}

$entries = @()

$core = @(
    @{ p = ''; pr = '1.0'; f = 'weekly' },
    @{ p = 'blog.html'; pr = '0.9'; f = 'weekly' },
    @{ p = 'panahgah.html'; pr = '0.9'; f = 'weekly' },
    @{ p = 'blog-damavand-guide.html'; pr = '0.8'; f = 'monthly' }
)
foreach ($c in $core) { Add-Url $c.p $c.pr $c.f }

Get-ChildItem $Root -Filter '*.html' -File | ForEach-Object {
    $name = $_.Name
    if ($name -in $rootPeakDupes) { return }
    if ($name -match '^(index|blog|panahgah|blog-damavand|mountain-profile|Panahgah)\.html$') { return }
    Add-Url $name '0.7' 'monthly'
}

Get-ChildItem (Join-Path $Root 'peaks') -Filter '*.html' | ForEach-Object {
    Add-Url ("peaks/" + $_.Name) '0.7' 'monthly'
}

Get-ChildItem (Join-Path $Root 'blog') -Filter '*.html' | ForEach-Object {
    Add-Url ("blog/" + $_.Name) '0.6' 'monthly'
}

$xml = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
$($entries -join "`n")
</urlset>
"@

$out = Join-Path $Root 'sitemap.xml'
[System.IO.File]::WriteAllText($out, $xml.Trim(), [System.Text.UTF8Encoding]::new($false))
Write-Host "sitemap.xml: $($urls.Count) URLs"
