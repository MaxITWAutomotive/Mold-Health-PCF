# Scaffolds a new PCF project and wires it into MaxCustomPCFs (run from repo root on Windows).
param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [string]$Namespace = "ITW.Controls",
    [string]$PublisherPrefix = "itw"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

if (-not (Get-Command pac -ErrorAction SilentlyContinue)) {
    throw "Power Platform CLI (pac) is not on PATH. Install: https://learn.microsoft.com/power-platform/developer/cli/introduction"
}

if (Test-Path $Name) {
    throw "Folder '$Name' already exists."
}

Write-Host "Creating PCF project '$Name'..."
pac pcf init --name $Name --namespace $Namespace --control-type standard --run-npm-install

Set-Location $repoRoot\MaxCustomPCFs
Write-Host "Adding project reference to Max Custom PCFs solution..."
pac solution add-reference --path "..\$Name"

Write-Host @"

Next steps:
  1. Implement control in $Name\$Name\
  2. Bump control version in ControlManifest.Input.xml when you change behavior
  3. Bump solution version in MaxCustomPCFs\src\Other\Solution.xml before import
  4. Do NOT hand-edit CustomControls or RootComponents in src\Other\ — MSBuild adds them at pack time
  5. Build solution on a machine with .NET + pac, or re-enable GitHub Actions when ready
  6. Import MaxCustomPCFs.zip in make.powerapps.com → Publish all customizations

"@
