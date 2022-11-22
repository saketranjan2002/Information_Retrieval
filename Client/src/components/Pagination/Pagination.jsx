import React,{useState} from 'react'
import InfoCard from '../InfoCard/InfoCard';

import classes from "./Pagination.module.css"

function Pagination(props) {
    const [currentPage,setCurrentPage] = useState(1);
    const [docsPerPage,setDocsPerPage] = useState(10);
    // const [pageNo,setPageNo] = useState(1);

    const indexOfLastDoc = currentPage*docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    let totalDocs = 0;

    if(props.data.docs){
        totalDocs = props.data.docs.length;
    }

    let totalPages = Math.ceil(totalDocs/docsPerPage);

    // console.log(totalDocs)

    const incHandler = () => {
        if(currentPage < totalPages){
            setCurrentPage(currentPage + 1);
        }
    }

    const decHandler = () => {
        if(currentPage >  1){
            setCurrentPage(currentPage -1)
        }
    }

    return (
        <div className = {classes.div}>
            <div className= {classes.res}>
                {
                    props.data?.docs && 
                    props.data.docs.slice(indexOfFirstDoc,indexOfLastDoc).map((doc,idx) => {
                        return (<InfoCard  key = {idx} doc = {doc}/>)
                      })
                }
            </div>
            <div className= {classes.navigate}>
                {props.data?.docs && 
                    <>
                        <button onClick = {decHandler}>&lt;</button>
                        <div>{currentPage}</div>
                        <button onClick = {incHandler}>&gt;</button>
                    </>
                }
            </div>
        </div>
    )
}

export default Pagination