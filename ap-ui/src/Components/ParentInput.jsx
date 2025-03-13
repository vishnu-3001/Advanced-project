import classes from "./ParentInput.module.css"
import { useRef, useEffect } from "react";

export default function ParentInput() {
    const questionRef = useRef();
    const mistakeRef = useRef();

    useEffect(() => {
        adjustHeight(questionRef.current);
        adjustHeight(mistakeRef.current);
    }, []); 

    function adjustHeight(element) {
        if (element) {
            element.style.height = "auto";
            element.style.height = `${element.scrollHeight}px`;
        }
    }

    function handleInput(ref) {
        adjustHeight(ref.current);
    }

    return (
        <form className={classes.formContainer}>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Enter child's age</label>
                <input id="age" name="age" type="number" className={classes.formInput} />
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Enter child's grade</label>
                <input id="grade" name="grade" type="number" className={classes.formInput} />
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Number of questions given to child</label>
                <input id="questionsPerSession" name="questionsPerSession" type="number" className={classes.formInput} />
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Number of questionsanswered correctly by child</label>
                <input id="answeresPerSession" name="answersPerSession" type="number" className={classes.formInput} />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Are you aware of any details of disability of your child</label>
                <input type="radio" name="disabilityAwareness" value="yes" required /> Yes
                <input type="radio" name="disabilityAwareness" value="no" required /> No
            </div>

            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Describe the question given to your child</label>
                <textarea 
                    id="question"
                    name="question"
                    className={classes.formText}
                    ref={questionRef}
                    onInput={() => handleInput(questionRef)} 
                />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Describe the mistake made by child while solving it</label>
                <textarea 
                    id="mistake"
                    name="mistake"
                    className={classes.formText}
                    ref={mistakeRef}
                    onInput={() => handleInput(mistakeRef)} 
                />
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Enter time taken by child to solve the question </label>
                <input id="grade" name="grade" type="text" className={classes.formInput} />
            </div>

            <button className={classes.formButton}>Diagnose</button>
        </form>
    );
}
