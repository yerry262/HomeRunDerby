class HighScoreManager {
    constructor() {
        this.collectionName = 'highscores';
        this.maxScores = 100;
        this.scores = [];
        this.isLoading = true;
        
        // Load scores from Firebase on initialization
        this.loadScores();
    }

    async loadScores() {
        try {
            this.isLoading = true;
            const snapshot = await db.collection(this.collectionName)
                .orderBy('score', 'desc')
                .limit(this.maxScores)
                .get();
            
            this.scores = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.isLoading = false;
            console.log('Loaded', this.scores.length, 'scores from Firebase');
        } catch (error) {
            console.error('Error loading scores from Firebase:', error);
            this.isLoading = false;
            // Fallback to localStorage if Firebase fails
            this.scores = this.loadLocalScores();
        }
    }

    loadLocalScores() {
        const stored = localStorage.getItem('homerunDerbyHighScores');
        return stored ? JSON.parse(stored) : [];
    }

    async isHighScore(score) {
        // Refresh scores before checking
        await this.loadScores();
        
        if (this.scores.length < this.maxScores) return true;
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
            await db.collection(this.collectionName).add(newScore);
            console.log('Score added to Firebase!');
            
            // Reload scores to get updated list
            await this.loadScores();
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            // Fallback to localStorage
            this.scores.push(newScore);
            this.scores.sort((a, b) => b.score - a.score);
            this.scores = this.scores.slice(0, this.maxScores);
            localStorage.setItem('homerunDerbyHighScores', JSON.stringify(this.scores));
        }
    }

    getHighScore() {
        return this.scores.length > 0 ? this.scores[0].score : 0;
    }

    getTopScores(limit = 100) {
        return this.scores.slice(0, limit);
    }

    async displayScores(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Show loading state
        container.innerHTML = '<p class="loading-scores">Loading scores...</p>';
        
        // Refresh scores from Firebase
        await this.loadScores();

        if (this.scores.length === 0) {
            container.innerHTML = '<p class="no-scores">No high scores yet! Be the first!</p>';
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
        container.innerHTML = html;
    }
}
