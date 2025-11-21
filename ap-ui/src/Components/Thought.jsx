import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DisabilitiesEnum from "../Store/Disabilities";
import classes from "./Thought.module.css";
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
    
    useEffect(()=>{
        async function loadThought(currentDisability){
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
                let thoughtData = analysis?.results?.thought_analysis;

                if (!thoughtData) {
                    analysis = await getOrRunFullWorkflow(payload, { forceRefresh: true });
                    thoughtData = analysis?.results?.thought_analysis;
                }

                // if (!thoughtData) {
                //     thoughtData = await fetchLegacyThought(currentDisability);
                // }
                setResponse(thoughtData);
            } catch (err) {
                console.error("Thought analysis error:", err);
                const message = err?.message || "Error while generating analysis. Please try again.";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        }
        if (disability && problem) {
            loadThought(disability);
        }
    },[gradeLevel,difficulty,disability,problem])
    return(
        <div className={classes.container}>
            <ProblemContext />
            <div className={classes.header}>
                <div className={classes.headerIcon}>🧠</div>
                <div>
                    <h2 className={classes.headerTitle}>Thought Analysis</h2>
                    <p className={classes.headerSubtitle}>
                        Professional analysis of the student's thinking process
                    </p>
                </div>
            </div>
            
            {isLoading && (
                <div className={classes.loading}>
                    Analyzing student's thought process...
                </div>
            )}
            
            {error && (
                <div className={classes.error}>
                    {error}
                </div>
            )}
            
            {response && !isLoading && (
                <div className={classes.analysis}>
                    {response.cognitive_patterns && (
                        <div className={classes.thoughtSection}>
                            <div className={classes.sectionTitle}>Cognitive Analysis</div>
                            <div className={classes.sectionContent}>
                                {response.cognitive_patterns}
                            </div>
                        </div>
                    )}
                    {response.disability_impact && (
                        <div className={classes.thoughtSection}>
                            <div className={classes.sectionTitle}>Dsability Impact</div>
                            <div className={classes.sectionContent}>
                                {response.disability_impact}
                            </div>
                        </div>
                    )}
                    {response.emotional_indicators && (
                        <div className={classes.thoughtSection}>
                            <div className={classes.sectionTitle}>Emotional Indicators</div>
                            <div className={classes.sectionContent}>
                                {response.emotional_indicators}
                            </div>
                        </div>
                    )}
                    {response.error_analysis && (
                        <div className={classes.thoughtSection}>
                            <div className={classes.sectionTitle}>Error Analysis</div>
                            <div className={classes.sectionContent}>
                                {response.error_analysis}
                            </div>
                        </div>
                    )}
                    {response.strengths && (
                        <div className={classes.thoughtSection}>
                            <div className={classes.sectionTitle}>Strengths</div>
                            <div className={classes.sectionContent}>
                                {response.strengths}
                            </div>
                        </div>
                    )}
                    {response.growth_areas && (
                        <div className={classes.thoughtSection}>
                            <div className={classes.sectionTitle}>Growth areas</div>
                            <div className={classes.sectionContent}>
                                {response.growth_areas}
                            </div>
                        </div>
                    )}
                    {response.recommendations && (
                        <div className={classes.thoughtSection}>
                            <div className={classes.sectionTitle}>Recommendations</div>
                            <div className={classes.sectionContent}>
                                {response.recommendations}
                            </div>
                        </div>
                    )}
                    
                    {/* {response.mista && (
                        <div className={classes.mistakeSection}>
                            <div className={classes.sectionTitle}>⚠️ Mistake Analysis</div>
                            <div className={classes.mistakeDetails}>
                                <div className={classes.mistakeItem}>
                                    <div className={classes.mistakeLabel}>Type</div>
                                    <div className={classes.mistakeValue}>{response.mistake_analysis.type}</div>
                                </div>
                                <div className={classes.mistakeItem}>
                                    <div className={classes.mistakeLabel}>Severity</div>
                                    <div className={classes.mistakeValue}>{response.mistake_analysis.severity}</div>
                                </div>
                                <div className={classes.mistakeItem}>
                                    <div className={classes.mistakeLabel}>Frequency</div>
                                    <div className={classes.mistakeValue}>{response.mistake_analysis.frequency}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {response.disability_connections && response.disability_connections.length > 0 && (
                        <div className={classes.connectionsSection}>
                            <div className={classes.sectionTitle}>🔗 Disability Connections</div>
                            <ul className={classes.connectionsList}>
                                {response.disability_connections.map((connection, index) => (
                                    <li key={index}>
                                        {connection}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {response.learning_implications && (
                        <div className={classes.implicationsSection}>
                            <div className={classes.sectionTitle}>💡 Learning Implications</div>
                            <div className={classes.implicationsContent}>
                                {response.learning_implications}
                            </div>
                        </div>
                    )} */}
                </div>
            )}
        </div>
    )
}
