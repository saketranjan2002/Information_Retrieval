import React,{useState} from 'react'

import Logo from '../components/Logo/Logo'
import Search from "../components/Search/Search"
import InfoCard from '../components/InfoCard/InfoCard'

import classes from "./HomePage.module.css"

function HomePage() {

  const [data,setData] = useState([]);

  // console.log("data :-")
  // console.log(data);

  return (
    <div className = {classes.homepage}>
        <Logo/>
        <Search dataHandler = {setData}/>
        <div className = {classes.res}>
          {
            data.docs?.map((doc) => {
              return (<InfoCard doc = {doc}/>)
            })
          }
        </div>
    </div>
  )
}

export default HomePage