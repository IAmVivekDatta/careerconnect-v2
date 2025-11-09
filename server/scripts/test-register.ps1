param(
    [string]$ApiBase = "https://careerconnect-v2.onrender.com",
    [string]$Email = "test@example.com",
    [string]$Password = "Test123456",
    [string]$Name = "Test User"
)

$payload = @{
    email    = $Email
    password = $Password
    name     = $Name
}

$body = $payload | ConvertTo-Json
$uri = "$ApiBase/api/auth/register"

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType 'application/json'
    Write-Host "Registration successful!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 4
} catch {
    Write-Host "Registration failed:" -ForegroundColor Red
    if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream()) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    } else {
        $_.Exception.Message
    }
    exit 1
}
