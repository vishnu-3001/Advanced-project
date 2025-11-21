// Session Manager for storing and retrieving real session data
class SessionManager {
    constructor() {
        this.storageKey = 'learningDisabilitySessions';
        this.currentSessionKey = 'currentSession';
    }

    // Save a new session
    saveSession(sessionData) {
        try {
            const sessions = this.getAllSessions();
            
            const newSession = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...sessionData
            };
            
            sessions.unshift(newSession); // Add to beginning
            
            const jsonString = JSON.stringify(sessions);
            localStorage.setItem(this.storageKey, jsonString);
            
            return newSession;
        } catch (error) {
            console.error('Error in SessionManager.saveSession:', error);
            throw error;
        }
    }

    // Get all sessions
    getAllSessions() {
        const sessions = localStorage.getItem(this.storageKey);
        return sessions ? JSON.parse(sessions) : [];
    }

    // Get sessions by disability
    getSessionsByDisability(disability) {
        const sessions = this.getAllSessions();
        return sessions.filter(session => session.disability === disability);
    }

    // Get recent sessions (last N sessions)
    getRecentSessions(count = 10) {
        const sessions = this.getAllSessions();
        return sessions.slice(0, count);
    }

    // Get sessions by date range
    getSessionsByDateRange(startDate, endDate) {
        const sessions = this.getAllSessions();
        return sessions.filter(session => {
            const sessionDate = new Date(session.timestamp);
            return sessionDate >= startDate && sessionDate <= endDate;
        });
    }

    // Calculate performance metrics
    calculatePerformanceMetrics(sessions = null) {
        const sessionData = sessions || this.getAllSessions();
        
        if (sessionData.length === 0) {
            return {
                totalSessions: 0,
                averageConsistency: 0,
                averageAccuracy: 0,
                improvementRate: 0,
                topPerformingDisability: 'No data',
                commonMistakes: []
            };
        }

        // Calculate averages
        const totalSessions = sessionData.length;
        const averageConsistency = sessionData.reduce((sum, s) => sum + (s.consistency_score || 0), 0) / totalSessions;
        const averageAccuracy = sessionData.reduce((sum, s) => sum + (s.is_correct ? 1 : 0), 0) / totalSessions;

        // Calculate improvement rate
        const recentSessions = sessionData.slice(0, Math.min(5, Math.floor(totalSessions / 2)));
        const olderSessions = sessionData.slice(Math.min(5, Math.floor(totalSessions / 2)));
        
        let improvementRate = 0;
        if (olderSessions.length > 0) {
            const recentAvg = recentSessions.reduce((sum, s) => sum + (s.consistency_score || 0), 0) / recentSessions.length;
            const olderAvg = olderSessions.reduce((sum, s) => sum + (s.consistency_score || 0), 0) / olderSessions.length;
            improvementRate = ((recentAvg - olderAvg) / olderAvg) * 100;
        }

        // Find top performing disability
        const disabilityStats = {};
        sessionData.forEach(session => {
            if (!disabilityStats[session.disability]) {
                disabilityStats[session.disability] = { count: 0, totalScore: 0 };
            }
            disabilityStats[session.disability].count++;
            disabilityStats[session.disability].totalScore += (session.consistency_score || 0);
        });

        let topDisability = 'No data';
        let topScore = 0;
        Object.entries(disabilityStats).forEach(([disability, stats]) => {
            const avgScore = stats.totalScore / stats.count;
            if (avgScore > topScore) {
                topScore = avgScore;
                topDisability = disability;
            }
        });

        // Analyze common mistakes from consistency validation
        const commonMistakes = this.analyzeCommonMistakes(sessionData);

        return {
            totalSessions,
            averageConsistency,
            averageAccuracy,
            improvementRate,
            topPerformingDisability: topDisability,
            commonMistakes
        };
    }

    // Analyze common mistakes from session data
    analyzeCommonMistakes(sessions) {
        const mistakeCounts = {};
        
        sessions.forEach(session => {
            if (session.consistencyResults && session.consistencyResults.recommendations) {
                session.consistencyResults.recommendations.forEach(rec => {
                    mistakeCounts[rec] = (mistakeCounts[rec] || 0) + 1;
                });
            }
        });

        // Sort by frequency and return top 5
        return Object.entries(mistakeCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([mistake]) => mistake);
    }

    // Clear all sessions
    clearAllSessions() {
        localStorage.removeItem(this.storageKey);
    }

    // Export sessions as JSON
    exportSessions() {
        const sessions = this.getAllSessions();
        const dataStr = JSON.stringify(sessions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        return dataBlob;
    }

    // Get current active session
    getCurrentSession() {
        const session = localStorage.getItem(this.currentSessionKey);
        return session ? JSON.parse(session) : null;
    }

    // Set current active session
    setCurrentSession(sessionData) {
        localStorage.setItem(this.currentSessionKey, JSON.stringify(sessionData));
    }

    // Clear current session
    clearCurrentSession() {
        localStorage.removeItem(this.currentSessionKey);
    }
}

// Create and export singleton instance
const sessionManager = new SessionManager();
export default sessionManager;
