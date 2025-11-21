import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DisabilitiesEnum from "../Store/Disabilities";
import classes from "./Tutor.module.css";
import { getOrRunFullWorkflow } from "../Utils/langgraphApi";
import ProblemContext from "./ProblemContext";

export default function Thought(){
    const {id}=useParams();
    const disability=DisabilitiesEnum[id];
    const problem=sessionStorage.getItem('problem');
    const [response,setResponse]=useState(null);
    const [isLoading,setIsLoading]=useState(true);
    const [error,setError]=useState(null);
    const gradeLevel = sessionStorage.getItem('gradeLevel') || '7th';
    const difficulty = sessionStorage.getItem('difficulty') || 'medium';
    
    useEffect(() => {
        async function loadThought(currentDisability) {
          if (!currentDisability || !problem) return;
          setIsLoading(true);
          setError(null);
          try {
            const payload = { grade_level: gradeLevel, difficulty, disability: currentDisability, problem };
      
            let analysis = await getOrRunFullWorkflow(payload);
            let tutorData = analysis?.results?.tutor_session;
      
            if (!tutorData) {
              analysis = await getOrRunFullWorkflow(payload, { forceRefresh: true });
              tutorData = analysis?.results?.tutor_session;
            }
      
            setResponse(tutorData);
          } catch (err) {
            console.error("Tutor session error:", err);
            setError(err?.message || "Error while generating tutor session. Please try again.");
          } finally {
            setIsLoading(false);
          }
        }
      
        loadThought(disability);
      }, [id, gradeLevel, difficulty, disability, problem]);
    return(
        <div className={classes.container}>
            <ProblemContext />
            <div className={classes.header}>
                <div className={classes.headerIcon}></div>
                <div>
                    <h2 className={classes.headerTitle}>Tutor Session</h2>
                    <p className={classes.headerSubtitle}>
                        Interactive tutor and student session based on the student's response patterns
                    </p>
                </div>
            </div>
            
            {isLoading && (
                <div className={classes.loading}>
                    Generating the tutor session...
                </div>
            )}
            
            {error && (
                <div className={classes.error}>
                    {error}
                </div>
            )}
            
            {response && !isLoading && (
                <div>
                    {response.conversation && response.conversation.length > 0 && (
                        <div className={classes.stepsContainer}>
                            <div className={classes.stepsTitle}>
                                Tutor Conversation
                            </div>
                            {response.conversation.map((converse, index) => (
                                <div key={index} className={classes.step}>
                                    <div className={classes.stepNumber}>
                                        {converse.speaker}:
                                    </div>
                                    <div className={classes.stepContent}>
                                        {converse.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
