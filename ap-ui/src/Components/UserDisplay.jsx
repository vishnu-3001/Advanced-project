import Mistakes from "./Mistakes";
import SessionLevel from "./SessionLevel";
import ParentInput from "./ParentInput";
import Performance from "./Performance";
import UserContext from "../Store/UserContext";
import Tutorial from "./Tutorial";
import { use } from "react";
export default function UserDisplay(){
    const userctx=use(UserContext);
    return(
        <div>
            {userctx.userMode==='form'&&<ParentInput></ParentInput>}
            {userctx.userMode==='tutorial'&&<Tutorial></Tutorial>}
            {/* {userctx.userMode==='mistakes'&&<Mistakes></Mistakes>}
            {userctx.userMode==='performance'&&<Performance></Performance>}
            {userctx.userMode==='sessions'&&<SessionLevel></SessionLevel>} */}

        </div>
    )
}