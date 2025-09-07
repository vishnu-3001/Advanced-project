import { useEffect,useState } from "react"
import { useParams } from "react-router-dom"
import DisabilitiesEnum from "../Store/Disabilities"
import classes from "./Attempt.module.css"
export default function Attempt(){
    const {id}=useParams();
    const disability=DisabilitiesEnum[id];
    const problem=sessionStorage.getItem('problem');
    const[response,setResponse]=useState(null);
    const[isLoading,setIsLoading]=useState(true);
    const[error,setError]=useState(null);
    
    useEffect(()=>{
        async function generateAttempt(disability){
            setIsLoading(true);
            const response=await fetch("http://localhost:8000/api/v1/openai/generate_attempt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                disability: disability,
                problem: problem
            })
            })
            if(!response.ok){
                setError("Error while generating attempt");
                setIsLoading(false);
                return;
            }
            const jsonResponse=await response.json();
            setResponse(jsonResponse);
            setIsLoading(false);
        }
        generateAttempt(disability);
    },[disability,problem])
    return(
        <div>
            <h2>Simulated Attempt</h2>
            {response && (
                <div>
                    <p> {response.thoughtProcess}</p>
                    {response.steps_to_solve.map((step,index)=>{
                        return(
                            <div>
                                <strong><p key={index}>step {index+1}</p></strong>
                                <p>{step}</p>
                            </div>
                        )
                    })}
                </div>
            )}
            {isLoading && <p>Loading...</p>}
            {error && <p className={classes.error}>{error}</p>}
        </div>
    )
}



// {
//     "thoughtprocess": "I know Amy has 24 apples and she wants to share them among her friends. I might have trouble understanding quantities, so I might confuse how many friends there are or how many apples each friend should get.",
//     "steps_to_solve": [
//       "Step 1: Amy has 24 apples and she wants to share them among her 6 friends.",
//       "Step 2: Divide 24 by 6 to find how many apples each friend will get. 24 / 6 = 4 apples per friend.",
//       "Final Step: Each friend will get 4 apples. Therefore, each friend will get 4 apples."
//     ]
//   }