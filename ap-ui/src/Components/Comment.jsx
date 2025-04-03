import { useEffect, useRef } from "react";
import classes from "./Comment.module.css"

export default function Comment() {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, []);
  function handleClose(){
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  }
  return (
    <div>
      <dialog ref={dialogRef} className={classes.dialog}>
        <h3>Enter your findings</h3>
        <textarea className={classes.textarea}></textarea>
        <button onClick={handleClose} className={classes.button}>Generate</button>
      </dialog>
    </div>
  );
}
