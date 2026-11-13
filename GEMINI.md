# WhaToWear Workspace Rules

## Automatic Git Commit & Push (GitHub Desktop — Multi-PC Compatible)
- **GitHub Desktop App**: `$env:LOCALAPPDATA\GitHubDesktop\GitHubDesktop.exe`
- **GitHub Desktop Bundled Git CLI (auto-resolved across PCs & versions)**:
  ```powershell
  $git = (Get-Command git -ErrorAction SilentlyContinue).Source
  if (-not $git) { $git = (Get-Item "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName }
  ```

Whenever you complete a code or documentation change in this workspace:
1. Keep `index.html`, `README.md`, and `GEMINI.md` synced across:
   - the active workspace root,
   - the `WhaToWear\` subfolder if present, and
   - the shared OneDrive folder `$env:USERPROFILE\OneDrive - Mars Inc\Desktop\files to trasfer\whatowear` (and its `WhaToWear\` subfolder) if present.
2. Before making edits on a new session, run `& $git pull --rebase origin main` (with `$env:GCM_INTERACTIVE = 'never'` and `$env:GIT_TERMINAL_PROMPT = '0'`) so local files start up-to-date.
3. Stage all modified/created files using `& $git add -A`.
4. Commit the changes with a clear, concise commit message describing what was updated using `& $git commit -m "<message>"`.
5. Push the commit to the GitHub remote (`https://github.com/marcelofariello/WhaToWear.git`) on branch `main` **non-interactively with a 20-second timeout** so unattended runs never hang waiting on Git Credential Manager prompts. If push fails for missing non-interactive credentials or times out, stop cleanly without retrying forever so GitHub Desktop can push the committed change:
   ```powershell
   $repo = if (Test-Path 'WhaToWear\.git') { 'WhaToWear' } else { '.' }
   $env:GCM_INTERACTIVE = 'never'
   $env:GIT_TERMINAL_PROMPT = '0'
   $inLog = [IO.Path]::GetTempFileName()
   $outLog = [IO.Path]::GetTempFileName()
   $errLog = [IO.Path]::GetTempFileName()
   $p = Start-Process -FilePath $git -ArgumentList '-C', $repo, 'push', 'origin', 'main' -RedirectStandardInput $inLog -RedirectStandardOutput $outLog -RedirectStandardError $errLog -WindowStyle Hidden -PassThru
   $null = $p.Handle
   if (-not $p.WaitForExit(20000)) {
     & taskkill.exe /PID $p.Id /T /F | Out-Null
     Write-Output 'git push timed out after 20s; commit is saved locally for GitHub Desktop.'
   } else {
     Get-Content $outLog, $errLog -ErrorAction SilentlyContinue
     if ($p.ExitCode -ne 0) {
       Write-Output "git push exited with code $($p.ExitCode); commit is saved locally for GitHub Desktop."
     }
   }
   Remove-Item $inLog, $outLog, $errLog -ErrorAction SilentlyContinue
   ```
