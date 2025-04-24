import { createContext, useState } from "react";

// Define the initial shape of the context
const UserContext = createContext({
    userMode: 'form',
    setMode: () => {},
    tutorialData: null, 
    setTutorialData: () => {}, 
    disability:'',
    setDisabilityId:()=>{}
});

export function UserProvider({ children }) {
    const [mode, setModeState] = useState('form');
    const [data, setData] = useState(null); 
    const[disability,setDisability]=useState('1');

    function setUserMode(newMode) {
        setModeState(newMode);
    }

    function setTutorialDataState(fetchedData) {
        setData(fetchedData);
    }
    function setSelectedDisability(disability){
        setDisability(disability);
    }
    const contextValue = {
        userMode: mode,
        setMode: setUserMode,
        tutorialData: data,
        setTutorialData: setTutorialDataState, 
        disability:disability,
        setDisabilityId:setSelectedDisability
    };

    return <UserContext.Provider value={contextValue}> 
        {children}
    </UserContext.Provider>;
}

export default UserContext;