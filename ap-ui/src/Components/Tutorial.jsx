import React, { useContext } from "react";
import DataPoint from "./DataPoint";
import classes from "./Tutorial.module.css";
import UserContext from "../Store/UserContext";

export default function Tutorial() {
  const userCtx = useContext(UserContext);
  const analysisData = userCtx.tutorialData && userCtx.tutorialData.length > 0
                        ? userCtx.tutorialData[0]
                        : null;

  if (!analysisData) {
    // ... (loading/no data message remains the same)
     return (
      <div>
        <div className={classes.container}>
          <h1 className={classes.heading}>Problem Analysis</h1>
        </div>
        <p className={classes.loadingText}>
          {userCtx.userMode === 'tutorial' ? 'Loading analysis or no analysis data received...' : 'Submit a problem and answer to get analysis.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className={classes.container}>
        <h1 className={classes.heading}>Problem Analysis</h1>
      </div>
      <div className={classes.tutorialContent}>
        <DataPoint
          key={analysisData.id}
          id={analysisData.id}
          Question={analysisData.SubmittedQuestion}
          StudentAnswer={analysisData.StudentAnswer}
          Rating={analysisData.Rating}
          Explanation={analysisData.Explanation}
          ReevaluationNote={analysisData.ReevaluationNote}
          CorrectAnswer={analysisData.CorrectAnswer} // Pass new prop
          CorrectSteps={analysisData.CorrectSteps}   // Pass new prop
        />
      </div>
    </div>
  );
}