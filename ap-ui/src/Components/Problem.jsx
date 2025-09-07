import { useEffect, useContext,useState } from "react"
import UserContext from "../Store/UserContext";
import classes from "./Problem.module.css"
export default function Problem(){
    const userCtx=useContext(UserContext);
    const[problem,setProblem]=useState('');
    const[answer,setAnswer]=useState('');
    const[approach,setApproach]=useState('');
    useEffect(()=>{
        generateProblem();
    },[])
    async function generateProblem(){
        try{
            const response=await fetch("http://localhost:8000/api/v1/openai/generate_problem");
            if(!response.ok){
                alert("Error while generating problem");
                return;
            }
            const jsonResponse=await response.json();
            console.log(jsonResponse.problem);
            userCtx.setGeneratedProblem(jsonResponse.problem);
            userCtx.setAnswer(jsonResponse.answer);
            userCtx.setApproach(jsonResponse.approach);
            sessionStorage.setItem("problem",jsonResponse.problem);
            sessionStorage.setItem("answer",jsonResponse.answer);
            sessionStorage.setItem("approach",jsonResponse.solution);
            setProblem(jsonResponse.problem);
            setAnswer(jsonResponse.answer);
            setApproach(jsonResponse.solution);
        }catch(error){
            console.log("Error while generating problem",error);
        }
    }
    return(
        <div className={classes.problemContainer}>
            <strong>Problem</strong>
            <p>{problem}</p>
            <strong>Answer</strong>
            <p>{answer}</p>
            <strong>Approach</strong>
            <p>{approach}</p>
        </div>
    )
}