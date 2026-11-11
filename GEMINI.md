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
2. Before making edits on a new session, run `& $git pull --rebase origin main` so local files start up-to-date.
3. Stage all modified/created files using `& $git add -A`.
4. Commit the changes with a clear, concise commit message describing what was updated using `& $git commit -m "<message>"`.
5. Push the commit to the GitHub remote (`https://github.com/marcelofariello/WhaToWear.git`) on branch `main` using `& $git push origin main` (or let GitHub Desktop push).
