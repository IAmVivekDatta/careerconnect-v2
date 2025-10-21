@echo off
REM Create a test user via API
powershell -Command "
$body = @{
    email = 'test@example.com'
    password = 'Test123456'
    name = 'Test User'
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri 'https://careerconnect-v2.onrender.com/api/auth/register' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
    Write-Host 'Registration successful!'
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host 'Error:' $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
}
"
