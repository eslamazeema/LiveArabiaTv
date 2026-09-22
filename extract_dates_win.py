import os
import subprocess
import json

certs_img_dir = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\certs\images"

ps_script = r"""
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
"""

ps_path = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\single_ocr.ps1"
with open(ps_path, "w", encoding="utf-8") as f:
    f.write(ps_script)

results = {}
for fname in sorted(os.listdir(certs_img_dir)):
    if fname.endswith((".png", ".jpg", ".jpeg")):
        fpath = os.path.join(certs_img_dir, fname)
        cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", ps_path, "-ImagePath", fpath]
        res = subprocess.run(cmd, capture_output=True, text=True)
        txt = res.stdout.strip()
        print(f"=== {fname} ===")
        print(txt)
        results[fname] = txt

with open("ocr_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
