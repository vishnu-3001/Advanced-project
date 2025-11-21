import classes from './ProblemContext.module.css';

export default function ProblemContext() {
    const problem = sessionStorage.getItem('problem');
    const gradeLevel = sessionStorage.getItem('gradeLevel') || '7th';
    const difficulty = sessionStorage.getItem('difficulty') || 'medium';
    const answer=sessionStorage.getItem('answer')||'NA';
    
    if (!problem) {
        return null;
    }
    
    return (
        <div className={classes.problemContextContainer}>
            <div className={classes.problemHeader}>
                <span className={classes.problemIcon}>📝</span>
                <span className={classes.problemTitle}>Current Problem</span>
            </div>
            <div className={classes.problemContent}>
                {problem}
            </div>
            <div className={classes.problemMeta}>
                <span className={classes.metaBadge}>
                    <span className={classes.metaLabel}>Grade:</span> {gradeLevel}
                </span>
                <span className={classes.metaBadge}>
                    <span className={classes.metaLabel}>Difficulty:</span> {difficulty}
                </span>
                <span className={classes.metaBadge}>
                    <span className={classes.metaLabel}>Correct answer:</span> {answer}
                </span>
                {/* <span className={classes.metaBadge}>
                    <span className={classes.metaLabel}>Student's answer:</span> {difficulty}
                </span> */}
            </div>
        </div>
    );
}
