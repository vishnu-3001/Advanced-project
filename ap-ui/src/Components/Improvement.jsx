import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import DisabilitiesEnum from "../Store/Disabilities";
import { buildFullKey,getOrRunImprovementAnalysis } from "../Utils/langgraphApi";
import classes from "./Improvement.module.css";

export default function Improvement(){
    const {id}=useParams();
    const disability = DisabilitiesEnum[id];
    const problem = sessionStorage.getItem('problem');
    const gradeLevel = sessionStorage.getItem('gradeLevel') || '7th';
    const difficulty = sessionStorage.getItem('difficulty') || 'medium';
    const [response,setResponse]=useState(null);
    const [isLoading,setIsLoading]=useState(true);
    const [error,setError]=useState(null);
    useEffect(()=>{
        async function loadImprovement(){
            setIsLoading(true);
            setError(null);
            try{
                const payload = {
                    grade_level: gradeLevel,
                    difficulty,
                    disability: disability,
                    problem,
                };
                const key=buildFullKey(payload);
                const details=sessionStorage.getItem(key);
                if(!details){
                    throw new Error("No problem data found in session storage");
                }
                const improvement_key=key+"|imporovement"
                let improvement=await getOrRunImprovementAnalysis(improvement_key,JSON.parse(details));
                let new_problem=JSON.parse(improvement.generated_problem).problem;
                let student_imporovement=improvement.improvement_analysis;
                let student_attempt=JSON.parse(improvement.student_attempt);
                let summary=improvement.summary;
                let problems=improvement.practice_problems;
                let new_resonse={new_problem,
                    student_imporovement,
                    student_attempt,
                    summary,
                    problems};
                console.log(new_resonse);
                setResponse(new_resonse);
            }
            catch (err) {
                const message = err?.message || "Error while generating attempt. Please try again.";
                setError(message);
                console.error("Student simulation error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadImprovement();
    },[]);
    return(
        <div>
        {
            !isLoading && response && (
            <div>
                <details className={classes.section}>
                    <summary className={classes.sectionTitle}>New Problem</summary>
                    <div>
                        <div className={classes.sectionContent}><p>{response.new_problem}</p></div>
                        <div><p>Student's final answer {response.student_attempt.final_answer}</p></div>
                        <div>
                            <p>{response.student_attempt.thoughts}</p>
                            {response.student_attempt.steps && (
                                <ol>
                                    {response.student_attempt.steps.map((step, index) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </div>
                </details>
                <div className={classes.section}>
                    <div className={classes.sectionTitle}>Improvement Analysis</div>
                    <div className={classes.sectionContent}><p>{response.student_imporovement}</p></div>
                </div>
                <div className={classes.section}>
                    <div className={classes.sectionTitle}>Summary</div>
                    <div className={classes.sectionContent}><p>{response.summary}</p></div>
                </div>
            </div>
            )
        }
        </div>
    )
}