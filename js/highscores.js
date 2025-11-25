class HighScoreManager {
    constructor() {
        this.collectionName = 'highscores';
        this.maxScores = 100;
        this.scores = [];
        this.isLoading = false;
    }

    async loadScores() {
        console.log('Fetching scores from Firebase...');
        try {
            this.isLoading = true;
            
            // Fetch all scores, sort client-side to avoid needing an index
            const snapshot = await db.collection(this.collectionName).get();
            
            this.scores = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort by score descending
            this.scores.sort((a, b) => b.score - a.score);
            
            // Keep only top 100
            this.scores = this.scores.slice(0, this.maxScores);
            
            this.isLoading = false;
            console.log('Successfully loaded', this.scores.length, 'scores from Firebase');
            return true;
        } catch (error) {
            console.error('Error loading scores from Firebase:', error);
            this.isLoading = false;
            return false;
        }
    }

    async isHighScore(score) {
        // Always refresh scores before checking
        await this.loadScores();
        
        if (this.scores.length < this.maxScores) return true;
        if (this.scores.length === 0) return true;
        return score > this.scores[this.scores.length - 1].score;
    }

    async addScore(name, score) {
        // Validate name (up to 8 letters, alphanumeric)
        name = name.trim().substring(0, 8).toUpperCase();
        if (!name) name = 'PLAYER';

        const newScore = {
            name: name,
            score: score,
            date: new Date().toISOString()
        };

        try {
            // Add to Firebase
            const docRef = await db.collection(this.collectionName).add(newScore);
            console.log('Score added to Firebase with ID:', docRef.id);
            
            // Reload scores to get updated list
            await this.loadScores();
            return true;
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            return false;
        }
    }

    async getHighScore() {
        // Fetch latest scores
        await this.loadScores();
        return this.scores.length > 0 ? this.scores[0].score : 0;
    }

    getTopScores(limit = 100) {
        return this.scores.slice(0, limit);
    }

    async displayScores(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Show loading state
        container.innerHTML = '<p class="loading-scores">⏳ Loading global scores...</p>';
        
        // Always fetch fresh from Firebase
        const success = await this.loadScores();

        if (!success) {
            container.innerHTML = '<p class="no-scores">⚠️ Could not connect to leaderboard. Please try again.</p>';
            return;
        }

        if (this.scores.length === 0) {
            container.innerHTML = '<p class="no-scores">🏆 No high scores yet! Be the first!</p>';
            return;
        }

        let html = '<table class="scores-table"><thead><tr><th>Rank</th><th>Name</th><th>Home Runs</th></tr></thead><tbody>';
        
        this.scores.forEach((entry, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            html += `<tr class="rank-${rank}">`;
            html += `<td>${medal} ${rank}</td>`;
            html += `<td>${entry.name}</td>`;
            html += `<td>${entry.score}</td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table>';
        html += '<p class="scores-footer">🌐 Global Leaderboard</p>';
        container.innerHTML = html;
    }
}
