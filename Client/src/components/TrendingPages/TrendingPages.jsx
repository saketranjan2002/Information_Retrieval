import React from "react";
import classes from "./TrendingPages.module.css"
import axios from "axios";

function TrendingPages(props){

    const TrendingHandler = async (e) => {
        e.preventDefault();
        try {
            props.setLoading(true);
            const res = await axios.get("/api/showTrending")

            // console.log(res.data.data);
            props.setLoading(false);
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