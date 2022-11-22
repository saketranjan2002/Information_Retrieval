import React,{useState} from 'react'

import Logo from '../components/Logo/Logo'
import Search from "../components/Search/Search"
import InfoCard from '../components/InfoCard/InfoCard'
import Pagination from '../components/Pagination/Pagination'

import classes from "./HomePage.module.css"

function HomePage() {

  const [data,setData] = useState([]);

  // console.log("data :-")
  // console.log(data);

  
  // const posts = data.do.slice(indexOfFirstPost,indexOfLastPost);

  return (
    <div className = {classes.homepage}>
        <Logo/>
        <Search dataHandler = {setData}/>
        {/* <div className = {classes.res}>
          {
            data.docs?.map((doc,idx) => {
              return (<InfoCard  key = {idx} doc = {doc}/>)
            })
          }
        </div> */}
        <Pagination data = {data}/>
    </div>
  )
}

export default HomePage