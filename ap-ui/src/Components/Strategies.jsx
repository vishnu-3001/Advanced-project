import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import DisabilitiesEnum from "../Store/Disabilities";
import classes from "./Attempt.module.css";
export default function Strategies(){
    const {id}=useParams();
    const disability=DisabilitiesEnum[id];
    const problem=sessionStorage.getItem('problem');
    const[response,setResponse]=useState(null);
    const[isLoading,setIsLoading]=useState(true);
    const[error,setError]=useState(null);
    
    useEffect(()=>{
        async function generateAttempt(disability){
            setIsLoading(true);
            const response=await fetch("http://localhost:8000/api/v1/openai/generate_strategies", {
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
            console.log(jsonResponse);
            setResponse(jsonResponse);
            setIsLoading(false);
        }
        generateAttempt(disability);
    },[disability,problem])
    return(
        <div>
            <h2>Strategies</h2>
            {response && (
                response.strategies.map((strategy,index)=>{
                    return(
                        <div>
                            <p key={index}>{strategy}</p>
                        </div>
                    )
                })
            )}
            {isLoading && <p>Loading...</p>}
            {error && <p className={classes.error}>{error}</p>}
        </div>
    )
}