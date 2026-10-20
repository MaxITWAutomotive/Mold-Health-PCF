# Scaffolds a new PCF project and wires it into MoldHealthSolution (run from repo root on Windows).
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

Set-Location $repoRoot\MoldHealthSolution
Write-Host "Adding project reference to MoldHealthSolution..."
pac solution add-reference --path "..\$Name"

Write-Host @"

Next steps:
  1. Implement control in $Name\$Name\
  2. Bump control version in ControlManifest.Input.xml when you change behavior
  3. Bump solution version in MoldHealthSolution\src\Other\Solution.xml before release import
  4. Do NOT hand-edit CustomControls or RootComponents in src\Other\ — MSBuild adds them at pack time
  5. Dev loop:  cd $Name && npm start watch
     Fast deploy: pac auth create --environment <url> && pac pcf push --publisher-prefix $PublisherPrefix
  6. CI: push to main → GitHub Actions → import MoldHealthSolution.zip artifact

"@
