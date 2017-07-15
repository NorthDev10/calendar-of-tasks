<h1 class="header">Календарь</h1>
<div class="row">
  <div id="prevMonth" class="col-md-1 btn btn-default btnNewLine">
    <p>Предыдущий месяц</p>
  </div>
  <div class="col-md-10">
    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th class="fSize20" colspan="7">--/----</th>
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
        <tbody id="calendar"></tbody>
      </table>
    </div> 
  </div>
  <div id="nextMonth" class="col-md-1 btn btn-default btnNewLine">
      <p>Следующий месяц</p>
    </div>
  </div>
  <div class="row">
  <div class="col-md-11 col-md-offset-1">
    <div id="date">--/--/----</div>
    <form id="choosePerson" class="navbar-form navbar-left" role="search">
      <div class="form-group">
        <input type="text" class="form-control" placeholder="Выбрать персону">
        <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"></ul>
      </div>
      <button type="submit" class="btn btn-success">Добавить персону</button>
    </form>
    </div>
    </div>
    <div class="row">
  <div id="tasksList" class="col-md-11 col-md-offset-1 txtCenter"></div>