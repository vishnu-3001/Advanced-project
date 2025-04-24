import classes from './Navigation.module.css'
import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
export default function Navigation(){
    const[selectedDisabilityID,setSelectedDisabilityID]=useState('');
    useEffect(()=>{
        const selected=sessionStorage.getItem('disability');
        if(selected){
            setSelectedDisabilityID(JSON.parse(selected));
        }
    },[])
    const navigate=useNavigate();
    const disabilities=[
        {id:'1',name:'Dyslexia'},
        {id:'2',name:'Dysgraphia'},
        {id:'3',name:'Dyscalculia'},
        {id:'4',name:'ADHD Attention Defecit Hyperactivity Disorder'},
        {id:'5',name:'APD Auditory Processing Disorder'},
        {id:'6',name:'NVLD Non Verbal Learning Disorder'},
        {id:'7',name:'LPD Language Processing Disorder'}
    ]
    function setDisability(id) {
        setSelectedDisabilityID(id);
        const selected = disabilities.find(disability => disability.id === id);
        if (selected) {
            sessionStorage.setItem('disability', JSON.stringify(selected.id));
        }
        navigate(`/disability/${id}/description`)
    }
    return(
        <div>
            <div className={classes.NavigationContainer}>
                <ul className={classes.NavigationList}>
                    <li className={`${classes.NavigationItem} ${classes.NavigationHeader}`}>
                        List of Disabilities
                    </li>
                    {
                        disabilities.map((disability)=>{
                            return(
                                <li key={disability.id} className={`${classes.NavigationItem} ${selectedDisabilityID===disability.id?classes.selectedItem :''}`}
                                onClick={()=>{setDisability(disability.id)}}>
                                    <div>
                                        {disability.name}
                                    </div>
                                    <div style={{ width: '10px' }}>
                                        {selectedDisabilityID===disability.id&&'>'}
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </div>
    )
}