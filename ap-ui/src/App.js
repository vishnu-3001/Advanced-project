import './App.css';
import { UserProvider } from './Store/UserContext';
import UserDisplay from './Components/UserDisplay';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';


const router = createBrowserRouter([
  {
    path: '/*',
    element: <UserDisplay />
  }

]);

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}
export default App;

