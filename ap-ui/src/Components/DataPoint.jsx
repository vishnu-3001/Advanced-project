import React, { useState } from 'react';
import classes from './Datapoint.module.css';
import Button from '../Utils/Button';

// --- CORRECTED formatSteps function ---
const formatSteps = (stepsString) => {
    if (!stepsString) {
        return []; // Return empty array if no steps string
    }
    // Split the string by newline characters and filter out any empty lines resulting from the split
    return stepsString.split('\n').filter(step => step.trim() !== '');
};
// --- END CORRECTION ---

export default function DataPoint({
    id,
    Question,        // Note: This prop receives the 'SubmittedQuestion' from the backend response
    StudentAnswer,
    Rating,
    Explanation,
    ReevaluationNote,
    CorrectAnswer,
    CorrectSteps     // This prop receives the multi-line string from the backend
}) {
    const [showExplanation, setShowExplanation] = useState(false);
    const [showReevaluation, setShowReevaluation] = useState(false);
    const [showCorrectSolution, setShowCorrectSolution] = useState(false);

    // Use the corrected, simpler formatter
    const formattedSteps = formatSteps(CorrectSteps);

    // Check if content exists
    const hasExplanation = Explanation && Explanation.length > 0 && !Explanation.includes("Could not parse") && !Explanation.startsWith("Raw:");
    const hasReevaluation = ReevaluationNote && ReevaluationNote.length > 0;
    const hasCorrectSolution = (CorrectAnswer && CorrectAnswer.length > 0 && CorrectAnswer !== "N/A") || (formattedSteps.length > 0 && CorrectSteps !== "N/A"); // Check formattedSteps too
    const isError = Rating === "Error" || Rating === "Parsing Failed";


    let ratingClass = classes.ratingDefault;
    if (Rating === 'Correct') ratingClass = classes.ratingCorrect;
    else if (Rating === 'Incorrect') ratingClass = classes.ratingIncorrect;
    else if (Rating === 'Partially Correct') ratingClass = classes.ratingPartial;
    else if (isError) ratingClass = classes.ratingError;


    return (
        <div className={classes.tile}>
            {/* Submitted/Generated Info */}
            <div className={classes.submittedInfo}>
                 <div className={classes.problemSection}>
                    {/* Label clarification based on workflow */}
                    <span className={classes.span}>Problem Submitted/Generated</span>
                    <p className={classes.problemText}>{Question}</p>
                </div>
                <div className={classes.answerSection}>
                     {/* Label clarification based on workflow */}
                    <span className={classes.span}>Student's/Simulated Answer</span>
                    <p className={classes.answerText}>{StudentAnswer}</p>
                </div>
            </div>

            {/* Analysis */}
            <div className={classes.analysisContainer}>
                 <div className={classes.ratingSection}>
                    <span className={classes.span}>Rating</span>
                    <p className={`${classes.rating} ${ratingClass}`}>
                        {Rating || 'Not Rated'}
                    </p>
                </div>

                {/* Button Container */}
                {!isError && (hasCorrectSolution || hasExplanation || hasReevaluation) && (
                    <div className={classes.buttonContainer}>
                        {hasCorrectSolution && (
                             <Button onClick={() => setShowCorrectSolution(!showCorrectSolution)}>
                                {showCorrectSolution ? 'Hide Correct Solution' : 'Show Correct Solution'}
                            </Button>
                        )}
                         {hasExplanation && (
                            <Button onClick={() => setShowExplanation(!showExplanation)}>
                                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                            </Button>
                        )}
                        {hasReevaluation && (
                            <Button onClick={() => setShowReevaluation(!showReevaluation)}>
                                {showReevaluation ? 'Hide Re-eval Note' : 'Show Re-eval Note'}
                            </Button>
                        )}
                    </div>
                )}

                {/* --- Conditionally Rendered Sections --- */}

                 {/* CORRECT SOLUTION SECTION */}
                 {showCorrectSolution && hasCorrectSolution && (
                    <div className={`${classes.analysisSection} ${classes.correctSolutionSection}`}>
                        <span className={classes.span}>Correct Answer & Steps</span>
                        {CorrectAnswer && CorrectAnswer !== "N/A" && <p><strong>Answer:</strong> {CorrectAnswer}</p>}
                        {formattedSteps.length > 0 && (
                            <div>
                                 <p><strong>Steps:</strong></p>
                                 {/* Render steps using <ol> for semantic numbering */}
                                 <ol className={classes.stepsList}>
                                     {formattedSteps.map((step, index) => (
                                         // Each step from the split array becomes a list item
                                         <li key={index}>{step}</li>
                                     ))}
                                 </ol>
                            </div>
                        )}
                    </div>
                )}

                {/* Explanation Section */}
                {showExplanation && hasExplanation && (
                    <div className={classes.analysisSection}>
                        <span className={classes.span}>Explanation (AI Generated)</span>
                         <p>{Explanation}</p>
                    </div>
                )}
                 {/* Error Display */}
                 {isError && (
                     <div className={classes.analysisSection}>
                        <span className={classes.span}>Details</span>
                        <p className={classes.errorText}>
                            {Explanation || "An error occurred during analysis."}
                        </p>
                    </div>
                 )}

                {/* Re-evaluation Note Section */}
                {showReevaluation && hasReevaluation && (
                    <div className={classes.analysisSection}>
                        <span className={classes.span}>Re-evaluation Note (AI Generated)</span>
                        <p>{ReevaluationNote}</p>
                    </div>
                )}
            </div>
        </div>
    );
}