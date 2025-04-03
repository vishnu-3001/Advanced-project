import './App.css';
import { UserProvider } from './Store/UserContext';
import Navigation from './Components/Navigation';
import Tutorial from './Components/Tutorial';
import UserDisplay from './Components/UserDisplay';

function App() {
  return (
    <UserProvider>
      {/* <Navigation></Navigation> */}
      <UserDisplay></UserDisplay>
    </UserProvider>
  );
}

export default App;
