Write-Host "Starting Auto-Sync to GitHub..."
Write-Host "Press Ctrl+C to stop."

while ($true) {
    # Check for changes
    $status = git status --porcelain
    
    if ($status) {
        Write-Host "Changes detected at $(Get-Date). Syncing..."
        
        # Add all changes
        git add .
        
        # Commit with timestamp
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-update: $timestamp"
        
        # Pull changes
        Write-Host "Pulling remote changes..."
        git pull --rebase
        
        # Push to remote
        git push
        
        if ($?) {
            Write-Host "Synced successfully."
        }
        else {
            Write-Host "Error syncing. Retrying in next cycle."
        }
    }
    
    # Wait before next check
    Start-Sleep -Seconds 10
}
