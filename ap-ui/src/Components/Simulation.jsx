
import classes from './Simulation.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useActionState } from 'react';
import DisabilitiesEnum from '../Store/Disabilities';

export default function Simulation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [simulationData, setSimulationData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [generate, setGenerate] = useState(false);

    function handleClick() {
        navigate(`/disability/${id}/description`);
    }

    function handleGenerate() {
        setGenerate(true);
    }

    async function generateConversation() {
        try {
            setIsLoading(true);
            const disability = DisabilitiesEnum[id];
            const result = await fetch(`http://localhost:8000/api/v1/openai/generate_conversation?disability=${disability}`);
            if (!result.ok) {
                console.error("Error generating conversation");
                return;
            }
            const response = await result.json();
            setSimulationData(response);
        } catch (error) {
            console.error("Error generating conversation", error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSubmit(_, formData) {
        const tweak = formData.get('tweak');
        let errors = [];

        if (!tweak) {
            errors.push("Please enter your required changes or more inputs for modified simulation");
        }
        if (tweak.length > 150) {
            errors.push("Please enter a shorter input");
        }
        console.log(errors);

        if (errors.length > 0) {
            return { errors, enteredValues: { tweak } };
        }

        console.log(tweak);
        // You can trigger simulation refresh here if you want based on tweak
        return { errors: null, enteredValues: { tweak } };
    }

    useEffect(() => {
        generateConversation();
    }, []);

    const [formState, formAction, pending] = useActionState(handleSubmit, { errors: null });

    return (
        <div>
            {isLoading ? (
                <div>Simulation is loading...</div>
            ) : (
                <div className={classes.simulationContainer}>
                    <button className={classes.genericButton} onClick={handleClick}>Description</button>

                    {!generate && (
                        <button className={classes.genericButton} onClick={handleGenerate}>Generate</button>
                    )}

                    {generate && (
                        <div className={classes.tweakContainer}>
                            <form className={classes.tweakForm} action={formAction}>
                                <textarea
                                    className={classes.tweakInput}
                                    placeholder="Please enter your required changes or more inputs for simulation"
                                    id="tweak"
                                    name="tweak"
                                    defaultValue={formState.enteredValues?.tweak}
                                />
                                {formState.errors && formState.errors.map((error, index) => (
                                    <p key={index} className={classes.error}>{error}</p>
                                ))}
                                <button className={classes.genericButton} type="submit">
                                    Simulate
                                </button>
                            </form>
                        </div>
                    )}

                    <h2>{simulationData?.title}</h2>
                    <h3>{simulationData?.scenario}</h3>
                    {simulationData?.conversation.map((converse, index) => (
                        <div key={index}>
                            <p><strong>{converse.speaker}:</strong></p>
                            <p>{converse.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
