import { createContext } from "react";
import { useState } from "react";
const UserContext=createContext({
    userMode:'',
    setMode:()=>{}
})
export function UserProvider({children}){
    const[Mode,setMode]=useState('form');
    function setUserMode(mode){
        setMode(mode);
    }
    const value={
        userMode:Mode,
        setMode:setUserMode
    }
    return <UserContext value={value}>
        {children}
    </UserContext>
}
export default UserContext