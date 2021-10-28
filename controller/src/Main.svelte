<script>

//import { missing_component } from "svelte/internal";

</script>
<style>
  .main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .main-operation {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    margin: 1rem 0;
  }

  .time {
    margin: 0 2rem;
    font: 42px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgba(255, 8, 8, 0.726);
  }

  .button-control {
    margin: 0 2rem;
    height: 2rem;
    width: 3rem;
    border: 1px solid;
    border-color: rgba(255, 8, 8, 0.726);
    background-color: rgba(255, 8, 8, 0.726);
  }

  .operation-conveyor, .operation-heat, .operation-blowing {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 9rem;
  }

  .conveyor-unit, .temperature, .blowing-unit {
    text-align: center;
    margin-block-start: 0em;
    margin-block-end: 0em;
    margin: 0.5rem;
    width: 80%;
    font: 22px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgba(255, 8, 8, 0.726);
  }

  .conveyor, .heat-symbol, .blowing-symbol {
    height: 2rem;
    width: 80%;
    border: 1px solid;
    border-color: rgba(255, 8, 8, 0.726);
    background-color: rgba(255, 8, 8, 0.726);
  }

  .current-operation, .operation-mode {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .operation-name, .operation-finish, .operation-next {
    margin: 1rem 0.5rem;
    font: 22px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.726);
  }

  .operation-value,.operation-time, .operation-next-value {
    margin: 1rem 2rem 1rem 0;
    font: 22px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgba(255, 8, 8, 0.726);
  }

</style>

<div class="main">
  <div class="main-operation">
    <div class="time"> 17.24</div>
    <button class="button-control"></button>
    <div class="operation-conveyor">
      <p class="conveyor-unit">1347 mPm</p>
      <div class="conveyor"></div>
    </div>
    <div class="operation-heat">
      <p class="temperature"> 120 C</p>
      <div class="heat-symbol"></div>
    </div>
    <div class="operation-blowing">
      <p class="blowing-unit">3400 rPm</p>
      <div class="blowing-symbol"></div>
    </div>
  </div>
  <div class="current-operation">
    <p class="operation-name">Current operation mode: </p>
    <p class="operation-value">IDLE</p>
    <p class="operation-finish">Finish in</p>
    <p class="operation-time">120 min</p>
  </div>
  <div class="operation-mode">
    <p class="operation-next">Next operation mode: </p>
    <p class="operation-next-value">MODE2</p>
  </div>
  <div class="operation-timetable">
    <table class="timetable">
      <tr class="current-day">
        <td class="day">понедельник</td>
        <td class="idle"></td>
        <td class="mode"></td>
      </tr>
      <tr class="current-day">
        <td class="day">вторник</td>
        <td class="idle"></td>
        <td class="mode"></td>
      </tr>
      <tr class="current-day">
        <td class="day">среда</td>
        <td class="idle"></td>
        <td class="mode"></td>
      </tr>
      <tr class="current-day">
        <td class="day">четверг</td>
        <td class="idle"></td>
        <td class="mode"></td>
      </tr>
      <tr class="current-day">
        <td class="day">пятница</td>
        <td class="idle"></td>
        <td class="mode"></td>
      </tr>
      <tr class="current-day">
        <td class="day">суббота</td>
        <td class="idle"></td>
        <td class="mode"></td>
      </tr>
      <tr class="current-day">
        <td class="day">воскресенье</td>
        <td class="idle"></td>
        <td class="mode"></td>
      </tr>
    </table>
    <div class="operation-settings"></div>
  </div>
</div>
