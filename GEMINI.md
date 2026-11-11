# WhaToWear Workspace Rules

## Automatic Git Commit & Push (GitHub Desktop)
- **GitHub Desktop App**: `C:\Users\ec387923\AppData\Local\GitHubDesktop\GitHubDesktop.exe`
- **GitHub Desktop Bundled Git CLI**: `C:\Users\ec387923\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe`

Whenever you complete a code or documentation change in this workspace:
1. Keep `index.html` and `README.md` synced in both the workspace root and the `WhaToWear\` GitHub Desktop repository folder if present.
2. Stage all modified/created files using `"C:\Users\ec387923\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe" add -A`.
3. Commit the changes with a clear, concise commit message describing what was updated using `"C:\Users\ec387923\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe" commit -m "<message>"`.
4. Push the commit to the GitHub remote (`https://github.com/marcelofariello/WhaToWear.git`) on branch `main` using `"C:\Users\ec387923\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe" push origin main` (or let GitHub Desktop push).
