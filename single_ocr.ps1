param([string]$ImagePath)

[Windows.Foundation.IAsyncOperation,Windows.Foundation,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine,Windows.Media.Ocr,ContentType=WindowsRuntime] | Out-Null
[Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime] | Out-Null
Add-Type -AssemblyName System.Runtime.WindowsRuntime

try {
    $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

    function AwaitOp($asyncOp) {
        $asTask = $asTaskGeneric.MakeGenericMethod($asyncOp.GetType().GetInterfaces()[0].GetGenericArguments()[0])
        $task = $asTask.Invoke($null, @($asyncOp))
        $task.Wait()
        return $task.Result
    }

    $lang = [Windows.Globalization.Language]::new("en-US")
    $ocr = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
    
    $file = AwaitOp ([Windows.Storage.StorageFile]::GetFileFromPathAsync($ImagePath))
    $stream = AwaitOp ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read))
    $decoder = AwaitOp ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream))
    $bmp = AwaitOp ($decoder.GetSoftwareBitmapAsync())
    $result = AwaitOp ($ocr.RecognizeAsync($bmp))
    
    Write-Output $result.Text
} catch {
    Write-Output "ERR: $_"
}
