import Datapoint from "./DataPoint";
import data from "../Utils/Datapoint";
import classes from "./Tutorial.module.css";
import Comment from "./Comment";
import { useState } from "react";

export default function Tutorial() {
  const [regenerate, setRegenerate] = useState(false);

  function handleRegenerate() {
    setRegenerate(true);
  }

  return (
    <div>
      <div className={classes.container}>
        <h1 className={classes.heading}>Tutorial</h1>
        <button className={classes.button} onClick={handleRegenerate}>
          Regenerate Tutorial
        </button>
      </div>
      {data.map((datapoint) => (
        <Datapoint
          key={datapoint.id}
          id={datapoint.id}
          question={datapoint.question}
          mistakes={datapoint.possibleMistakes}
          reasons={datapoint.possibleReasons}
          approaches={datapoint.approachesForTutors}
        />
      ))}
      {regenerate && <Comment />}
    </div>
  );
}
