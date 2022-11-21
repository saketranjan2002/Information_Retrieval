import React from 'react'

import classes from "./Logo.module.css"

function Logo() {
  return (
    <div className = {classes.main}>
        Sci Search
        <div className = {classes.sub}>Computer Science</div>
    </div>
  )
}

export default Logo