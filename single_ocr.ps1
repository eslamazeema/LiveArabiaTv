
param([string]$ImagePath)

[Windows.Foundation.IAsyncOperation,Windows.Foundation,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine,Windows.Media.Ocr,ContentType=WindowsRuntime] | Out-Null
[Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime] | Out-Null

try {
    $lang = [Windows.Globalization.Language]::new("en-US")
    $ocr = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
    
    $fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($ImagePath)
    $file = $fileTask.GetAwaiter().GetResult()
    
    $streamTask = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = $streamTask.GetAwaiter().GetResult()
    
    $decoderTask = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = $decoderTask.GetAwaiter().GetResult()
    
    $bmpTask = $decoder.GetSoftwareBitmapAsync()
    $bmp = $bmpTask.GetAwaiter().GetResult()
    
    $ocrTask = $ocr.RecognizeAsync($bmp)
    $result = $ocrTask.GetAwaiter().GetResult()
    
    Write-Output $result.Text
} catch {
    Write-Output "ERR: $_"
}
