import classes from "./UserDisplay.module.css"
import { Route,Routes } from "react-router-dom";
import Navigation from "./Navigation";
import Details from "./Details";
import Problem from "./Problem";
export default function UserDisplay(){
    return(
        <div className={classes.displayContainer}>
            <Problem></Problem>
            <div className={classes.routeContainer}>
                <div className={classes.navigation}>
                    <Navigation ></Navigation>
                </div>
                <div className={classes.description}>
                <Routes>
                        <Route path="disability/:id/details/*" element={<Details/>} />
                    </Routes>
                </div>
            </div>
        </div>
    )
}