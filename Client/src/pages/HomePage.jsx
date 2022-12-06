import React,{useState} from 'react'

import Logo from '../components/Logo/Logo'
import Search from "../components/Search/Search"
// import InfoCard from '../components/InfoCard/InfoCard'
import Pagination from '../components/Pagination/Pagination'
import TrendingPages from '../components/TrendingPages/TrendingPages'
import classes from "./HomePage.module.css"

function HomePage() {

  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(false);

  return (
    <div className = {classes.homepage}>
        <Logo/>
        <Search dataHandler = {setData} setLoading = {setLoading}/>
        <TrendingPages dataHandler = {setData} setLoading = {setLoading} />
        <Pagination data = {data} loading = {loading}/>
    </div>
  )
}

export default HomePage