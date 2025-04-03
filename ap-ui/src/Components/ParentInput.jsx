import classes from "./ParentInput.module.css"
import { useRef, useEffect,use } from "react";
import UserContext from "../Store/UserContext";

export default function TeacherInput() {
    const questionRef = useRef();
    const mistakeRef = useRef();
    const userctx=use(UserContext);
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
    function handleSubmit(e){
        e.preventDefault();
        userctx.setMode('tutorial');
    }

    return (
        <form className={classes.formContainer}>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Student's name</label>
                <input id="name" name="name" type="text" className={classes.formInput} />
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Student's age</label>
                <input id="age" name="age" type="number" className={classes.formInput} />
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Grade/Class</label>
                <input id="grade" name="grade" type="text" className={classes.formInput} />
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Subject</label>
                <select id="subject" name="subject" className={classes.formInput}>
                    <option value="">Select subject</option>
                    <option value="math">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Number of questions given</label>
                <input id="questionsGiven" name="questionsGiven" type="number" className={classes.formInput} />
            </div>
            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Number of questions answered correctly</label>
                <input id="correctAnswers" name="correctAnswers" type="number" className={classes.formInput} />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Does the student have any known learning disabilities?</label>
                <div>
                    <input type="radio" id="disabilityYes" name="disability" value="yes" /> 
                    <label htmlFor="disabilityYes" className={classes.radioLabel}>Yes</label>
                    <input type="radio" id="disabilityNo" name="disability" value="no" /> 
                    <label htmlFor="disabilityNo" className={classes.radioLabel}>No</label>
                    <input type="radio" id="disabilityUnknown" name="disability" value="unknown" /> 
                    <label htmlFor="disabilityUnknown" className={classes.radioLabel}>Not sure</label>
                </div>
            </div>

            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Question given to student</label>
                <textarea 
                    id="question"
                    name="question"
                    className={classes.formText}
                    ref={questionRef}
                    onInput={() => handleInput(questionRef)}
                    placeholder="Describe the question or problem given to the student..."
                />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Student's mistakes or difficulties</label>
                <textarea 
                    id="mistake"
                    name="mistake"
                    className={classes.formText}
                    ref={mistakeRef}
                    onInput={() => handleInput(mistakeRef)}
                    placeholder="Describe the specific mistakes made or difficulties observed..."
                />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Time taken to solve</label>
                <input id="timeTaken" name="timeTaken" type="text" className={classes.formInput} placeholder="e.g., 15 minutes" />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.formLabel}>Additional observations</label>
                <textarea 
                    id="observations"
                    name="observations"
                    className={classes.formText}
                    placeholder="Any other behavioral or learning observations..."
                />
            </div>

            <button className={classes.formButton} onClick={handleSubmit}>Analyze Student Performance</button>
        </form>
    );
}
