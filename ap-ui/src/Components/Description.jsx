import classes from './Description.module.css'
import descriptions from '../Store/description.json'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom';
export default function Description(props){
    const {id}=useParams();
    const selectedDisability=descriptions[id];
    const navigate=useNavigate();
    function handleClick(){
        navigate(`/disability/${id}/simulation`);
    }
    return(
        <div className={classes.descriptionContainer}>
            <div className={classes.contentContainer}>
            <button className={classes.genericButton} onClick={handleClick}>Simulate</button>
            {selectedDisability.sections.map((section, index) => (
                <div key={index}>
                    <h2>{section.heading}</h2>
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
                    {section.closing && (
                        <p>{section.closing}</p>
                    )}
                </div>
            ))}
            </div>
        </div>
  
    )
}