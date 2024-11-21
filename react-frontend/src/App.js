import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {useState, useEffect} from 'react'
import Homepage from './components/HomePage';
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";






function App() {
    const [welcome, setWelcome] = useState("");
    async function fetchHome (){
        try {
            const response = await fetch(`http://localhost:8000/api/`)
            const data = await response.json()
            setWelcome(data)
        }
        catch(err){
            console.error("Did not receive homepage  ", err);
        }
    }
    useEffect(()=>{
        fetchHome()
    },[]);
    
  return (<>
  <Router>
        <Routes>
            <Route path ="/" element={<Homepage welcome ={welcome} />}/>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
        </Routes>
  </Router>
  
  </>
    
  );
}

export default App;
