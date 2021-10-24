import React, { useState, useEffect, useMemo } from 'react';
import './style.css'
import logo from './logo.png'

function SignInPage() {
  const [password, setPassword] = useState('')
  const[login, setLogin] = useState('')

  const onSave = () => {
    return console.log(password, login)
  }

  return(
    <div className="form">
      <img className="logo" src={ logo} alt="Логотип"/>
      <div className="phone">
        <input
        type="text"
        className="form-phone"
        placeholder="Логин"
        value={login} onChange={(event) => {setLogin(event.target.value)}}
        />
      </div>
      <div className="password">
        <input
        type="text"
        className="form-password"
        placeholder="Пароль"
        type="password"
        value={password} onChange={(event) => {setPassword(event.target.value)}}
        />
      </div>
      <div className="button">
        <button className="form-button" onClick={onSave}>Войти</button> 
      </div>
    </div>
    
  )
}

export default SignInPage