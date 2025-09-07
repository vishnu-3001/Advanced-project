import { createContext, useState } from "react";

const UserContext = createContext({
    generatedProblem:null,
    setGeneratedProblem:()=>{},
    answer:null,
    setAnswer:()=>{},
    approach:null,
    setApproach:()=>{},
    userMode:null,
    setUserMode:()=>{}
});

export function UserProvider({ children }) {
    const[generatedProblem,setGeneratedProblem]=useState(null);
    const [generatedAnswer,setGeneratedAnswer]=useState(null);
    const [generatedApproach,setGeneratedApproach]=useState(null);
    const [mode,setMode]=useState(null);
    function setAnswer(answer){
        setGeneratedAnswer(answer)
    }
    function setApproach(approach){
        setGeneratedApproach(approach)
    }
    function setProblem(problem){
        setGeneratedProblem(problem)
    }
    function setUserMode(mode){
        setMode(mode);
    }
    const contextValue = {
        generatedProblem:generatedProblem,
        setGeneratedProblem:setProblem,
        answer:generatedAnswer,
        setAnswer:setAnswer,
        approach:generatedApproach,
        setApproach:setApproach,
        userMode:mode,
        setUserMode:setUserMode
    };

    return <UserContext.Provider value={contextValue}> 
        {children}
    </UserContext.Provider>;
}

export default UserContext;