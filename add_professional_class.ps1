$filePath = "c:\Users\Alfredo Pabón\Documents\Proyectos antigravity\index.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Reemplazar en headers de tabla
$content = $content -replace 'class="([^"]*text-farmacia[^"]*)"', 'class="$1 professional-only"'

# Limpiar duplicados si ya existía
$content = $content -replace ' professional-only professional-only', ' professional-only'

$content | Set-Content $filePath -Encoding UTF8 -NoNewline
Write-Host "Completado"
