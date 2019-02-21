import React from 'react'
import { notFound } from '../styles/Switcher.css'

export default error =>
  <div className="notFound">
    <br/><br/><br/><br/>
    <div>
      ERROR: {error.message}
    </div>
    <br/><br/><br/><br/>
  </div>
