import classes from './Simulation.module.css'
import simulations from '../Store/simulations.json'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function Simulation(){
    const {id}= useParams();
    const simulation=simulations[id];
    const navigate=useNavigate();
    function handleClick(){
        navigate(`/disability/${id}/description`);
    }
    return(
        <div className={classes.simulationContiainer}>
            <button className={classes.genericButton} onClick={handleClick}>Description</button>
            <button className={classes.genericButton} onClick={handleClick}>Generate</button>
            <h2>{simulation.title}</h2>
            {
                simulation.sections.map((section,index)=>{
                    return(
                        <div key={index}>
                            <h3>{section.heading}</h3>
                            {typeof section.content === 'string' && (
                        <p>{section.content}</p>
                    )}
                    {Array.isArray(section.content) && (
                        <ul>
                            {section.content.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    )}
                            </div>
                    )
                })
            }
        </div>
    )
}