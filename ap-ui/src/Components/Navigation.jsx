import UserContext from "../Store/UserContext";
import { useContext } from "react";
import Button from "../Utils/Button";
export default function Navigation(){
    const userctx=useContext(UserContext);
    function handleModeChange(mode){
        userctx.setMode(mode);
    }
    return(
        <div>
            <Button onClick={()=>handleModeChange("form")} isActive={userctx.userMode==='form'}>Form</Button>
            <Button onClick={()=>handleModeChange("mistakes")} isActive={userctx.userMode==='mistakes'}>Mistakes</Button>
            <Button onClick={()=>handleModeChange("performance")} isActive={userctx.userMode==='performance'}>Performance</Button>
            <Button onClick={()=>handleModeChange("sessions")} isActive={userctx.userMode==='sessions'}>Sessions</Button>
        </div>
    )
}