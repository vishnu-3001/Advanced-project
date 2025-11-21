import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import classes from "./AdaptiveDifficulty.module.css";
import SessionManager from "../Utils/SessionManager";
import { runLangGraphWorkflow } from "../Utils/langgraphApi";

export default function AdaptiveDifficulty() {
    const [studentHistory, setStudentHistory] = useState([]);
    const [currentDifficulty, setCurrentDifficulty] = useState("medium");
    const [recommendation, setRecommendation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadStudentHistory();
        
        const handleStorageChange = (e) => {
            if (e.key === 'learningDisabilitySessions') {
                loadStudentHistory();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadStudentHistory();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function loadStudentHistory() {
        const realHistory = SessionManager.getAllSessions();
        setStudentHistory(realHistory);
    }


    async function getAdaptiveRecommendation() {
        setIsLoading(true);
        try {
            const gradeLevel = sessionStorage.getItem('gradeLevel') || '7th';
            const payload = {
                grade_level: gradeLevel,
                difficulty: currentDifficulty,
                disability: 'No disability',
                student_history: studentHistory,
                problem: sessionStorage.getItem('problem') || 'Placeholder problem for adaptive planning.',
            };

            const data = await runLangGraphWorkflow({
                ...payload,
                workflow_type: 'analysis_only',
            });
            const adaptivePlan = data?.results?.adaptive_plan;
            if (!adaptivePlan) {
                throw new Error('Adaptive plan missing from workflow results');
            }
            setRecommendation(adaptivePlan);
        } catch (error) {
            setRecommendation(generateMockRecommendation());
        } finally {
            setIsLoading(false);
        }
    }

    function generateMockRecommendation() {
        const recentSessions = studentHistory.slice(0, 5);
        if (recentSessions.length === 0) {
            return {
                recommended_difficulty: currentDifficulty,
                reasoning: "No session history yet. Stay at the current level until more data is collected.",
                confidence: 0.3,
                current_performance: {
                    consistency_score: 0,
                    accuracy_rate: 0,
                    trend: "insufficient_data"
                },
                recommendations: [
                    "Complete a few tutor sessions to unlock adaptive guidance"
                ]
            };
        }

        const avgConsistency = recentSessions.reduce((sum, s) => sum + (s.consistency_score || 0), 0) / recentSessions.length;
        const avgAccuracy = recentSessions.reduce((sum, s) => sum + (s.is_correct ? 1 : 0), 0) / recentSessions.length;

        let recommendedDifficulty = currentDifficulty;
        let reasoning = "Performance is appropriate for current level.";

        if (avgConsistency > 0.7 && avgAccuracy > 0.8) {
            recommendedDifficulty = currentDifficulty === "easy" ? "medium" : currentDifficulty === "medium" ? "hard" : "hard";
            reasoning = "Excellent performance! Ready for more challenging problems.";
        } else if (avgConsistency < 0.4 || avgAccuracy < 0.5) {
            recommendedDifficulty = currentDifficulty === "hard" ? "medium" : currentDifficulty === "medium" ? "easy" : "easy";
            reasoning = "Struggling with current level. Moving to easier problems.";
        }
        
        return {
            recommended_difficulty: recommendedDifficulty,
            reasoning,
            confidence: 0.8,
            current_performance: {
                consistency_score: avgConsistency,
                accuracy_rate: avgAccuracy,
                trend: "stable"
            },
            recommendations: [
                "Continue practicing regularly",
                "Focus on step-by-step problem solving",
                "Take breaks between sessions"
            ]
        };
    }


    function clearHistory() {
        SessionManager.clearAllSessions();
        setStudentHistory([]);
        setRecommendation(null);
    }

    function getDifficultyColor(difficulty) {
        switch (difficulty) {
            case 'easy': return classes.easy;
            case 'medium': return classes.medium;
            case 'hard': return classes.hard;
            default: return classes.medium;
        }
    }

    function getPerformanceColor(score) {
        if (score >= 0.7) return classes.high;
        if (score >= 0.4) return classes.medium;
        return classes.low;
    }

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <div className={classes.title}>
                    <div className={classes.icon}>🎯</div>
                    Adaptive Difficulty System
                </div>
                <p className={classes.subtitle}>
                    AI-powered difficulty adjustment based on student performance
                </p>
            </div>

            {/* Controls */}
            <div className={classes.controls}>
                <div className={classes.difficultySelector}>
                    <label>Current Difficulty:</label>
                    <select 
                        value={currentDifficulty} 
                        onChange={(e) => setCurrentDifficulty(e.target.value)}
                        className={classes.select}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                
                <div className={classes.actionButtons}>
                    <button 
                        className={classes.refreshBtn}
                        onClick={loadStudentHistory}
                    >
                        🔄 Refresh Data
                    </button>
                    
                    <button 
                        className={classes.analyzeBtn}
                        onClick={getAdaptiveRecommendation}
                        disabled={isLoading}
                    >
                        {isLoading ? '🔄 Analyzing...' : '🧠 Get AI Recommendation'}
                    </button>
                    
                    <button 
                        className={classes.clearBtn}
                        onClick={clearHistory}
                    >
                        🗑️ Clear History
                    </button>
                </div>
            </div>

            {/* Recommendation Display */}
            {recommendation && (
                <div className={classes.recommendationCard}>
                    <div className={classes.recommendationHeader}>
                        <h3>AI Recommendation</h3>
                    </div>
                    
                    <div className={classes.recommendationContent}>
                        <div className={classes.difficultyRecommendation}>
                            <div className={classes.currentDifficulty}>
                                <span className={classes.label}>Current:</span>
                                <span className={`${classes.difficultyBadge} ${getDifficultyColor(currentDifficulty)}`}>
                                    {currentDifficulty.toUpperCase()}
                                </span>
                            </div>
                            
                            <div className={classes.arrow}>→</div>
                            
                            <div className={classes.recommendedDifficulty}>
                                <span className={classes.label}>Recommended:</span>
                                <span className={`${classes.difficultyBadge} ${getDifficultyColor(recommendation.recommended_difficulty)}`}>
                                    {recommendation.recommended_difficulty.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <div className={classes.reasoning}>
                            <strong>Reasoning:</strong> {recommendation.reasoning}
                        </div>
                        
                        {recommendation.current_performance && (
                            <div className={classes.performanceMetrics}>
                                <div className={classes.metric}>
                                    <span className={classes.metricLabel}>Trend:</span>
                                    <span className={classes.metricValue}>
                                        {recommendation.current_performance.trend}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {recommendation.recommendations && (
                            <div className={classes.recommendations}>
                                <strong>Specific Recommendations:</strong>
                                <ul>
                                    {recommendation.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Session History */}
            <div className={classes.historySection}>
                <h3>Session History ({studentHistory.length} sessions)</h3>
                {studentHistory.length === 0 ? (
                    <div className={classes.emptyState}>
                        <div className={classes.emptyIcon}>📊</div>
                        <div className={classes.emptyTitle}>No Performance Data Yet</div>
                        <div className={classes.emptyText}>
                            Complete a student simulation to see adaptive difficulty analysis and performance insights.
                        </div>
                        <Link 
                            className={classes.simulateBtn}
                            to="/"
                        >
                            📚 Generate Math Problem
                        </Link>
                    </div>
                ) : (
                    <div className={classes.sessionsList}>
                        {studentHistory.slice(0, 10).map((session) => (
                        <div key={session.id} className={classes.sessionCard}>
                            <div className={classes.sessionHeader}>
                                <div className={classes.sessionInfo}>
                                    <div className={classes.sessionTitle}>
                                        {session.problem}
                                    </div>
                                    <div className={classes.sessionMeta}>
                                        {session.disability} • {new Date(session.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className={classes.sessionStats}>
                                    <span className={`${classes.difficultyBadge} ${getDifficultyColor(session.difficulty)}`}>
                                        {session.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* Removed result breakdown chart; show history only */}
        </div>
    );
}
// Removed result breakdown chart and correctness indicators; page focuses on session history only.
