$ErrorActionPreference = "Stop"

$root = "E:\ip_mini_pro"
$backendRoot = Join-Path $root "Backend\Student_Event_Registration_Management_System"
$frontendRoot = Join-Path $root "frontend\event"

Write-Host "Starting backend services and frontend..." -ForegroundColor Cyan

# Each service needs its own terminal because spring-boot:run is blocking.
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$backendRoot\faculty-service'; mvn spring-boot:run"
)

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$backendRoot\student-service'; mvn spring-boot:run"
)

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$backendRoot\event-service'; mvn spring-boot:run"
)

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$frontendRoot'; npm run dev"
)

Write-Host "Launched:" -ForegroundColor Green
Write-Host " - faculty-service (8081)"
Write-Host " - student-service (8082)"
Write-Host " - event-service (8083)"
Write-Host " - frontend Vite dev server (usually 5173)"
Write-Host ""
Write-Host "If any window fails, check that MongoDB is running on localhost:27017." -ForegroundColor Yellow
