import React, { useState, useEffect, useMemo } from 'react';
import './style.css'
import logo from './logo.png'

function SignInPage() {

  return(
    <div className="form">
      <img className="logo" src={ logo} alt="Логотип"/>
      <div className="phone">
        <p className="label-phone">Логин</p>
        <input
        type="text"
        className="form-phone"
        />
      </div>
      <div className="password">
        <p className="label-password">Пароль</p>
        <input
        type="text"
        className="form-password"
        type="password"
        />
      </div>
    <button className="form-button">Войти</button> 
    </div>
    
  )
}

export default SignInPage