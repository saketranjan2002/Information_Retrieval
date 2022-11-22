import React from 'react'

import classes from "./InfoCard.module.css"

function InfoCard(props) {

    // console.log("dos :-")
    // console.log(props.doc);

    // console.log(props.doc.title[0]);
    // console.log(eval(props.doc.author[0]));

    return (
    <div className = {classes.card}>
        <div className = {classes.title}>{props.doc.title[0]}</div>
        <div className = {classes.authors}>
            {eval(props.doc.author[0]).map((obj,idx) => {

                if(idx < 3){
                    return(
                        <span className = {classes.author}>
                            {obj.name},&nbsp;
                        </span>)
                }
                else{
                    return (<span></span>);
                }
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
    )
}

export default InfoCard