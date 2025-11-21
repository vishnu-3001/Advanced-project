import classes from './Description.module.css'
import descriptions from '../Store/description.json'
import { useParams } from 'react-router-dom';
import ProblemContext from './ProblemContext';

export default function Description(props){
    const {id} = useParams();
    const selectedDisability = descriptions[id];
    
    return(
        <div className={classes.descriptionContainer}>
            <ProblemContext />
            <div className={classes.contentContainer}>
                <h1 className={classes.disabilityTitle}>{selectedDisability.name}</h1>
                <p className={classes.disabilitySubtitle}>{selectedDisability.description}</p>
                
                {selectedDisability.sections.map((section, index) => (
                    <div key={index}>
                        <h2 className={classes.sectionTitle}>{section.heading}</h2>
                        
                        {typeof section.content === 'string' && (
                            <p className={classes.sectionContent}>{section.content}</p>
                        )}
                        
                        {Array.isArray(section.content) && (
                            <ul className={classes.sectionList}>
                                {section.content.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        )}
                        
                        {section.closing && (
                            <div className={classes.highlightBox}>
                                <p>{section.closing}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}