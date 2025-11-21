import { useState, useEffect } from "react";
import classes from "./ProgressTracking.module.css";
import SessionManager from "../Utils/SessionManager";

export default function ProgressTracking() {
    const [sessions, setSessions] = useState([]);
    // const [currentSession, setCurrentSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        totalSessions: 0,
        averageConsistency: 0,
        improvementRate: 0,
        topPerformingDisability: '',
        commonMistakes: []
    });

    useEffect(() => {
        loadProgressData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function loadProgressData() {
        setIsLoading(true);
        try {
            // Load real session data from SessionManager
            const realSessions = SessionManager.getAllSessions();
            const realStats = SessionManager.calculatePerformanceMetrics(realSessions);
            
            setSessions(realSessions);
            setStats(realStats);
        } catch (error) {
            console.error("Failed to load progress data:", error);
            // Fallback to empty data if there's an error
            setSessions([]);
            setStats({
                totalSessions: 0,
                averageConsistency: 0,
                improvementRate: 0,
                topPerformingDisability: 'No data',
                commonMistakes: []
            });
        } finally {
            setIsLoading(false);
        }
    }

    function clearHistory() {
        SessionManager.clearAllSessions();
        setSessions([]);
        setStats({
            totalSessions: 0,
            averageConsistency: 0,
            improvementRate: 0,
            topPerformingDisability: 'No data',
            commonMistakes: []
        });
    }

    function exportData() {
        const dataBlob = SessionManager.exportSessions();
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `learning-sessions-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return `${minutes}m ago`;
    }

    function getConsistencyColor(score) {
        if (score >= 0.7) return classes.high;
        if (score >= 0.4) return classes.medium;
        return classes.low;
    }

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <div className={classes.title}>
                    <div className={classes.icon}>📊</div>
                    Progress Tracking Dashboard
                </div>
                <p className={classes.subtitle}>
                    Real-time analytics and performance insights
                </p>
            </div>

            {isLoading ? (
                <div className={classes.loading}>
                    <div className={classes.loadingSpinner}></div>
                    Loading progress data...
                </div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className={classes.statsGrid}>
                        <div className={classes.statCard}>
                            <div className={classes.statIcon}>📈</div>
                            <div className={classes.statContent}>
                                <div className={classes.statValue}>{stats.totalSessions}</div>
                                <div className={classes.statLabel}>Total Sessions</div>
                            </div>
                        </div>
                        
                        <div className={classes.statCard}>
                            <div className={classes.statIcon}>🎯</div>
                            <div className={classes.statContent}>
                                <div className={classes.statValue}>{(stats.averageConsistency * 100).toFixed(1)}%</div>
                                <div className={classes.statLabel}>Avg Consistency</div>
                            </div>
                        </div>
                        
                        <div className={classes.statCard}>
                            <div className={classes.statIcon}>📈</div>
                            <div className={classes.statContent}>
                                <div className={classes.statValue}>
                                    {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate.toFixed(1)}%
                                </div>
                                <div className={classes.statLabel}>Improvement Rate</div>
                            </div>
                        </div>
                        
                        <div className={classes.statCard}>
                            <div className={classes.statIcon}>🏆</div>
                            <div className={classes.statContent}>
                                <div className={classes.statValue}>{stats.topPerformingDisability}</div>
                                <div className={classes.statLabel}>Top Performer</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className={classes.sessionsSection}>
                        <h3 className={classes.sectionTitle}>Recent Sessions</h3>
                        <div className={classes.sessionsList}>
                            {sessions.slice(0, 10).map((session) => (
                                <div key={session.id} className={classes.sessionCard}>
                                    <div className={classes.sessionHeader}>
                                        <div className={classes.sessionInfo}>
                                            <div className={classes.disabilityName}>{session.disability}</div>
                                            <div className={classes.sessionTime}>{formatTimeAgo(session.timestamp)}</div>
                                        </div>
                                        <div className={classes.sessionStats}>
                                            <div className={`${classes.consistencyScore} ${getConsistencyColor(session.consistencyScore)}`}>
                                                {(session.consistencyScore * 100).toFixed(0)}%
                                            </div>
                                            <div className={classes.correctnessBadge}>
                                                {session.isCorrect ? '✅' : '❌'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={classes.sessionDetails}>
                                        <div className={classes.detailItem}>
                                            <span className={classes.detailLabel}>Duration:</span>
                                            <span className={classes.detailValue}>{Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                                        </div>
                                        <div className={classes.detailItem}>
                                            <span className={classes.detailLabel}>Attempts:</span>
                                            <span className={classes.detailValue}>{session.attempts}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Trends */}
                    <div className={classes.trendsSection}>
                        <h3 className={classes.sectionTitle}>Performance Trends</h3>
                        <div className={classes.trendsChart}>
                            <div className={classes.chartPlaceholder}>
                                <div className={classes.chartIcon}>📈</div>
                                <div className={classes.chartText}>Performance trend visualization</div>
                                <div className={classes.chartSubtext}>Shows consistency scores over time</div>
                            </div>
                        </div>
                    </div>

                    {/* Common Mistakes */}
                    {stats.commonMistakes.length > 0 && (
                        <div className={classes.mistakesSection}>
                            <h3 className={classes.sectionTitle}>Common Areas for Improvement</h3>
                            <div className={classes.mistakesList}>
                                {stats.commonMistakes.map((mistake, index) => (
                                    <div key={index} className={classes.mistakeItem}>
                                        <div className={classes.mistakeIcon}>⚠️</div>
                                        <div className={classes.mistakeText}>{mistake}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Export Options */}
                    <div className={classes.exportSection}>
                        <h3 className={classes.sectionTitle}>Export Data</h3>
                        <div className={classes.exportButtons}>
                            <button className={classes.exportBtn} onClick={exportData}>
                                📊 Export Analytics
                            </button>
                            <button className={classes.exportBtn} onClick={exportData}>
                                📄 Generate Report
                            </button>
                            <button className={classes.exportBtn} onClick={exportData}>
                                📈 Download Trends
                            </button>
                            <button className={classes.exportBtn} onClick={clearHistory}>
                                🗑️ Clear History
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
