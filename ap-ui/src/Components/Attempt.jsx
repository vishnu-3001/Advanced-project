import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DisabilitiesEnum from "../Store/Disabilities";
import classes from "./Attempt.module.css";
import { getOrRunFullWorkflow } from "../Utils/langgraphApi";
import ProblemContext from "./ProblemContext";

export default function Attempt(){
    const {id} = useParams();
    const disability = DisabilitiesEnum[id];
    const problem = sessionStorage.getItem('problem');
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const gradeLevel = sessionStorage.getItem('gradeLevel') || '7th';
    const difficulty = sessionStorage.getItem('difficulty') || 'medium';
    
    useEffect(() => {
        async function fetchLegacyAttempt(currentDisability) {
            const legacyResponse = await fetch("http://localhost:8000/api/v1/openai/generate_attempt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    disability: currentDisability,
                    problem,
                }),
            });

            if (!legacyResponse.ok) {
                throw new Error(`Legacy attempt failed (${legacyResponse.status})`);
            }

            return legacyResponse.json();
        }

        async function loadAttempt(currentDisability) {
            setIsLoading(true);
            setError(null);
            try {
                const payload = {
                    grade_level: gradeLevel,
                    difficulty,
                    disability: currentDisability,
                    problem,
                };
                let analysis = await getOrRunFullWorkflow(payload);
                let attemptData = analysis?.results?.student_simulation;

                if (!attemptData) {
                    analysis = await getOrRunFullWorkflow(payload, { forceRefresh: true });
                    attemptData = analysis?.results?.student_simulation;
                }

                // if (!attemptData) {
                //     attemptData = await fetchLegacyAttempt(currentDisability);
                // }

                setResponse(attemptData);
            } catch (err) {
                const message = err?.message || "Error while generating attempt. Please try again.";
                setError(message);
                console.error("Student simulation error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        if (disability && problem) {
            loadAttempt(disability);
        }
    }, [gradeLevel, difficulty, disability, problem])
    
    return(
        <div className={classes.container}>
            <ProblemContext />
            <div className={classes.header}>
                <div className={classes.headerIcon}>🎭</div>
                <div>
                    <h2 className={classes.headerTitle}>Student Simulation</h2>
                    <p className={classes.headerSubtitle}>
                        How a student with {disability} would approach this problem
                    </p>
                </div>
            </div>
            
            {isLoading && (
                <div className={classes.loading}>
                    Simulating student's approach...
                </div>
            )}
            
            {error && (
                <div className={classes.error}>
                    {error}
                </div>
            )}
            
            {response && !isLoading && (
                <>
                {
                    response.studentAnswer && (
                        <div className={classes.stepsContainer}>
                            <div className={classes.stepsTitle}>
                                Student's answer
                            </div>
                            <div className={classes.attemptContent}>
                                {response.studentAnswer}
                            </div>
                        </div>
                    )
                }
                    {response.thoughtprocess && (
                        <div className={classes.thoughtProcess}>
                            <div className={classes.thoughtProcessTitle}>
                                Student's Internal Thoughts
                            </div>
                            <div className={classes.thoughtProcessContent}>
                                {response.thoughtprocess}
                            </div>
                        </div>
                    )}
                    
                    {response.steps_to_solve && response.steps_to_solve.length > 0 && (
                        <div className={classes.stepsContainer}>
                            <div className={classes.stepsTitle}>
                                Step-by-Step Solution
                            </div>
                            {response.steps_to_solve.map((step, index) => (
                                <div key={index} className={classes.step}>
                                    <div className={classes.stepNumber}>
                                        Step {index + 1}
                                    </div>
                                    <div className={classes.stepContent}>
                                        {step}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}



// {
//     "thoughtprocess": "I know Amy has 24 apples and she wants to share them among her friends. I might have trouble understanding quantities, so I might confuse how many friends there are or how many apples each friend should get.",
//     "steps_to_solve": [
//       "Step 1: Amy has 24 apples and she wants to share them among her 6 friends.",
//       "Step 2: Divide 24 by 6 to find how many apples each friend will get. 24 / 6 = 4 apples per friend.",
//       "Final Step: Each friend will get 4 apples. Therefore, each friend will get 4 apples."
//     ]
//   }
