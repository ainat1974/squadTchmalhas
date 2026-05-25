# Starts n8n-mcp for Cursor MCP (stdio).
# Reads N8N_API_URL and N8N_API_KEY from Windows user env (setx) — not from git.

$ErrorActionPreference = 'Stop'

$reg = Get-ItemProperty -Path 'HKCU:\Environment' -ErrorAction SilentlyContinue
if ($reg.N8N_API_URL) { $env:N8N_API_URL = $reg.N8N_API_URL.TrimEnd('/') }
if ($reg.N8N_API_KEY) { $env:N8N_API_KEY = $reg.N8N_API_KEY }

$env:MCP_MODE = 'stdio'
$env:LOG_LEVEL = 'error'
$env:DISABLE_CONSOLE_OUTPUT = 'true'

if (-not $env:N8N_API_URL) {
  Write-Error 'N8N_API_URL not found. Run: setx N8N_API_URL "https://workflows.tmrodrigues.tech"'
  exit 1
}
if (-not $env:N8N_API_KEY) {
  Write-Error 'N8N_API_KEY not found. Run: setx N8N_API_KEY "your-jwt"'
  exit 1
}

& npx -y n8n-mcp @args
