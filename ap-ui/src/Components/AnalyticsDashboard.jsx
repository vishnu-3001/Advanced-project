import { useState, useEffect } from "react";
import classes from "./AnalyticsDashboard.module.css";
import SessionManager from "../Utils/SessionManager";

export default function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedStudent, setSelectedStudent] = useState('all');
    const [realTimeData, setRealTimeData] = useState({
        activeUsers: 0,
        problemsSolved: 0,
        averageTime: 0,
        successRate: 0
    });
    const [sessions, setSessions] = useState([]); // Used for analytics calculations
    const [isLoading, setIsLoading] = useState(true);

    const [students, setStudents] = useState([]);

    const timeRanges = [
        { id: '1h', name: 'Last Hour', icon: '⏰' },
        { id: '24h', name: 'Last 24 Hours', icon: '📅' },
        { id: '7d', name: 'Last 7 Days', icon: '📊' },
        { id: '30d', name: 'Last 30 Days', icon: '📈' }
    ];

    useEffect(() => {
        loadAnalytics();
        
        // Simulate real-time data updates
        const interval = setInterval(() => {
            setRealTimeData(prev => ({
                activeUsers: Math.floor(Math.random() * 50) + 20,
                problemsSolved: prev.problemsSolved + Math.floor(Math.random() * 3),
                averageTime: Math.floor(Math.random() * 10) + 5,
                successRate: Math.floor(Math.random() * 20) + 75
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, [timeRange, selectedStudent]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            // Load real session data
            const allSessions = SessionManager.getAllSessions() || [];
            setSessions(allSessions);
            
            // Extract unique students from sessions
            const uniqueStudents = [...new Set(allSessions.map(session => session.studentName || 'Anonymous'))];
            const studentList = uniqueStudents.map((name, index) => ({
                id: `student${index + 1}`,
                name: name,
                avatar: index % 2 === 0 ? '👨‍🎓' : '👩‍🎓'
            }));
            setStudents([{ id: 'all', name: 'All Students', avatar: '👥' }, ...studentList]);

            // Calculate real analytics from session data
            const performanceMetrics = SessionManager.calculatePerformanceMetrics(allSessions);
            
            const analytics = {
                performance: {
                    totalProblems: allSessions.length,
                    correctAnswers: allSessions.filter(s => s.correctAnswer === s.studentAnswer).length,
                    averageScore: performanceMetrics.averageScore,
                    improvement: performanceMetrics.improvement
                },
                engagement: {
                    sessionDuration: performanceMetrics.averageSessionTime,
                    problemsPerSession: performanceMetrics.averageProblemsPerSession,
                    returnRate: performanceMetrics.returnRate,
                    peakHours: ['2:00 PM', '4:00 PM', '7:00 PM'] // Could be calculated from timestamps
                },
                learning: {
                    topicsMastered: performanceMetrics.topicsMastered,
                    skillsDeveloped: performanceMetrics.skillsDeveloped,
                    weakAreas: performanceMetrics.weakAreas,
                    strongAreas: performanceMetrics.strongAreas
                },
                collaboration: {
                    peerInteractions: allSessions.filter(s => s.collaborationMode).length,
                    groupSessions: allSessions.filter(s => s.sessionType === 'group').length,
                    sharedSolutions: allSessions.filter(s => s.shared).length,
                    feedbackGiven: allSessions.reduce((sum, s) => sum + (s.feedbackCount || 0), 0)
                },
                aiInsights: {
                    difficultyAdaptation: performanceMetrics.difficultyAdaptation,
                    personalizedRecommendations: performanceMetrics.personalizedRecommendations,
                    learningPathOptimization: performanceMetrics.learningPathOptimization,
                    errorPatternAnalysis: performanceMetrics.errorPatternAnalysis
                }
            };
            
            setAnalytics(analytics);
        } catch (error) {
            console.error('Error loading analytics:', error);
            // Fallback to empty state
            setAnalytics({
                performance: { totalProblems: 0, correctAnswers: 0, averageScore: 0, improvement: 0 },
                engagement: { sessionDuration: 0, problemsPerSession: 0, returnRate: 0, peakHours: [] },
                learning: { topicsMastered: 0, skillsDeveloped: 0, weakAreas: [], strongAreas: [] },
                collaboration: { peerInteractions: 0, groupSessions: 0, sharedSolutions: 0, feedbackGiven: 0 },
                aiInsights: { difficultyAdaptation: 0, personalizedRecommendations: 0, learningPathOptimization: 0, errorPatternAnalysis: 0 }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getPerformanceColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 70) return '#f59e0b';
        return '#ef4444';
    };

    const getImprovementIcon = (value) => {
        return value > 0 ? '📈' : value < 0 ? '📉' : '➡️';
    };

    const generateInsights = () => {
        if (!analytics || !analytics.performance || !analytics.learning || !analytics.aiInsights || !analytics.engagement) {
            return [];
        }
        
        return [
            {
                type: 'success',
                title: 'Excellent Progress!',
                message: `Student performance improved by ${analytics.performance.improvement || 0}% this week`,
                icon: '🎉'
            },
            {
                type: 'warning',
                title: 'Focus Area Identified',
                message: `Consider additional practice in ${(analytics.learning.weakAreas || []).join(', ') || 'general math concepts'}`,
                icon: '⚠️'
            },
            {
                type: 'info',
                title: 'AI Optimization',
                message: `Difficulty adaptation is ${analytics.aiInsights.difficultyAdaptation || 0}% effective`,
                icon: '🤖'
            },
            {
                type: 'success',
                title: 'High Engagement',
                message: `${analytics.engagement.returnRate || 0}% of students return for more sessions`,
                icon: '💪'
            }
        ];
    };

    const exportReport = () => {
        const reportData = {
            timestamp: new Date().toISOString(),
            timeRange,
            selectedStudent,
            analytics,
            realTimeData
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-report-${timeRange}.json`;
        link.click();
    };

    if (isLoading || !analytics) {
        return (
            <div className={classes.loading}>
                <div className={classes.spinner}></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    // Safety check for analytics object structure
    if (!analytics.performance || !analytics.learning || !analytics.aiInsights) {
        return (
            <div className={classes.loading}>
                <div className={classes.spinner}></div>
                <p>Loading analytics data...</p>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <h2>📊 Real-Time Analytics Dashboard</h2>
                <div className={classes.headerControls}>
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className={classes.timeSelect}
                    >
                        {timeRanges.map(range => (
                            <option key={range.id} value={range.id}>
                                {range.icon} {range.name}
                            </option>
                        ))}
                    </select>
                    <select 
                        value={selectedStudent} 
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className={classes.studentSelect}
                    >
                        {students?.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.avatar} {student.name}
                            </option>
                        )) || []}
                    </select>
                    <button className={classes.exportBtn} onClick={exportReport}>
                        📥 Export Report
                    </button>
                </div>
            </div>

            {/* Real-time metrics */}
            <div className={classes.realTimeMetrics}>
                <h3>⚡ Live Metrics</h3>
                <div className={classes.metricsGrid}>
                    <div className={classes.metricCard}>
                        <div className={classes.metricIcon}>👥</div>
                        <div className={classes.metricContent}>
                            <div className={classes.metricValue}>{realTimeData.activeUsers}</div>
                            <div className={classes.metricLabel}>Active Users</div>
                        </div>
                        <div className={classes.metricTrend}>+12%</div>
                    </div>
                    <div className={classes.metricCard}>
                        <div className={classes.metricIcon}>✅</div>
                        <div className={classes.metricContent}>
                            <div className={classes.metricValue}>{realTimeData.problemsSolved}</div>
                            <div className={classes.metricLabel}>Problems Solved</div>
                        </div>
                        <div className={classes.metricTrend}>+8%</div>
                    </div>
                    <div className={classes.metricCard}>
                        <div className={classes.metricIcon}>⏱️</div>
                        <div className={classes.metricContent}>
                            <div className={classes.metricValue}>{realTimeData.averageTime}m</div>
                            <div className={classes.metricLabel}>Avg. Time</div>
                        </div>
                        <div className={classes.metricTrend}>-5%</div>
                    </div>
                    <div className={classes.metricCard}>
                        <div className={classes.metricIcon}>🎯</div>
                        <div className={classes.metricContent}>
                            <div className={classes.metricValue}>{realTimeData.successRate}%</div>
                            <div className={classes.metricLabel}>Success Rate</div>
                        </div>
                        <div className={classes.metricTrend}>+3%</div>
                    </div>
                </div>
            </div>

            {/* Performance Overview */}
            <div className={classes.section}>
                <h3>📈 Performance Overview</h3>
                <div className={classes.performanceGrid}>
                    <div className={classes.performanceCard}>
                        <div className={classes.cardHeader}>
                            <h4>Overall Score</h4>
                            <span className={classes.scoreIcon}>🎯</span>
                        </div>
                        <div 
                            className={classes.scoreValue}
                            style={{ color: getPerformanceColor(analytics.performance.averageScore) }}
                        >
                            {analytics.performance.averageScore}%
                        </div>
                        <div className={classes.scoreChange}>
                            {getImprovementIcon(analytics.performance.improvement)} 
                            {analytics.performance.improvement}% vs last period
                        </div>
                    </div>
                    <div className={classes.performanceCard}>
                        <div className={classes.cardHeader}>
                            <h4>Problems Solved</h4>
                            <span className={classes.scoreIcon}>📚</span>
                        </div>
                        <div className={classes.scoreValue}>{analytics.performance.totalProblems}</div>
                        <div className={classes.scoreChange}>
                            {analytics.performance.correctAnswers} correct answers
                        </div>
                    </div>
                    <div className={classes.performanceCard}>
                        <div className={classes.cardHeader}>
                            <h4>Accuracy Rate</h4>
                            <span className={classes.scoreIcon}>🎯</span>
                        </div>
                        <div className={classes.scoreValue}>
                            {Math.round((analytics.performance.correctAnswers / analytics.performance.totalProblems) * 100)}%
                        </div>
                        <div className={classes.scoreChange}>
                            Consistent performance
                        </div>
                    </div>
                </div>
            </div>

            {/* Learning Analytics */}
            <div className={classes.section}>
                <h3>🧠 Learning Analytics</h3>
                <div className={classes.learningGrid}>
                    <div className={classes.learningCard}>
                        <h4>📚 Topics Mastered</h4>
                        <div className={classes.topicProgress}>
                            <div className={classes.topicItem}>
                                <span>Algebra</span>
                                <div className={classes.progressBar}>
                                    <div className={classes.progressFill} style={{ width: '85%' }}></div>
                                </div>
                                <span>85%</span>
                            </div>
                            <div className={classes.topicItem}>
                                <span>Geometry</span>
                                <div className={classes.progressBar}>
                                    <div className={classes.progressFill} style={{ width: '92%' }}></div>
                                </div>
                                <span>92%</span>
                            </div>
                            <div className={classes.topicItem}>
                                <span>Statistics</span>
                                <div className={classes.progressBar}>
                                    <div className={classes.progressFill} style={{ width: '78%' }}></div>
                                </div>
                                <span>78%</span>
                            </div>
                        </div>
                    </div>
                    <div className={classes.learningCard}>
                        <h4>💪 Strong Areas</h4>
                        <div className={classes.areaList}>
                            {analytics.learning.strongAreas?.map((area, index) => (
                                <div key={index} className={classes.areaItem}>
                                    <span className={classes.areaIcon}>✅</span>
                                    <span>{area}</span>
                                </div>
                            )) || []}
                        </div>
                    </div>
                    <div className={classes.learningCard}>
                        <h4>⚠️ Areas for Improvement</h4>
                        <div className={classes.areaList}>
                            {analytics.learning.weakAreas?.map((area, index) => (
                                <div key={index} className={classes.areaItem}>
                                    <span className={classes.areaIcon}>⚠️</span>
                                    <span>{area}</span>
                                </div>
                            )) || []}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div className={classes.section}>
                <h3>🤖 AI-Powered Insights</h3>
                <div className={classes.aiGrid}>
                    <div className={classes.aiCard}>
                        <div className={classes.aiIcon}>🎯</div>
                        <div className={classes.aiContent}>
                            <h4>Difficulty Adaptation</h4>
                            <div className={classes.aiValue}>{analytics.aiInsights.difficultyAdaptation}%</div>
                            <p>AI successfully adjusts problem difficulty based on student performance</p>
                        </div>
                    </div>
                    <div className={classes.aiCard}>
                        <div className={classes.aiIcon}>📊</div>
                        <div className={classes.aiContent}>
                            <h4>Error Pattern Analysis</h4>
                            <div className={classes.aiValue}>{analytics.aiInsights.errorPatternAnalysis}%</div>
                            <p>AI identifies and addresses common mistake patterns</p>
                        </div>
                    </div>
                    <div className={classes.aiCard}>
                        <div className={classes.aiIcon}>🛤️</div>
                        <div className={classes.aiContent}>
                            <h4>Learning Path Optimization</h4>
                            <div className={classes.aiValue}>{analytics.aiInsights.learningPathOptimization}%</div>
                            <p>AI optimizes individual learning paths for maximum efficiency</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights and Recommendations */}
            <div className={classes.section}>
                <h3>💡 Insights & Recommendations</h3>
                <div className={classes.insightsGrid}>
                    {generateInsights()?.map((insight, index) => (
                        <div key={index} className={`${classes.insightCard} ${classes[insight.type]}`}>
                            <div className={classes.insightIcon}>{insight.icon}</div>
                            <div className={classes.insightContent}>
                                <h4>{insight.title}</h4>
                                <p>{insight.message}</p>
                            </div>
                        </div>
                    )) || []}
                </div>
            </div>
        </div>
    );
}
