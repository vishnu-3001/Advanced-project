import UserContext from "../Store/UserContext";
import classes from "./UserDisplay.module.css"
import { use,useEffect } from "react";
import { Route,Routes } from "react-router-dom";
import Navigation from "./Navigation";
import Description from "./Description";
import Simulation from "./Simulation";
export default function UserDisplay(){
    // const userctx=use(UserContext);
    // useEffect(()=>{
    //     if (userctx.disability === '') {
    //         const stored = sessionStorage.getItem('disability');
    //         if (stored) {
    //             userctx.setDisabilityId(JSON.parse(stored));
    //         }
    //     }
    // },[userctx])
    return(
        <div className={classes.displayContainer}>
            <div className={classes.navigation}>
            <Navigation ></Navigation>
            </div>
            <div className={classes.description}>
            <Routes>
                    <Route path="disability/:id/description" element={<Description/>} />
                    <Route path="disability/:id/simulation" element={<Simulation/>} />
                </Routes>
            </div>
        </div>
    )
}