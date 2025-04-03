import classes from './Datapoint.module.css'
export default function Datapoint({reasons,approaches,mistakes,question,id}){
    return(
        <div className={classes.tile}>
            <span>Question {id}</span>
            <p>{question}</p>
            <span className={classes.span}>Mistakes</span>
            <ul>
            {
                mistakes.map((reason,index)=>{
                    return <li key={index}>{reason}</li>
                })
            }
            </ul>
            <span className={classes.span}>Reasons</span>
            <ul>
            {
                reasons.map((reason,index)=>{
                    return <li key={index}>{reason}</li>
                })
            }
            </ul>
            <span className={classes.span}>Approaches</span>
            <ul>
            {
                approaches.map((reason,index)=>{
                    return <li key={index}>{reason}</li>
                })
            }
            </ul>
            {/* <span>Enter you comments to refine the questions</span>
            <textarea></textarea> */}
        </div>
    )
}