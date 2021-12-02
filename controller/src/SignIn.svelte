<!-- 1) подключение шрифтов -->

<script>
  	import { push, replace, location } from "svelte-spa-router";
  let password = 'test';
  let login = 'test';
  let src = "images/logo.png";
  const submit = async() => {
    const response = await fetch('http://46.216.9.22:81/auth', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      //credentials: 'include',
      body: new URLSearchParams({
        login,
        password
      })
    })
    const data = await response.json()
    if(data.authorized == true){
      // sessionStorage.setItem("authtoken", data.token)
      document.cookie = "authtoken=" + data.token
      replace("/")
    } else {
      alert("Wrong authorisation data.");
    }
    
  }

</script>

<div class="form">
  <img class="logo" {src} alt="Логотип"/>
  <div class="phone">
    <input
    type="text"
    class="form-phone"
    placeholder="Логин"
    bind:value={login} onChange={(event) => {login(event.target.value)}}
    />
  </div>
  <div class="password">
    <input
    class="form-password"
    placeholder="Пароль"
    type="password"
    bind:value={password} onChange={(event) => {password(event.target.value)}}
    />
  </div>
  <div class="button">
    <button class="form-button" type="submit" on:click|preventDefault={submit}>Войти</button> 
  </div>
</div>

<style>
  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .phone, .password, .button, .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 20rem;
    margin-bottom: 10px;
  }

  .form-phone, .form-password {
    width: 100%;
    height: 2.2rem;
    border: 1px solid grey;
    border-radius: 5px;
    padding: 0 5px;
  }

  .button {
    display: flex;
    justify-content: end;
  }

  .form-button {
    width: 100%; 
    height: 3rem;
    font: 22px/1 'Malina', sans-serif;
    letter-spacing: -.5px;
    -webkit-font-smoothing: antialiased;
    border: 1px solid rgb(36, 162, 201);
    border-radius: 5px;
    background-color: rgb(36, 162, 201);
    color: rgb(255, 255, 255);
  }

</style>


