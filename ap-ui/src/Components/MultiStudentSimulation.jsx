import { useState, useEffect } from "react";
import classes from "./MultiStudentSimulation.module.css";
import { getOrRunFullWorkflow } from "../Utils/langgraphApi";

export default function MultiStudentSimulation() {
    const [problem, setProblem] = useState('');
    const [expectedAnswer, setExpectedAnswer] = useState('');
    const [simulations, setSimulations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const gradeLevel = sessionStorage.getItem('gradeLevel') || '7th';
    const difficulty = sessionStorage.getItem('difficulty') || 'medium';

    const disabilities = [
        { id: 0, name: "No disability", color: "#10b981" },
        { id: 1, name: "Dyslexia", color: "#3b82f6" },
        { id: 2, name: "Dysgraphia", color: "#8b5cf6" },
        { id: 3, name: "Dyscalculia", color: "#f59e0b" },
        { id: 4, name: "ADHD", color: "#ef4444" },
        { id: 5, name: "APD", color: "#06b6d4" },
        { id: 6, name: "NVLD", color: "#84cc16" },
        { id: 7, name: "LPD", color: "#f97316" }
    ];

    useEffect(() => {
        // Get problem from session storage
        const storedProblem = sessionStorage.getItem('problem');
        const storedAnswer = sessionStorage.getItem('answer');
        if (storedProblem && storedAnswer) {
            setProblem(storedProblem);
            setExpectedAnswer(storedAnswer);
        }
    }, []);

    async function runMultiStudentSimulation() {
        if (!problem) {
            setError("Please generate a problem first");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSimulations([]);
        setComparisonData(null);

        try {
            const simulationPromises = disabilities.map(async (disability) => {
                try {
                    // Run student attempt
                    const analysis = await getOrRunFullWorkflow({
                        grade_level: gradeLevel,
                        difficulty,
                        disability: disability.name,
                        problem,
                    });

                    const attemptData = analysis?.results?.student_simulation;
                    const consistencyData = analysis?.results?.consistency_validation || analysis?.results?.consistency_report;

                    if (!attemptData) {
                        throw new Error(`Missing student simulation for ${disability.name}`);
                    }

                    return {
                        disability,
                        attempt: attemptData,
                        consistency: consistencyData,
                        timestamp: new Date().toISOString(),
                        cache: analysis?.metadata?.cache_status || {},
                    };
                } catch (err) {
                    console.error(`Error simulating ${disability.name}:`, err);
                    return {
                        disability,
                        error: err.message,
                        timestamp: new Date().toISOString()
                    };
                }
            });

            const results = await Promise.all(simulationPromises);
            setSimulations(results);

            // Generate comparison data
            generateComparisonData(results);

        } catch (err) {
            setError(`Simulation failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    function generateComparisonData(simResults) {
        const validResults = simResults.filter(r => !r.error);
        
        const comparison = {
            totalSimulations: simResults.length,
            successfulSimulations: validResults.length,
            averageConsistencyScore: 0,
            answerAccuracy: {},
            disabilityInsights: {},
            commonMistakes: [],
            performanceRanking: []
        };

        if (validResults.length > 0) {
            // Calculate average consistency score
            const consistencyScores = validResults
                .map(r => r.consistency?.overall_consistency_score || 0)
                .filter(score => score > 0);
            comparison.averageConsistencyScore = consistencyScores.length > 0 
                ? consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length 
                : 0;

            // Analyze answer accuracy
            validResults.forEach(result => {
                const studentAnswer = extractFinalAnswer(result.attempt);
                const isCorrect = normalizeAnswer(studentAnswer) === normalizeAnswer(expectedAnswer);
                comparison.answerAccuracy[result.disability.name] = {
                    correct: isCorrect,
                    studentAnswer,
                    expectedAnswer
                };
            });

            // Generate disability insights
            validResults.forEach(result => {
                const consistency = result.consistency;
                if (consistency) {
                    comparison.disabilityInsights[result.disability.name] = {
                        consistencyScore: consistency.overall_consistency_score,
                        strengths: consistency.checks?.disability_behavior?.expected_found || [],
                        challenges: consistency.checks?.disability_behavior?.unexpected_found || [],
                        recommendations: consistency.recommendations || []
                    };
                }
            });

            // Performance ranking
            comparison.performanceRanking = validResults
                .map(result => ({
                    disability: result.disability.name,
                    consistencyScore: result.consistency?.overall_consistency_score || 0,
                    isCorrect: comparison.answerAccuracy[result.disability.name]?.correct || false
                }))
                .sort((a, b) => b.consistencyScore - a.consistencyScore);
        }

        setComparisonData(comparison);
    }

    function extractFinalAnswer(attempt) {
        if (!attempt) return "";
        if (attempt.final_answer) return String(attempt.final_answer).trim();
        if (attempt.answer) return String(attempt.answer).trim();
        return "";
    }

    function normalizeAnswer(ans) {
        if (ans == null) return "";
        const s = String(ans).trim().toLowerCase();
        const num = Number(s.replace(/[^0-9.-]/g, ''));
        if (!Number.isNaN(num)) return String(num);
        return s;
    }

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <div className={classes.title}>
                    <div className={classes.icon}>👥</div>
                    Multi-Student Simulation
                </div>
                <p className={classes.subtitle}>
                    Compare how different learning disabilities affect problem-solving approaches
                </p>
            </div>

            {!problem && (
                <div className={classes.noProblem}>
                    <div className={classes.noProblemIcon}>📚</div>
                    <h3>No Problem Generated</h3>
                    <p>Please generate a math problem first to run the multi-student simulation.</p>
                </div>
            )}

            {problem && (
                <>
                    <div className={classes.problemSection}>
                        <div className={classes.problemTitle}>Problem Statement</div>
                        <div className={classes.problemText}>{problem}</div>
                        <div className={classes.expectedAnswer}>Expected Answer: {expectedAnswer}</div>
                    </div>

                    <div className={classes.controls}>
                        <button 
                            className={classes.runSimulationBtn}
                            onClick={runMultiStudentSimulation}
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳' : '🚀'} Run Multi-Student Simulation
                        </button>
                    </div>

                    {isLoading && (
                        <div className={classes.loading}>
                            <div className={classes.loadingSpinner}></div>
                            <div>Running simulations for all disabilities...</div>
                        </div>
                    )}

                    {error && (
                        <div className={classes.error}>
                            {error}
                        </div>
                    )}

                    {simulations.length > 0 && (
                        <div className={classes.results}>
                            <div className={classes.resultsHeader}>
                                <h3>Simulation Results</h3>
                                <div className={classes.resultsStats}>
                                    {comparisonData && (
                                        <div className={classes.statCard}>
                                            <div className={classes.statValue}>
                                                {(comparisonData.averageConsistencyScore * 100).toFixed(1)}%
                                            </div>
                                            <div className={classes.statLabel}>Avg Consistency</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={classes.simulationsGrid}>
                                {simulations.map((sim, index) => (
                                    <div key={index} className={classes.simulationCard}>
                                        <div 
                                            className={classes.cardHeader}
                                            style={{ borderLeftColor: sim.disability.color }}
                                        >
                                            <div className={classes.disabilityName}>
                                                {sim.disability.name}
                                            </div>
                                            {sim.consistency && (
                                                <div className={classes.consistencyBadge}>
                                                    {(sim.consistency.overall_consistency_score * 100).toFixed(0)}%
                                                </div>
                                            )}
                                        </div>

                                        {sim.error ? (
                                            <div className={classes.errorMessage}>
                                                Error: {sim.error}
                                            </div>
                                        ) : (
                                            <div className={classes.cardContent}>
                                                <div className={classes.answerSection}>
                                                    <div className={classes.answerLabel}>Student Answer:</div>
                                                    <div className={classes.answerValue}>
                                                        {extractFinalAnswer(sim.attempt)}
                                                    </div>
                                                    {comparisonData?.answerAccuracy[sim.disability.name] && (
                                                        <div className={`${classes.correctnessBadge} ${
                                                            comparisonData.answerAccuracy[sim.disability.name].correct 
                                                                ? classes.correct : classes.incorrect
                                                        }`}>
                                                            {comparisonData.answerAccuracy[sim.disability.name].correct ? '✅' : '❌'}
                                                        </div>
                                                    )}
                                                </div>

                                                {sim.consistency && (
                                                    <div className={classes.consistencyDetails}>
                                                        <div className={classes.consistencyChecks}>
                                                            {Object.entries(sim.consistency.checks || {}).map(([checkName, check]) => (
                                                                <div key={checkName} className={classes.checkItem}>
                                                                    <span className={classes.checkName}>
                                                                        {checkName.replace(/_/g, ' ')}
                                                                    </span>
                                                                    <span className={`${classes.checkScore} ${
                                                                        check.score > 0.7 ? classes.high : 
                                                                        check.score > 0.4 ? classes.medium : classes.low
                                                                    }`}>
                                                                        {(check.score * 100).toFixed(0)}%
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <details className={classes.detailsSection}>
                                                    <summary>View Student Work</summary>
                                                    <div className={classes.studentWork}>
                                                        {sim.attempt?.steps_to_solve?.map((step, stepIndex) => (
                                                            <div key={stepIndex} className={classes.stepItem}>
                                                                <div className={classes.stepNumber}>{stepIndex + 1}</div>
                                                                <div className={classes.stepText}>{step}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {comparisonData && (
                                <div className={classes.comparisonSection}>
                                    <h3>Comparative Analysis</h3>
                                    
                                    <div className={classes.performanceRanking}>
                                        <h4>Performance Ranking</h4>
                                        <div className={classes.rankingList}>
                                            {comparisonData.performanceRanking.map((item, index) => (
                                                <div key={index} className={classes.rankingItem}>
                                                    <div className={classes.rankNumber}>{index + 1}</div>
                                                    <div className={classes.rankDisability}>{item.disability}</div>
                                                    <div className={classes.rankScore}>
                                                        {(item.consistencyScore * 100).toFixed(0)}%
                                                    </div>
                                                    <div className={classes.rankCorrect}>
                                                        {item.isCorrect ? '✅' : '❌'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
