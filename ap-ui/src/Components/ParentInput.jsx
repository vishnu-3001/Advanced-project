import classes from "./ParentInput.module.css";
import { useRef, useEffect, useContext, useCallback, useState } from "react";
import UserContext from "../Store/UserContext";
import DisabilitySelector from "./DisabilitySelector";

export default function ParentInput() {
    // Refs for context inputs
    const gradeRef = useRef();
    const subjectRef = useRef();
    const topicRef = useRef(); // New Ref for topic
    const additionalObservationsRef = useRef(); // Kept for optional context, though less central now

    // State for disability selection
    const [selectedDisability, setSelectedDisability] = useState('none');

    // State for loading and potential errors
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null); // To display error messages

    const userCtx = useContext(UserContext);

    // --- Removed handleInput/useEffect for question/answer textareas ---
    // --- If you keep 'Additional Observations', you might want similar logic for it ---
    const adjustHeight = useCallback((element) => {
        if (element) {
            element.style.height = "auto";
            element.style.height = `${element.scrollHeight}px`;
        }
    }, []);

     useEffect(() => {
        adjustHeight(additionalObservationsRef.current);
    }, [adjustHeight]);

     const handleInput = useCallback((ref) => {
        adjustHeight(ref.current);
    }, [adjustHeight]);
    // --- ---

    const handleDisabilitySelection = (disabilityId) => {
        setSelectedDisability(disabilityId);
    };

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null); // Clear previous errors

        // --- Gather Context Data ---
        const scenarioContext = {
            Grade: parseInt(gradeRef.current.value, 10) || -1,
            Subject: subjectRef.current.value || "math", // Default to math
            "Selected-disability": selectedDisability, // Use state value
            topic: topicRef.current.value || null, // Get topic, null if empty
        };

        console.log("Requesting scenario generation with context:", scenarioContext);

        try {
            // --- API Call 1: Generate Scenario ---
            const scenarioResponse = await fetch('http://localhost:8000/generate_scenario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send context matching ScenarioGenerationInput model (check backend for alias usage if needed)
                body: JSON.stringify({
                     Grade: scenarioContext.Grade,
                     Subject: scenarioContext.Subject,
                     "Selected-disability": scenarioContext["Selected-disability"], // Ensure backend alias matches if used
                     topic: scenarioContext.topic
                 }),
            });

            if (!scenarioResponse.ok) {
                let errorBody = 'Could not read scenario generation error body.';
                try { errorBody = await scenarioResponse.text(); } catch (e) {}
                throw new Error(`Scenario Generation Failed! Status: ${scenarioResponse.status}, Body: ${errorBody}`);
            }

            const generatedScenario = await scenarioResponse.json(); // Expecting { GeneratedQuestion: "...", SimulatedStudentAnswer: "..." }
            console.log("Received generated scenario:", generatedScenario);

            if (!generatedScenario.GeneratedQuestion || !generatedScenario.SimulatedStudentAnswer || generatedScenario.GeneratedQuestion.startsWith("Error:")) {
                 throw new Error(`Backend failed to generate a valid scenario: ${generatedScenario.GeneratedQuestion}`);
            }


            // --- API Call 2: Analyze Generated Scenario ---
            console.log("Requesting analysis for generated scenario...");
            const analysisInput = {
                GeneratedQuestion: generatedScenario.GeneratedQuestion,
                SimulatedStudentAnswer: generatedScenario.SimulatedStudentAnswer,
                // Pass context again for analysis prompt
                Grade: scenarioContext.Grade,
                Subject: scenarioContext.Subject,
                selected_disability: scenarioContext["Selected-disability"],
                topic: scenarioContext.topic
            };

            const analysisResponse = await fetch('http://localhost:8000/analyze_generated', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analysisInput), // Send data matching AnalysisInputForGenerated model
            });

             if (!analysisResponse.ok) {
                let errorBody = 'Could not read analysis error body.';
                try { errorBody = await analysisResponse.text(); } catch (e) {}
                throw new Error(`Analysis Failed! Status: ${analysisResponse.status}, Body: ${errorBody}`);
            }

            const finalAnalysisResult = await analysisResponse.json(); // Expecting ProblemAnalysisResponse
            console.log("Received final analysis:", finalAnalysisResult);

             if (finalAnalysisResult.Rating === "Error" || finalAnalysisResult.Rating === "Parsing Failed") {
                 throw new Error(`Backend analysis failed: ${finalAnalysisResult.Explanation}`);
            }

            // --- Update Context and Navigate ---
            userCtx.setTutorialData([finalAnalysisResult]); // Wrap in array as Tutorial expects it
            userCtx.setMode('tutorial'); // Switch view

        } catch (error) {
            console.error("Error during scenario generation or analysis:", error);
            setError(error.message); // Set error state to display message
            // Optionally, clear tutorial data if error occurs
            // userCtx.setTutorialData(null);
        } finally {
             setIsSubmitting(false); // Reset loading state regardless of success/failure
        }

    }, [userCtx, selectedDisability]); // Dependencies for useCallback

    return (
        <form className={classes.formContainer} onSubmit={handleSubmit}>
            <h2 className={classes.formHeading}>Generate & Analyze Scenario</h2>
             {error && <p className={classes.errorText}>{error}</p>} {/* Display errors */}

             {/* --- Context Inputs --- */}
             <div className={classes.formGroup}>
                <label htmlFor="grade" className={classes.formLabel}>Grade/Class (Number)</label>
                <input id="grade" name="grade" type="number" className={classes.formInput} ref={gradeRef} placeholder="e.g., 3"/>
            </div>
            <div className={classes.formGroup}>
                <label htmlFor="subject" className={classes.formLabel}>Subject</label>
                <select id="subject" name="subject" className={classes.formInput} ref={subjectRef}>
                     <option value="math">Mathematics</option>
                     {/* Add other subjects if applicable */}
                     <option value="science">Science</option>
                     <option value="english">English</option>
                </select>
            </div>
             <div className={classes.formGroup}>
                <label htmlFor="topic" className={classes.formLabel}>Specific Topic (Optional)</label>
                <input id="topic" name="topic" type="text" className={classes.formInput} ref={topicRef} placeholder="e.g., addition, fractions, word problems"/>
            </div>

             {/* Disability Selector */}
             <div className={classes.formGroup}>
                <DisabilitySelector
                    selectedDisability={selectedDisability}
                    onDisabilityChange={handleDisabilitySelection}
                    // disabled={isSubmitting} // Disable selector while submitting if desired
                 />
            </div>

            {/* Optional Observations (Kept for potential extra context, but not primary input) */}
             <details className={classes.details}>
                 <summary className={classes.summary}>Optional: Add General Observations</summary>
                 <div className={classes.detailsContent}>
                     <div className={classes.formGroup}>
                        {/* <label htmlFor="observations" className={classes.formLabel}>Additional observations</label> */}
                        <textarea
                            id="observations"
                            name="observations"
                            className={classes.formText}
                            ref={additionalObservationsRef}
                            onInput={() => handleInput(additionalObservationsRef)}
                            placeholder="Any general observations about the student (e.g., 'struggles with multi-step problems', 'easily distracted'). This currently does not directly influence question generation but might be useful later."
                        />
                    </div>
                 </div>
            </details>

            {/* Submit Button */}
            <button type="submit" className={classes.formButton} disabled={isSubmitting}>
                {isSubmitting ? 'Generating & Analyzing...' : 'Generate Scenario & Analyze'}
            </button>
        </form>
    );
}

// Add a basic error style to ParentInput.module.css if it doesn't exist
/*
.errorText {
    color: #d9534f; / * Red color for errors * /
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
    text-align: center;
}
*/