import React, { useState, useEffect, useMemo } from 'react';

function SignInPage() {

  return(
    <div className="form">
      <p className="form-title">Turbo Chef</p>
      <input
        type="text"
        placeholder="phone"
        className="form-phone"
      />
      <input
        type="text"
        placeholder="password"
        className="form-password"
        type="password"
      />
    <button className="form-button">Sign in</button> 
    </div>
    
  )
}