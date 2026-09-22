$winmd = [System.IO.Path]::Combine($env:windir, "System32\WinMetadata")
if (Test-Path $winmd) {
    Get-ChildItem $winmd -Filter "*.winmd" | ForEach-Object {
        try {
            Add-Type -Path $_.FullName -ErrorAction SilentlyContinue
        } catch {}
    }
}

Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Await ($asyncAction) {
    $asTaskGeneric = ([System.Windows.Foundation.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
    $asTask = $asTaskGeneric.MakeGenericMethod($asyncAction.GetType().GetInterfaces()[0].GetGenericArguments()[0])
    $task = $asTask.Invoke($null, @($asyncAction))
    $task.Wait()
    return $task.Result
}

$lang = New-Object Windows.Globalization.Language("en-US")
$ocr = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)

$files = Get-ChildItem "c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\certs\images\*.png"

foreach ($file in $files) {
    try {
        $fileStream = [Windows.Storage.StorageFile]::GetFileFromPathAsync($file.FullName)
        $storageFile = Await $fileStream
        $stream = Await ($storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read))
        $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream))
        $bmp = Await ($decoder.GetSoftwareBitmapAsync())
        $ocrResult = Await ($ocr.RecognizeAsync($bmp))
        Write-Host "=== FILE: $($file.Name) ==="
        Write-Host $ocrResult.Text
    } catch {
        Write-Host "Error processing $($file.Name): $_"
    }
}
