$code = @"
using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Globalization;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage;

public class OcrHelper {
    public static async Task<string> Recognize(string filePath) {
        try {
            StorageFile file = await StorageFile.GetFileFromPathAsync(filePath);
            using (var stream = await file.OpenAsync(FileAccessMode.Read)) {
                BitmapDecoder decoder = await BitmapDecoder.CreateAsync(stream);
                SoftwareBitmap bitmap = await decoder.GetSoftwareBitmapAsync();
                OcrEngine engine = OcrEngine.TryCreateFromLanguage(new Language("en-US"));
                if (engine == null) return "Engine Null";
                OcrResult result = await engine.RecognizeAsync(bitmap);
                return result.Text;
            }
        } catch (Exception ex) {
            return "ERROR: " + ex.Message;
        }
    }
}
"@

$winmd = "C:\Windows\System32\WinMetadata\Windows.Media.Ocr.winmd"
$winmd2 = "C:\Windows\System32\WinMetadata\Windows.Foundation.UniversalApiContract.winmd"

Add-Type -TypeDefinition $code -ReferencedAssemblies $winmd, $winmd2, "System.Runtime.WindowsRuntime.dll"

$files = Get-ChildItem "c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\certs\images\*.png"
foreach ($f in $files) {
    Write-Host "=== $($f.Name) ==="
    $task = [OcrHelper]::Recognize($f.FullName)
    $task.Wait()
    Write-Host $task.Result
}
