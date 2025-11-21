import { useState } from "react";
import classes from "./LangGraphWorkflow.module.css";

export default function LangGraphWorkflow() {
    const [workflowData, setWorkflowData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState("");
    const [lastGeneratedProblem, setLastGeneratedProblem] = useState(null);

    // Form state
    const [gradeLevel, setGradeLevel] = useState("7th");
    const [difficulty, setDifficulty] = useState("medium");
    const [disability, setDisability] = useState("Dyslexia");
    const [workflowType, setWorkflowType] = useState("full");
    const [tutorSession, setTutorSession] = useState(null);
    const [isTutorLoading, setIsTutorLoading] = useState(false);
    const [tutorError, setTutorError] = useState(null);

    const disabilities = [
        "Dyslexia",
        "Dysgraphia", 
        "Dyscalculia",
        "Attention Deficit Hyperactivity Disorder",
        "Auditory Processing Disorder",
        "Non verbal Learning Disorder",
        "Language Processing Disorder"
    ];

    const workflowTypes = [
        { value: "problem_only", label: "Generate Problem Only" },
        { value: "full", label: "Full Student Simulation" },
        { value: "pre_tutor", label: "Up To Strategies (Pre-Tutor)" },
        { value: "analysis_only", label: "Analysis Only" }
    ];

    async function startTutorSession() {
        try {
            setIsTutorLoading(true);
            setTutorError(null);
            const gp = (workflowData?.results?.generated_problem) || null;
            const problemText = gp?.problem || '';
            const studentAttempt = workflowData?.results?.student_simulation || null;
            const thoughtAnalysis = workflowData?.results?.thought_analysis || null;
            if (!problemText || !studentAttempt) {
                throw new Error('Missing problem or student attempt for tutor session');
            }

            const resp = await fetch('http://localhost:8000/api/v1/openai/generate_tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    disability,
                    problem: problemText,
                    student_attempt: JSON.stringify(studentAttempt),
                    thought_analysis: JSON.stringify(thoughtAnalysis || {}),
                })
            });
            if (!resp.ok) {
                throw new Error(`Tutor session failed (${resp.status})`);
            }
            const data = await resp.json();
            setTutorSession(data);
        } catch (err) {
            setTutorError(err.message || 'Failed to start tutor session');
        } finally {
            setIsTutorLoading(false);
        }
    }

    async function runWorkflow() {
        setIsLoading(true);
        setError(null);
        setWorkflowData(null);
        setTutorSession(null);
        setCurrentStep("Starting workflow...");

        // If we have a previously generated problem, reuse it
        const existingProblem = lastGeneratedProblem;

        try {
            const response = await fetch('http://localhost:8000/api/v2/langgraph/workflow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grade_level: gradeLevel,
                    difficulty: difficulty,
                    disability: disability,
                    workflow_type: workflowType,
                    problem: existingProblem, // Reuse existing problem if available
                    metadata: workflowType === "problem_only" ? { refresh_problem: true } : undefined
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Workflow result:', data);
            console.log('Student simulation data:', data.results?.student_simulation);
            console.log('Steps field:', data.results?.student_simulation?.steps);
            
            setWorkflowData(data);
            setCurrentStep(data.current_step || "completed");
            
        } catch (err) {
            console.error('Error running workflow:', err);
            setError(`Failed to run workflow: ${err.message}`);
            setCurrentStep("error");
        } finally {
            setIsLoading(false);
        }
    }

    async function generateProblemOnly() {
        setIsLoading(true);
        setError(null);
        setWorkflowData(null);
        setCurrentStep("Generating problem...");

        try {
            const response = await fetch('http://localhost:8000/api/v2/langgraph/generate-problem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grade_level: gradeLevel,
                    difficulty: difficulty,
                    disability: disability,
                    workflow_type: "problem_only",
                    metadata: { refresh_problem: true }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Problem generated:', data);
            
            const problem = data.results.generated_problem;
            setWorkflowData({ results: { generated_problem: problem } });
            setLastGeneratedProblem(problem); // Store for reuse
            setCurrentStep("problem_generated");
            
        } catch (err) {
            console.error('Error generating problem:', err);
            setError(`Failed to generate problem: ${err.message}`);
            setCurrentStep("error");
        } finally {
            setIsLoading(false);
        }
    }

    function getStepIcon(step) {
        const stepIcons = {
            "initialized": "🚀",
            "problem_generated": "📚",
            "student_simulated": "👤",
            "thought_analyzed": "🧠",
            "strategies_generated": "💡",
            "tutor_simulated": "👨‍🏫",
            "consistency_validated": "✅",
            "adaptive_analyzed": "🎯",
            "completed": "🎉",
            "error": "❌"
        };
        return stepIcons[step] || "⏳";
    }

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <div className={classes.title}>
                    <div className={classes.icon}>🔄</div>
                    LangGraph Workflow Demo
                </div>
                <p className={classes.subtitle}>
                    Unified AI workflow for learning disability simulation
                </p>
            </div>

            {/* Controls */}
            <div className={classes.controls}>
                <div className={classes.controlGroup}>
                    <label htmlFor="gradeLevel">Grade Level:</label>
                    <select 
                        id="gradeLevel"
                        value={gradeLevel} 
                        onChange={(e) => setGradeLevel(e.target.value)}
                        className={classes.select}
                    >
                        <option value="2nd">2nd Grade</option>
                        <option value="5th">5th Grade</option>
                        <option value="7th">7th Grade</option>
                    </select>
                </div>

                <div className={classes.controlGroup}>
                    <label htmlFor="difficulty">Difficulty:</label>
                    <select 
                        id="difficulty"
                        value={difficulty} 
                        onChange={(e) => setDifficulty(e.target.value)}
                        className={classes.select}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div className={classes.controlGroup}>
                    <label htmlFor="disability">Disability:</label>
                    <select 
                        id="disability"
                        value={disability} 
                        onChange={(e) => setDisability(e.target.value)}
                        className={classes.select}
                    >
                        {disabilities.map(dis => (
                            <option key={dis} value={dis}>{dis}</option>
                        ))}
                    </select>
                </div>

                <div className={classes.controlGroup}>
                    <label htmlFor="workflowType">Workflow Type:</label>
                    <select 
                        id="workflowType"
                        value={workflowType} 
                        onChange={(e) => setWorkflowType(e.target.value)}
                        className={classes.select}
                    >
                        {workflowTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={classes.actions}>
                <button 
                    className={classes.primaryBtn}
                    onClick={runWorkflow}
                    disabled={isLoading}
                >
                    {isLoading ? '⏳' : '🔄'} Run Full Workflow
                    {lastGeneratedProblem && !isLoading && (
                        <span className={classes.reuseIndicator}> (will reuse existing problem)</span>
                    )}
                </button>
                
                <button 
                    className={classes.secondaryBtn}
                    onClick={generateProblemOnly}
                    disabled={isLoading}
                >
                    {isLoading ? '⏳' : '📚'} Generate Problem Only
                </button>
                
                {lastGeneratedProblem && (
                    <button 
                        className={classes.clearBtn}
                        onClick={() => {
                            setLastGeneratedProblem(null);
                            setWorkflowData(null);
                        }}
                        disabled={isLoading}
                    >
                        🗑️ Clear Problem
                    </button>
                )}
            </div>

            {/* Status */}
            {isLoading && (
                <div className={classes.status}>
                    <div className={classes.statusIcon}>{getStepIcon(currentStep)}</div>
                    <div className={classes.statusText}>{currentStep}</div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className={classes.error}>
                    <div className={classes.errorIcon}>❌</div>
                    <div className={classes.errorText}>{error}</div>
                </div>
            )}

            {/* Results Display */}
            {workflowData && !isLoading && (
                <div className={classes.results}>
                    <h3 className={classes.resultsTitle}>Workflow Results</h3>
                    
                    {/* Generated Problem */}
                    {workflowData.results?.generated_problem && (
                        <div className={classes.section}>
                            <h4 className={classes.sectionTitle}>📚 Generated Problem</h4>
                            <div className={classes.problemContent}>
                                <div className={classes.problemText}>
                                    {workflowData.results.generated_problem.problem}
                                </div>
                                <div className={classes.problemMeta}>
                                    <span className={classes.metaTag}>
                                        Grade: {workflowData.results.generated_problem.grade_level}
                                    </span>
                                    <span className={classes.metaTag}>
                                        Difficulty: {workflowData.results.generated_problem.difficulty}
                                    </span>
                                </div>
                                <details className={classes.solutionDetails}>
                                    <summary>View Solution</summary>
                                    <div className={classes.solutionContent}>
                                        <strong>Answer:</strong> {workflowData.results.generated_problem.answer}
                                        <br />
                                        <strong>Solution:</strong> {workflowData.results.generated_problem.solution}
                                    </div>
                                </details>
                            </div>
                        </div>
                    )}

                    {/* Student Simulation */}
                    {workflowData.results?.student_simulation && (
                        <div className={classes.section}>
                            <h4 className={classes.sectionTitle}>👤 Student Simulation</h4>
                            <div className={classes.simulationContent}>
                                <div className={classes.thoughtProcess}>
                                    <strong>Thought Process:</strong>
                                    <p>
                                        {workflowData.results.student_simulation.steps || 
                                         workflowData.results.student_simulation.thoughtprocess || 
                                         'No thought process available'}
                                    </p>
                                </div>
                                <div className={classes.steps}>
                                    <strong>Final Answer:</strong>
                                    <p><strong>{workflowData.results.student_simulation.final_answer || 'No answer provided'}</strong></p>
                                </div>
                                <div className={classes.disabilityImpact}>
                                    <strong>Disability Impact:</strong>
                                    <p>{workflowData.results.student_simulation.disability_impact || workflowData.results.thought_analysis?.disability_impact || 'No disability impact analysis available'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Thought Analysis */}
                    {workflowData.results?.thought_analysis && (
                        <div className={classes.section}>
                            <h4 className={classes.sectionTitle}>🧠 Thought Analysis</h4>
                            <div className={classes.analysisContent}>
                                <div className={classes.analysisText}>
                                    <strong>Cognitive Patterns:</strong>
                                    <p>{workflowData.results.thought_analysis.cognitive_patterns || 'No analysis available'}</p>
                                </div>
                                <div className={classes.mistakeAnalysis}>
                                    <strong>Error Analysis:</strong>
                                    <p>{workflowData.results.thought_analysis.error_analysis || 'No error analysis available'}</p>
                                </div>
                                <div className={classes.disabilityImpact}>
                                    <strong>Disability Impact:</strong>
                                    <p>{workflowData.results.thought_analysis.disability_impact || 'No disability impact analysis available'}</p>
                                </div>
                                {workflowData.results.thought_analysis.strengths && (
                                    <div className={classes.strengths}>
                                        <strong>Strengths:</strong>
                                        <p>{workflowData.results.thought_analysis.strengths}</p>
                                    </div>
                                )}
                                {workflowData.results.thought_analysis.growth_areas && (
                                    <div className={classes.growthAreas}>
                                        <strong>Growth Areas:</strong>
                                        <p>{workflowData.results.thought_analysis.growth_areas}</p>
                                    </div>
                                )}
                                {workflowData.results.thought_analysis.confidence_level && (
                                    <div className={classes.confidenceLevel}>
                                        <strong>Confidence Level:</strong>
                                        <p>{workflowData.results.thought_analysis.confidence_level}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Teaching Strategies */}
                    {workflowData.results?.teaching_strategies && (
                        <div className={classes.section}>
                            <h4 className={classes.sectionTitle}>💡 Teaching Strategies</h4>
                            <div className={classes.strategiesContent}>
                                <div className={classes.strategyGroup}>
                                    <strong>Primary Strategies:</strong>
                                    <ul>
                                        {workflowData.results.teaching_strategies.primary_strategies?.map((strategy, index) => (
                                            <li key={index}>
                                                <strong>{strategy.name}:</strong> {strategy.description}
                                                <br />
                                                <em>Rationale:</em> {strategy.rationale}
                                                {strategy.implementation && (
                                                    <div>
                                                        <strong>Implementation:</strong>
                                                        <ol>
                                                            {strategy.implementation.map((step, stepIndex) => (
                                                                <li key={stepIndex}>{step}</li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                )}
                                            </li>
                                        )) || <li>No strategies available</li>}
                                    </ul>
                                </div>
                                <div className={classes.strategyGroup}>
                                    <strong>Accommodations:</strong>
                                    <ul>
                                        {workflowData.results.teaching_strategies.accommodations?.map((accommodation, index) => (
                                            <li key={index}>{accommodation}</li>
                                        )) || <li>No accommodations available</li>}
                                    </ul>
                                </div>
                                {workflowData.results.teaching_strategies.alternative_approaches && (
                                    <div className={classes.strategyGroup}>
                                        <strong>Alternative Approaches:</strong>
                                        <ul>
                                            {workflowData.results.teaching_strategies.alternative_approaches.map((approach, index) => (
                                                <li key={index}>
                                                    <strong>{approach.name}:</strong> {approach.description}
                                                    {approach.when_to_use && (
                                                        <div><em>When to use:</em> {approach.when_to_use}</div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {workflowData.results.teaching_strategies.scaffolding_sequence && (
                                    <div className={classes.strategyGroup}>
                                        <strong>Scaffolding Sequence:</strong>
                                        <ol>
                                            {workflowData.results.teaching_strategies.scaffolding_sequence.map((step, index) => (
                                                <li key={index}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                                {workflowData.results.teaching_strategies.assessment_methods && (
                                    <div className={classes.strategyGroup}>
                                        <strong>Assessment Methods:</strong>
                                        <ul>
                                            {workflowData.results.teaching_strategies.assessment_methods.map((method, index) => (
                                                <li key={index}>{method}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {(workflowType === 'pre_tutor' || !workflowData.results?.tutor_session) && (
                                    <div className={classes.tutorCta}>
                                        <button
                                            className={classes.primaryBtn}
                                            onClick={startTutorSession}
                                            disabled={isTutorLoading}
                                        >
                                            {isTutorLoading ? '⏳' : '👨‍🏫'} Start Tutor Session
                                        </button>
                                        {tutorError && (
                                            <div className={classes.error} style={{ marginTop: 8 }}>
                                                <div className={classes.errorIcon}>❌</div>
                                                <div className={classes.errorText}>{tutorError}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tutor Session (on-demand) */}
                    {tutorSession && (
                        <div className={classes.section}>
                            <h4 className={classes.sectionTitle}>👨‍🏫 Tutor Session</h4>
                            <div className={classes.conversation}>
                                {tutorSession.conversation?.map((turn, idx) => (
                                    <div key={idx} className={turn.speaker === 'Tutor' ? classes.tutorTurn : classes.studentTurn}>
                                        <div className={classes.speaker}><strong>{turn.speaker}:</strong></div>
                                        <div>{turn.text}</div>
                                        <div className={classes.meta}>
                                            {turn.strategy && <em>Strategy: {turn.strategy}</em>}
                                            {turn.emotion && <em> Emotion: {turn.emotion}</em>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {tutorSession.test_question && (
                                <div className={classes.quickCheck}>
                                    <strong>Quick Check:</strong> {tutorSession.test_question}
                                    <div><em>Expected:</em> {tutorSession.expected_answer}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

async function startTutorSession() {
    this.setState?.(); // no-op for bundlers; function defined within component below
}
