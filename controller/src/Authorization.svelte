<script>
  import { missing_component } from "svelte/internal";
  let paragraphs = [
    {id: 1, text: 'Независимая точка доступа'},
    {id: 2, text: 'Подключиться к существующей сети'},
  ];

  let selected;

  let value = "";
</script>


<style>
  .settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .authorization, .settings-wi-fi, .controller {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  .title {
    font: 30px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgb(36, 162, 201);
  }

  .login, .password {
    width: 70%;
    margin: 1rem 0;
  }

  input {
    width: 100%;
    height: 2rem;
    border: 1px solid rgb(103, 140, 151);
    border-radius: 5px;
    padding: 0 5px;
    font: 15px/1 sans-serif;
    color: rgb(103, 140, 151);
  }

  .authoraization-button, .settings-wi-fi-button {
    width: 70%; 
    height: 3rem;
    font: 22px/1 'Malina', sans-serif;
    letter-spacing: -.5px;
    -webkit-font-smoothing: antialiased;
    border: 1px solid rgb(36, 162, 201);
    border-radius: 5px;
    background-color: rgb(36, 162, 201);
    color: rgb(255, 255, 255);
  }

  .access-point {
    margin-bottom: 20px;
  }

  .block-paragraphs {
    margin-right: 7px;
    font: 19px/1 'Malina', sans-serif;
    font-weight: 500;
    color: rgb(36, 162, 201);
  }

  .paragraphs {
    width: 60.5%;
    height: 2rem;
    border: 1px solid rgb(103, 140, 151);
    border-radius: 5px;
    padding: 0 5px;
    font: 15px/1 sans-serif;
    color: rgb(103, 140, 151);
  }

  .name-paragraphs {
    padding: 10px;
    font: 15px/1 sans-serif;
    color: rgb(103, 140, 151);
  }

  .access-point, .ssid {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }

  .confirm {
    display: flex;
    flex-direction: row;
    margin-right: 10px;
  }

  .reset, .restart {
    width: 70%; 
    height: 3rem;
    font: 17px/1 'Malina', sans-serif;
    -webkit-font-smoothing: antialiased;
    border: 1px solid rgb(36, 162, 201);
    border-radius: 5px;
    background-color: rgb(36, 162, 201);
    color: rgb(255, 255, 255);
  }

  .controller {
    margin-bottom: 30px;
  }

</style>


<div class="settings">
<!-- Блок авторизации -->
  <div class="authorization">
    <h2 class="title">Авторизационные данные</h2>
    <div class="login">
      <div class="current-login">
        <input class="current-login-input-field" placeholder="Текущий логин" type="text">
      </div>
       <div class="new-login">
        <input class="current-login-input-field" placeholder="Новый логин" type="text">
      </div>
    </div>
    <div class="password">
      <div class="current-password">
        <input class="current-password-input-field" placeholder="Текущий пароль" type="password">
      </div>
      <div class="new-password">
        <input class="new-password-input-field" placeholder="Новый пароль" type="password">
      </div>
      <div class="confirmation-password">
        <input class="confirmation-password-input-field" placeholder="Подтвердите пароль" type="password">
      </div>
    </div>
    <button class="authoraization-button">Подтвердить</button>
  </div>
<!-- Блок  настройки Wi-Fi -->
  <div class="settings-wi-fi">
    <h2 class="title">Настройки wi-fi</h2>
    <div class="access-point">
      <p class="block-paragraphs">Выберите пункт:</p>
      <select value={selected} on:change="{() => value = ''}" class="paragraphs">
        {#each paragraphs as paragraph}
          <option value={paragraph} class="name-paragraphs">
            {paragraph.text}
          </option>
		    {/each}
      </select>
    </div>
    <div class="ssid">
      <input class="confirm" placeholder="Введите SSID" type="text">
      <input class="confirm" placeholder="Введите пароль" type="password">
    </div>
    <button class="settings-wi-fi-button">Подтвердить</button>
  </div>
<!--Блок настройи контроллера-->
  <div class="controller">
    <h2 class="title">Настройки контроллера</h2>
    <button class="reset">Сброс настроек</button>
    <button class="restart">Рестарт микроконтроллера</button>
  </div>
</div>