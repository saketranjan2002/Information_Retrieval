import React from "react";
import classes from "./TrendingPages.module.css"

function TrendingPages(){
    
    const TrendingHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.get("/api/showTrending")

            // console.log(res.data.data);
            props.dataHandler(res.data.data);
        } catch (error) {
            console.log("Error :-");
            console.log(error)
        }
    }

    return (
        <button onClick={TrendingHandler} className={classes.btn}>See What's Trending?</button>
    )
}

export default TrendingPages