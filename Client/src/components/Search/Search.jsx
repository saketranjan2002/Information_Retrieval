import React,{useRef} from 'react'
import axios from "axios"

import classes from "./Search.module.css"

function Search(props) {

    const searchRef = useRef();

    const searchHandler = async (e) => {
        e.preventDefault();

        const qry = searchRef.current.value;

        try {
            const res = await axios.post("/api/search",{
                query:qry,
            })

            // console.log(res.data.data);
            props.dataHandler(res.data.data);
        } catch (error) {
            console.log("Error :-");
            console.log(error)
        }
    }

    return (
        <>
            <form className = {classes.search} onSubmit = {searchHandler}>
                <input ref = {searchRef} type="text" />
                <button type='submit'><i className="fa-solid fa-magnifying-glass"></i></button>
                <div className = {classes.blur}></div>
            </form>
        </>

    )
}

export default Search