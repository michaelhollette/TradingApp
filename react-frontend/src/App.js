import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import apiUrl from './services/api';
import {useState, useEffect} from 'react'




function App() {
    const [welcome, setWelcome] = useState("")
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
    },[])
    
  return (<>
  <h1>{welcome.message}</h1>
  </>
    
  );
}

export default App;
