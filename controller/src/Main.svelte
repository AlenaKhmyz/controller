<script>
  import {onMount} from 'svelte'

  const WEEKDAYS = ["понедельник","вторник","среда","четверг","пятница","суббота","воскресенье"]

  let posts = {}
  let weekdays = []


  onMount(async() => {
  
    const response = await fetch(`http://46.216.22.74:81/give?table`, {
      method: 'GET',
      headers: {'Content-Type': 'text/plain'},
     
    })
    posts = await response.json()
    console.log(posts, posts.table?.weekday)
  });

  
</script>
<style>
  /* .main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .main-operation {
    display: flex;
    flex-direction: row;
    
  }

  .time {

  }

  .button-control {
    margin: 0 2rem;
    
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
    color: rgb(36, 162, 201);
  }

  .conveyor, .heat-symbol, .blowing-symbol {
    height: 2rem;
    width: 80%;
    border: 1px solid;
    border-color: rgb(36, 162, 201);
    background-color: rgb(36, 162, 201);
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
    color: rgb(103, 140, 151);
  }

  .operation-value,.operation-time, .operation-next-value {
   
  }

  .timetable-operation {
    display: flex;
    flex-direction: column;
  }
  
  


  .action, .action-time {
    margin-block-start: 0rem;
    margin-block-end: 0rem;
    font: 20px/1 'Malina', sans-serif;
    font-weight: 500;
    color: rgb(36, 162, 201);
  }

  .operation-settings {
    margin-left: 20px;
  } */

  .container {
    display: flex;
    flex-direction: column;
  }

  .head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .operation-settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
    padding: 2rem 0.5rem;
    border: 2px solid;
    border-color: rgb(209,209,209);
    border-radius: 1rem;
  }

  .settings-word {
    margin-top: 1rem;
    font: 22px/1 sans-serif;
    font-weight: 900;
    color: rgb(103, 140, 151);
  }

  .operations {
    display: flex;
    flex-direction: row;
    margin: 2rem 0 0 4rem;
  }

  .indicator {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .time {
    font: 102px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgb(36, 162, 201);
  }

  .action-operations {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 4rem;
  }

  .indicator-control {
    margin: 25px 20px;
    height: 2rem;
    width: 3rem;
    border: 1px solid;
    border-color: rgb(36, 162, 201);
    background-color: rgb(36, 162, 201);
  }

  .operation-mean {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .operation-name {
    margin: 0.2rem;
    font: 21px/1 'Malina', sans-serif;
    font-weight: 500;
    color: rgb(103, 140, 151);
  }

  .operation-value {
    margin: 0.2rem;
    font: 21px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgb(36, 162, 201);
  }

  .main {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .elements-operations {
    display: flex;
    flex-direction: column;
  }

  .timetable-operation {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    padding: 0.5rem 0 1rem 1.5rem;
  }

  .timetable {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    margin-top: 10px;
  }

  .day {
    width: 160px;
    text-align: center;
    margin-bottom: 4px;
    font: 22px/1 sans-serif;
    font-weight: 900;
    color: rgb(103, 140, 151);
  }
  
  .day-operations {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 41rem;
    margin-left: 10px;
  }

  .operation {
    display: flex;
    flex-direction: row;
    text-align: center;
    align-items: center;
    justify-content: center;
    margin: 0.5rem;
    padding: 0.7rem;
    width: 12rem;
    border: 2px solid;
    border-color: rgb(209,209,209);
  }

  .action {
    margin-right: 0.5rem;
    font: 17px/1 'Malina', sans-serif;
    font-weight: 500;
    color: rgb(103, 140, 151);
  }

  .action-time {
    font: 17px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgb(116, 217, 248);
  }

  .mean {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2.5rem 1rem;
  }

  .symbol {
    height: 2rem;
    width: 3rem;
    border: 1px solid;
    border-color: rgb(36, 162, 201);
    background-color: rgb(36, 162, 201);
  }

  .value {
    margin: 0.5rem;
    font: 22px/1 'Malina', sans-serif;
    font-weight: 700;
    color: rgb(36, 162, 201);
  }

</style>

<div class="container">
  <div class="head">
    <div class="operation-settings"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      width="64px" height="64px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve">
        <g id="settings">
          <path fill="#4c5867"  d="M30.391,12.68l-3.064-0.614c-0.154-0.443-0.336-0.873-0.537-1.289l1.736-2.604
            c0.529-0.793,0.424-1.85-0.25-2.523l-1.924-1.924c-0.387-0.387-0.898-0.586-1.416-0.586c-0.383,0-0.77,0.11-1.107,0.336
            l-2.604,1.735c-0.418-0.202-0.848-0.382-1.291-0.536L19.32,1.61c-0.186-0.936-1.008-1.608-1.961-1.608h-2.72
            c-0.953,0-1.774,0.673-1.961,1.608l-0.614,3.065c-0.443,0.154-0.873,0.335-1.289,0.536L8.172,3.476
            C7.833,3.25,7.447,3.14,7.063,3.14c-0.517,0-1.028,0.199-1.415,0.586L3.725,5.65c-0.674,0.674-0.779,1.73-0.25,2.523l1.735,2.604
            c-0.202,0.417-0.382,0.847-0.536,1.29L1.608,12.68C0.673,12.867,0,13.688,0,14.641v2.72c0,0.953,0.673,1.775,1.608,1.961
            l3.065,0.615c0.154,0.443,0.335,0.873,0.536,1.289L3.475,23.83c-0.529,0.793-0.424,1.85,0.25,2.523l1.924,1.924
            c0.387,0.387,0.898,0.586,1.415,0.586c0.384,0,0.771-0.111,1.108-0.336l2.604-1.736c0.417,0.203,0.847,0.383,1.29,0.537
            l0.613,3.064c0.187,0.936,1.008,1.609,1.961,1.609h2.72c0.953,0,1.775-0.674,1.961-1.609l0.615-3.064
            c0.443-0.154,0.873-0.336,1.289-0.537l2.604,1.736c0.338,0.225,0.725,0.336,1.107,0.336c0.518,0,1.029-0.199,1.416-0.586
            l1.924-1.924c0.674-0.674,0.779-1.73,0.25-2.523l-1.736-2.604c0.203-0.418,0.383-0.848,0.537-1.291l3.064-0.613
            C31.326,19.137,32,18.314,32,17.361v-2.72C32,13.688,31.326,12.867,30.391,12.68z M26.934,17.975
            c-0.695,0.139-1.264,0.635-1.496,1.305c-0.129,0.369-0.279,0.727-0.447,1.074c-0.311,0.639-0.258,1.393,0.135,1.982l1.736,2.604
            l-1.924,1.924l-2.604-1.736c-0.334-0.223-0.721-0.336-1.109-0.336c-0.297,0-0.596,0.066-0.871,0.199
            c-0.348,0.168-0.705,0.32-1.076,0.449c-0.668,0.232-1.164,0.801-1.303,1.496l-0.615,3.066h-2.72l-0.613-3.066
            c-0.139-0.695-0.635-1.264-1.304-1.496c-0.369-0.129-0.728-0.279-1.075-0.447c-0.276-0.135-0.574-0.201-0.872-0.201
            c-0.389,0-0.775,0.113-1.109,0.336l-2.604,1.736l-1.924-1.924l1.735-2.604c0.393-0.59,0.444-1.344,0.137-1.98
            c-0.168-0.348-0.319-0.705-0.448-1.076c-0.232-0.668-0.802-1.164-1.496-1.303l-3.065-0.615L2,14.641l3.066-0.613
            c0.694-0.139,1.264-0.635,1.496-1.304c0.129-0.369,0.278-0.728,0.447-1.075c0.31-0.638,0.258-1.392-0.136-1.981L5.139,7.064
            L7.062,5.14l2.604,1.735C10,7.098,10.387,7.211,10.775,7.211c0.297,0,0.595-0.066,0.871-0.199c0.347-0.168,0.705-0.319,1.075-0.448
            c0.669-0.232,1.165-0.802,1.304-1.496l0.614-3.065l2.72-0.001l0.613,3.066c0.139,0.694,0.635,1.264,1.305,1.496
            c0.369,0.129,0.727,0.278,1.074,0.447c0.277,0.134,0.574,0.2,0.873,0.2c0.389,0,0.775-0.113,1.109-0.336l2.604-1.735l1.924,1.924
            l-1.736,2.604c-0.393,0.59-0.443,1.343-0.137,1.98c0.168,0.347,0.32,0.705,0.449,1.075c0.232,0.669,0.801,1.165,1.496,1.304
            l3.064,0.614L30,17.361L26.934,17.975z"/>
          <path fill="#4c5867" d="M16,9.001c-3.865,0-7,3.135-7,7c0,3.866,3.135,7,7,7s7-3.135,7-7C23,12.136,19.865,9.001,16,9.001z
            M16,22.127c-3.382,0-6.125-2.744-6.125-6.125c0-3.382,2.743-6.125,6.125-6.125c3.381,0,6.125,2.743,6.125,6.125
            C22.125,19.383,19.381,22.127,16,22.127z"/>
          <path fill="#4c5867" d="M16,12.001c-2.21,0-4,1.79-4,4c0,2.209,1.79,4,4,4c2.209,0,4-1.791,4-4C20,13.792,18.209,12.001,16,12.001z
            M16,19.002c-1.656,0-3-1.344-3-3c0-1.656,1.344-3,3-3s3,1.344,3,3C19,17.658,17.656,19.002,16,19.002z"/>
        </g>
      </svg>
      <p class="settings-word">Настройки</p>
    </div>
    <div class="operations">
      <div class="indicator">
        <!-- <button class="indicator-control"></button> -->
        <div class="time"> 17.24</div>
      </div>
      <div class="action-operations">
        <div class="operation-mean">
          <p class="operation-name">Текущий режим работы:</p>
          <p class="operation-value">IDLE</p>
        </div>
        <div class="operation-mean">
          <p class="operation-name">Закончится в</p>
          <p class="operation-value">120 min</p>
        </div>
        <div class="operation-mean">
          <p class="operation-name">Следующий режим работы: </p>
          <p class="operation-value">MODE2</p>
        </div>
      </div>
    </div> 
  </div>
  <div class="main">
    <div class="timetable-operation">
      {#each (posts.table?.weekday || []) as weekday, dayIndex}
        {#if weekday}
        <div class="timetable">
        
        <div class="days">
          <p class="day">{WEEKDAYS[dayIndex]}</p> 
        </div>
        
          <div class="day-operations">
            {#each (weekday || []) as operation}
            <div class="operation">
              <p class="action">{operation?.mode}</p>
              <p class="action-time">{operation?.time}</p>
              <p class="action-time">{operation?.preparemin}</p>
            </div>
            <!-- <div class="operation">
              <p class="action">IDLE{weekday?.mode}</p>
              <p class="action-time">17:20</p>
            </div>
            
            <div class="operation">
              <p class="action">IDLE{weekday?.mode}</p>
              <p class="action-time">17:20</p>
            </div>
            
            <div class="operation">
              <p class="action">MODE1</p>
              <p class="action-time">17:20-20:40</p>
            </div>
            
            <div class="operation">
              <p class="action">MODE2</p>
              <p class="action-time">20:40-23:50</p> 
            </div> -->
          {/each}
          </div> 
     
        </div>
        {/if}
       {/each}
      <!-- <div class="timetable">
        <div class="days">
          <p class="day">вторник</p> 
        </div>
        <div class="day-operations">
          <div class="operation">
            <p class="action">IDLE</p>
            <p class="action-time">17:20</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE1</p>
            <p class="action-time">17:20-20:40</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE2</p>
            <p class="action-time">20:40-23:50</p>
          </div>
          
        </div>
        
      </div>
      <div class="timetable">
        <div class="days">
          <p class="day">среда</p> 
        </div>
        <div class="day-operations">
          <div class="operation">
            <p class="action">IDLE</p>
            <p class="action-time">17:20</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE1</p>
            <p class="action-time">17:20-20:40</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE2</p>
            <p class="action-time">20:40-23:50</p>
          </div>
          
        </div>
        
      </div>
      <div class="timetable">
        <div class="days">
          <p class="day">четверг</p> 
        </div>
        <div class="day-operations">
          <div class="operation">
            <p class="action">IDLE</p>
            <p class="action-time">17:20</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE1</p>
            <p class="action-time">17:20-20:40</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE2</p>
            <p class="action-time">20:40-23:50</p>
          </div>
          
        </div>
      </div>
      <div class="timetable">
        <div class="days">
          <p class="day">пятница</p> 
        </div>
        <div class="day-operations">
          <div class="operation">
            <p class="action">IDLE</p>
            <p class="action-time">17:20</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE1</p>
            <p class="action-time">17:20-20:40</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE2</p>
            <p class="action-time">20:40-23:50</p>
          </div>
          
        </div>  
      </div>
      <div class="timetable">
        <div class="days">
          <p class="day">суббота</p> 
        </div>
        <div class="day-operations">
          <div class="operation">
            <p class="action">IDLE</p>
            <p class="action-time">17:20</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE1</p>
            <p class="action-time">17:20-20:40</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE2</p>
            <p class="action-time">20:40-23:50</p>
          </div>
          
        </div> 
      </div>
      
      <div class="timetable">
        <div class="days">
          <p class="day">воскресенье</p> 
        </div>
        <div class="day-operations">
          <div class="operation">
            <p class="action">IDLE</p>
            <p class="action-time">17:20</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE1</p>
            <p class="action-time">17:20-20:40</p>
          </div>
          
          <div class="operation">
            <p class="action">MODE2</p>
            <p class="action-time">20:40-23:50</p>
          </div>
          
        </div>    
      </div> -->
    </div>
    <div class="elements-operations">
      <div class="mean">
        <p class="value">1347mPm</p>
        <div class="symbol"></div>
      </div>
      <div class="mean">
        <p class="value">3400mPm</p>
        <div class="symbol"></div>
      </div>
      <div class="mean">
        <p class="value">120C</p>
        <div class="symbol"></div>
      </div>
    </div>
  </div>
</div>