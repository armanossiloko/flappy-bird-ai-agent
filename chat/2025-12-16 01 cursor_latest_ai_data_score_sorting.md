# Latest AI data score sorting
_Exported on 12/16/2025 at 17:34:12 GMT+1 from Cursor (2.2.23)_

---

**User**

Please make it so that /api/latest-ai-data returns the data with the highest score instead of sorting them by mtime

This is how a file is usually named "flappy-bird-ai-gen30-score101378.json"

---

**Cursor**


Examining `server.js` to understand the current implementation.



Updating the endpoint to extract the score from filenames and return the file with the highest score instead of sorting by mtime.


```javascript
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// API endpoint to get the latest AI data file
app.get('/api/latest-ai-data', async (req, res) => {
    try {
        const dataDir = path.join(__dirname, 'data');
        
        // Check if data directory exists
        try {
            await fs.access(dataDir);
        } catch (error) {
            return res.json({ success: false, message: 'No AI data found yet' });
        }
        
        // Read all files in data directory recursively
        const files = await getAllJsonFiles(dataDir);
        
        if (files.length === 0) {
            return res.json({ success: false, message: 'No AI data files found' });
        }
        
        // Get file stats and extract scores from filenames
        const filesWithStats = await Promise.all(
            files.map(async (file) => {
                const stats = await fs.stat(file);
                const filename = path.basename(file);
                
                // Extract score from filename pattern: "flappy-bird-ai-gen30-score101378.json"
                const scoreMatch = filename.match(/score(\d+)/);
                const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
                
                return {
                    path: file,
                    mtime: stats.mtime,
                    name: filename,
                    score: score
                };
            })
        );
        
        // Sort by score (highest first), then by mtime as fallback
        filesWithStats.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return b.mtime - a.mtime;
        });
        
        const latestFile = filesWithStats[0];
        
        // Read the file content
        const fileContent = await fs.readFile(latestFile.path, 'utf-8');
        const aiData = JSON.parse(fileContent);
        
        res.json({
            success: true,
            data: aiData,
            filename: latestFile.name,
            savedAt: aiData.savedAt || latestFile.mtime.toISOString()
        });
        
    } catch (error) {
        console.error('Error loading AI data:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading AI data: ' + error.message
        });
    }
});

// Recursive function to get all JSON files in a directory
async function getAllJsonFiles(dir) {
    const files = [];
    
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively search subdirectories
                const subFiles = await getAllJsonFiles(fullPath);
                files.push(...subFiles);
            } else if (entry.isFile() && entry.name.endsWith('.json')) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Directory doesn't exist or can't be read
        console.warn(`Could not read directory ${dir}:`, error.message);
    }
    
    return files;
}

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🎮 Flappy Bird AI Server is running!`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🤖 The AI will automatically load the latest saved data on startup`);
    console.log(`\nPress Ctrl+C to stop the server`);
});



```


Checking for linting errors:



Updated the `/api/latest-ai-data` endpoint to return the file with the highest score instead of sorting by modification time.

Changes:
1. **Score extraction**: Extracts the score from filenames using the pattern `score(\d+)` (e.g., "flappy-bird-ai-gen30-score101378.json" → 101378).
2. **Sorting**: Sorts by score (descending), with mtime as a tiebreaker.

The endpoint now returns the AI data with the highest score, matching the filename pattern you provided.

