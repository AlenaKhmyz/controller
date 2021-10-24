import React, { useState, useEffect, useMemo } from 'react';
import './style.css'


function MainPage() {

  return(
    <div className="main">
      <div className="main-operation">
        <div className="time"></div>
        <div className="button-control"></div>
        <div className="operation-conveyor">
          <p className="conveyor-unit"></p>
          <div className="conveyor"></div>
        </div>
      </div>
      
    </div>
    
  )
}

export default MainPage