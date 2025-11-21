import { useEffect, useContext, useState } from "react";
import UserContext from "../Store/UserContext";
import classes from "./Problem.module.css";
import { generateLangGraphProblem } from "../Utils/langgraphApi";

export default function Problem(){
    const userCtx = useContext(UserContext);
    const [problem, setProblem] = useState('');
    const [answer, setAnswer] = useState('');
    const [approach, setApproach] = useState('');
    const [gradeLevel, setGradeLevel] = useState('7th');
    const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
    const [concepts, setConcepts] = useState([]);
    const [difficulty, setDifficulty] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        generateProblem();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    async function generateProblem(){
        setIsLoading(true);
        setError(null);
        try{
            const problemData = await generateLangGraphProblem({
                grade_level: gradeLevel,
                difficulty: selectedDifficulty,
            });

            if (!problemData || !problemData.problem) {
                throw new Error("Problem generation returned empty data");
            }

            userCtx.setGeneratedProblem(problemData.problem);
            userCtx.setAnswer(problemData.answer);
            userCtx.setApproach(problemData.solution);

            sessionStorage.setItem("problem", problemData.problem);
            sessionStorage.setItem("answer", problemData.answer || "");
            sessionStorage.setItem("approach", problemData.solution || "");
            // Persist full problem JSON so downstream flows (Tutor/consistency)
            // can access the canonical expected answer reliably.
            try {
                sessionStorage.setItem("problem_json", JSON.stringify(problemData));
            } catch (e) {
                // Non-fatal: fallback keys above still allow basic flow.
            }
            sessionStorage.setItem("difficulty", selectedDifficulty);
            sessionStorage.setItem("gradeLevel", gradeLevel);

            setProblem(problemData.problem);
            setAnswer(problemData.answer || "");
            setApproach(problemData.solution || "");
            setConcepts(problemData.concepts || []);
            setDifficulty(problemData.difficulty || selectedDifficulty);
        } catch(error) {
            setError(`Failed to generate problem: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <div className={classes.problemContainer}>
            <div className={classes.header}>
                <div className={classes.title}>
                    <div className={classes.icon}>📚</div>
                    Math Problem Generator
                </div>
                <div className={classes.ctaText}>
                    <div className={classes.ctaTitle}>🎯 Start Here: Generate Your Math Problem</div>
                    <div className={classes.ctaDescription}>
                        <strong>Step 1:</strong> Generate a math problem, then select a learning disability to see how students with different needs would approach it.
                    </div>
                    <div className={classes.ctaSteps}>
                        <div className={classes.step}>1️⃣ Generate Problem</div>
                        <div className={classes.arrow}>→</div>
                        <div className={classes.step}>2️⃣ Select Disability</div>
                        <div className={classes.arrow}>→</div>
                        <div className={classes.step}>3️⃣ View Simulation</div>
                        <div className={classes.arrow}>→</div>
                        <div className={classes.step}>4️⃣ See Analysis</div>
                    </div>
                </div>
                <div className={classes.controls}>
                    <div className={classes.gradeSelector}>
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
                    <div className={classes.gradeSelector}>
                        <label htmlFor="difficulty">Difficulty:</label>
                        <select 
                            id="difficulty"
                            value={selectedDifficulty} 
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className={classes.select}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <button 
                        className={classes.refreshBtn} 
                        onClick={generateProblem}
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳' : '🔄'} Generate New Problem
                    </button>
                </div>
            </div>
            
            {isLoading && (
                <div className={classes.loading}>
                    Generating a new math problem...
                </div>
            )}
            
            {error && (
                <div className={classes.error}>
                    {error}
                </div>
            )}
            
            {!isLoading && problem && (
                <>
                    <div className={classes.section}>
                        <div className={classes.sectionTitle}>Problem Statement</div>
                        <div className={classes.sectionContent}>{problem}</div>
                        <div className={classes.metaInfo}>
                            <span className={classes.gradeLevel}>Grade: {gradeLevel}</span>
                            {difficulty && <span className={classes.difficulty}>Difficulty: {difficulty}</span>}
                        </div>
                    </div>
                    
                    {concepts.length > 0 && (
                        <div className={classes.section}>
                            <div className={classes.sectionTitle}>Math Concepts</div>
                            <div className={classes.conceptsList}>
                                {concepts.map((concept, index) => (
                                    <span key={index} className={classes.conceptTag}>
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <details className={classes.section}>
                        <summary className={classes.sectionTitle}>Reveal Correct Answer</summary>
                        <div className={classes.sectionContent}>{answer}</div>
                    </details>
                    
                    <details className={classes.section}>
                        <summary className={classes.sectionTitle}>Reveal Solution Approach</summary>
                        <div className={classes.solutionSteps}>
                            {approach.split('\n').map((step, index) => {
                                // Clean up the step and check if it's a numbered step
                                const cleanStep = step.trim();
                                if (cleanStep && (cleanStep.match(/^\d+\./) || cleanStep.match(/^Step \d+/i))) {
                                    return (
                                        <div key={index} className={classes.step}>
                                            <div className={classes.stepNumber}>{index + 1}</div>
                                            <div className={classes.stepContent}>
                                                {cleanStep.replace(/^\d+\.\s*/, '').replace(/^Step \d+:\s*/i, '')}
                                            </div>
                                        </div>
                                    );
                                } else if (cleanStep) {
                                    return (
                                        <div key={index} className={classes.step}>
                                            <div className={classes.stepNumber}>{index + 1}</div>
                                            <div className={classes.stepContent}>{cleanStep}</div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </details>
                </>
            )}
        </div>
    )
}
