import React,{useState} from 'react'
import axios from "axios"

import classes from "./InfoCard.module.css"

function InfoCard(props) {

    const [isCheck,setIsChecked] = useState(false);

    const getFeedback = async () => {
        if(!isCheck){
            setIsChecked(true);

            const res = await axios.post("/api/giveFeedback", {
                id: props.doc.id
            })

            if(res.data.success){
                setTimeout(() => {setIsChecked(false)},2000)
            }
        }
    }

    // console.log(props.doc);

    return (
    <div className = {classes.card}>
        <div className = {classes.content}>
            <div className = {classes.title}>{props.doc.title[0]}</div>
            <div className = {classes.authors}>
                {/* {eval(props.doc.author[0]).map((obj,idx) => {

                    if(idx < 3){
                        return(
                            <span className = {classes.author}>
                                {obj.name},&nbsp;
                            </span>)
                    }
                    else{
                        return (<span></span>);
                    }
                })} */}

                {eval(props.doc.author[0]).map((auth) => {
                    return (
                        <span className = {classes.author}>
                            {auth.name},&nbsp;
                        </span>
                    )
                })}
                
            </div>
            <div className = {classes.links}>{
                eval(props.doc.link[0]).map((obj) => {
                    return(
                        <>
                            <a href= {obj.href} className = {classes.link} target = "_blank" rel = "noopener noreferrer">{obj.href}</a>
                            <span> | </span>
                        </>
                    )
                })}
            </div>
        </div>
        <div className = {`${classes.feedback} ${isCheck? classes.green:""}`}>
            <i class="fa-regular fa-thumbs-up" onClick = {getFeedback}></i>
        </div>
    </div>
    )
}

export default InfoCard