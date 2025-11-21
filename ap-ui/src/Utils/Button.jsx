import classes from "./Button.module.css";
export default function Button({children,disabled,isActive,...props}){
    let classname=`${classes.genericButton} ${disabled?classes.disabled:''}`;
    classname=`${classes.genericButton} ${isActive?classes.active:''}`;
    return(
        <button {...props} className={classname} disabled={disabled}>{children}</button>
    )
}