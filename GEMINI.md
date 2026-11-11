# WhaToWear Workspace Rules

## Automatic Git Commit & Push (GitHub Desktop — Multi-PC Compatible)
- **GitHub Desktop App**: `$env:LOCALAPPDATA\GitHubDesktop\GitHubDesktop.exe`
- **GitHub Desktop Bundled Git CLI (auto-resolved across PCs & versions)**:
  ```powershell
  $git = (Get-Command git -ErrorAction SilentlyContinue).Source
  if (-not $git) { $git = (Get-Item "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName }
  ```

Whenever you complete a code or documentation change in this workspace:
1. Keep `index.html` and `README.md` synced in both the workspace root and the `WhaToWear\` GitHub Desktop repository folder if present.
2. Stage all modified/created files using `& $git add -A`.
3. Commit the changes with a clear, concise commit message describing what was updated using `& $git commit -m "<message>"`.
4. Push the commit to the GitHub remote (`https://github.com/marcelofariello/WhaToWear.git`) on branch `main` using `& $git push origin main` (or let GitHub Desktop push).
