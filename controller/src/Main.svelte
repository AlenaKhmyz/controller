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
    font: 22px/1 sans-serif;
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
    color: rgb(76,88,103);
  }

  .operation-value,.operation-time, .operation-next-value {
    margin: 1rem 2rem 1rem 0;
    font: 22px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgba(255, 8, 8, 0.726);
  }

  .timetable {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }

  .day {
    margin-bottom: 4px;
    font: 22px/1 sans-serif;
    font-weight: 900;
    color: rgb(76,88,103);
  }
  
  .day-operations {
    display: flex;
    flex-direction: row;
    width: 40rem;
    margin-left: 20px;
  }

  .operation {
    display: flex;
    flex-direction: column;
    text-align: center;
    height: 4.7rem;
    padding: 1rem;
    border: 2px solid;
    border-color: rgb(209,209,209);
    background-color: rgb(209, 209, 209);
  }

  .triangle-right {
    position: relative;
    margin-right: 20px;
    width: 0;
    height: 0;
    border-top: 37.5px solid transparent;
    border-left: 40px solid rgb(209, 209, 209);
    border-bottom: 37.5px solid transparent;
  } 


  .action, .action-time {
    margin-block-start: 0rem;
    margin-block-end: 0rem;
    font: 20px/1 'Malina', sans-serif;
    font-weight: 500;
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
    <div class="timetable">
      <div class="days">
        <p class="day">понедельник</p> 
      </div>
      <div class=day-operations>
        <div class="operation">
          <p class="action">IDLE</p>
          <p class="action-time">17:20</p>
        </div>
        <div class="triangle-right"></div>
        <div class="operation">
          <p class="action">MODE1</p>
          <p class="action-time">17:20-20:40</p>
        </div>
        <div class="triangle-right"></div>
         <div class="operation">
          <p class="action">MODE2</p>
          <p class="action-time">20:40-23:50</p>
        </div>
        <div class="triangle-right"></div>
      </div>
    </div>
    <div class="operation-settings"></div>
  </div>
</div>
