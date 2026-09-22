[Windows.Foundation.IAsyncOperation,Windows.Foundation,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine,Windows.Media.Ocr,ContentType=WindowsRuntime] | Out-Null
[Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime] | Out-Null

$lang = New-Object Windows.Globalization.Language("en-US")
$ocr = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)

if ($ocr -eq $null) {
    Write-Host "Failed to create OCR engine"
    exit
}

function Get-OcrText($filePath) {
    $fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($filePath)
    while (-not $fileTask.IsCompleted) { Start-Sleep -Milliseconds 10 }
    $file = $fileTask.GetResults()

    $streamTask = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    while (-not $streamTask.IsCompleted) { Start-Sleep -Milliseconds 10 }
    $stream = $streamTask.GetResults()

    $decoderTask = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    while (-not $decoderTask.IsCompleted) { Start-Sleep -Milliseconds 10 }
    $decoder = $decoderTask.GetResults()

    $bmpTask = $decoder.GetSoftwareBitmapAsync()
    while (-not $bmpTask.IsCompleted) { Start-Sleep -Milliseconds 10 }
    $bmp = $bmpTask.GetResults()

    $ocrTask = $ocr.RecognizeAsync($bmp)
    while (-not $ocrTask.IsCompleted) { Start-Sleep -Milliseconds 10 }
    $result = $ocrTask.GetResults()

    return $result.Text
}

$files = Get-ChildItem "c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\certs\images\*.png"

foreach ($f in $files) {
    Write-Host "=== FILE: $($f.Name) ==="
    $text = Get-OcrText $f.FullName
    Write-Host $text
}
