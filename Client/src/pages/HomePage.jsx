import React,{useState} from 'react'

import Logo from '../components/Logo/Logo'
import Search from "../components/Search/Search"
// import InfoCard from '../components/InfoCard/InfoCard'
import Pagination from '../components/Pagination/Pagination'
import TrendingPages from '../components/TrendingPages/TrendingPages'
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
        <TrendingPages dataHandler = {setData} />
        <Pagination data = {data}/>
    </div>
  )
}

export default HomePage