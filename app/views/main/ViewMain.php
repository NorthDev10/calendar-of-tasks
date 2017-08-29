<h1 class="header">Календарь</h1>
<div class="row" id="calendar">
  <div v-on:click="prevMonth" class="col-md-1 btn btn-default btnNewLine">
    <p>Предыдущий месяц</p>
  </div>
  <div class="col-md-10">
    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th class="fSize20" colspan="7">{{weeksObj.month}}/{{weeksObj.year}}</th>
          </tr>
          <tr>
            <th>Пн</th>
            <th>Вт</th>
            <th>Ср</th>
            <th>Чт</th>
            <th>Пт</th>
            <th>Сб</th>
            <th>Вс</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            is="weeks"
            v-for="(week, index) in weeksObj.weeks"
            v-bind:key="index"
            v-bind:week-obj="week"
            v-bind:selected-day="selectedDay"
          ></tr>
        </tbody>
      </table>
    </div> 
  </div>
  <div v-on:click="nextMonth" class="col-md-1 btn btn-default btnNewLine">
      <p>Следующий месяц</p>
    </div>
  </div>
  <div class="row">
  <div class="col-md-11 col-md-offset-1" id="choosePerson">
    <div id="date">{{day}}/{{month}}/{{year}}</div>
    <form class="navbar-form navbar-left" role="search">
      <div class="form-group">
        <input 
          type="text" 
          class="form-control" 
          v-on:focus="getPersonnel" 
          v-on:focusout="hideListPersonnel" 
          v-bind:disabled="disabled"
          v-model="userName"
          v-on:keyup="findUserByName"
          placeholder="Выбрать персону">
        <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" v-bind:class="classObject.menu">
          <li>
            <a href="#" v-on:click.prevent="choosePerson(user)" v-for="user in personnel">{{user.name}}</a>
          </li>
        </ul>
      </div>
      <button type="submit" class="btn btn-success" v-on:click.prevent="addNewUser" v-bind:disabled="disabled">Добавить персону</button>
    </form>
    </div>
    </div>
    <div class="row">
    <div id="tasksList" class="col-md-11 col-md-offset-1 txtCenter">
      <person
          v-for="(personTasks, index) in personsTasksObj"
          v-bind:key="index"
          v-bind:person-tasks="personTasks"
      ></person>
    </div>
  </div>