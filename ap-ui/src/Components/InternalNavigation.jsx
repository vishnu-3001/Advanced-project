import classes from '../Utils/Button.module.css'
import UserContext from '../Store/UserContext'
import { useContext,useState,useEffect } from 'react'
import { useNavigate,useParams } from 'react-router-dom';
export default function InternalNavigation(){
    const {id}=useParams();
    const[mode,setMode]=useState('description');
    const userCtx=useContext(UserContext);
    const navigate=useNavigate();
    function handleClick(mode){
        userCtx.setUserMode(mode);
        setMode(mode)
    }
    useEffect(()=>{
        userCtx.setUserMode(mode);
        navigate(`/disability/${id}/details/${mode}`);
    },[id,mode,navigate,userCtx])
    return(
        <div>
            <button className={`${classes.genericButton} ${mode==='description'?classes.buttonActive:''}`} onClick={()=>handleClick('description')}>Describe the disability</button>
            <button className={`${classes.genericButton} ${mode==='attempt'?classes.buttonActive:''}`} onClick={()=>handleClick('attempt')}>Simulate student's attempt</button>
            <button className={`${classes.genericButton} ${mode==='thought'?classes.buttonActive:''}`} onClick={()=>handleClick('thought')}>Simulate student's thought</button>
            <button className={`${classes.genericButton} ${mode==='strategies'?classes.buttonActive:''}`} onClick={()=>handleClick('strategies')}>Tutor's strategies</button>
            <button className={`${classes.genericButton} ${mode==='tutor'?classes.buttonActive:''}`} onClick={()=>handleClick('tutor')}>Tutor the student</button>
        </div>
    )
}