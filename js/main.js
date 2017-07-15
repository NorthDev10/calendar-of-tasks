$(document).ready(function() {
  Calendar.loadCalendar(new Date().getFullYear(), new Date().getMonth()+1);
  $("#prevMonth").on('click', function() {
    var date = Calendar.prevMonth();
    Calendar.loadCalendar(date.year, date.month);
  });
  $("#nextMonth").on('click', function() {
    var date = Calendar.nextMonth();
    Calendar.loadCalendar(date.year, date.month);
  });
  $('#calendar').on('click', 'td', function() {
    var date = $(this).attr("data-date");
    if(date != undefined) {
      var obj = Calendar.getSelectDay();
      if(obj != undefined) {
        $(".temporaryTask").remove();
        $(obj).removeClass("selectedDay");
      }
      $(this).addClass("selectedDay");
      Calendar.setSelectDay(this);
      $("#date").html(
        Calendar.getDay(date) + '/' + 
        Calendar.getMonth(date) + '/' + 
        new Date().getFullYear(date)
      );
      $("#choosePerson input").removeAttr("disabled");
      Calendar.getUsersTasks();
    }
  });
  $('#choosePerson input').on('keyup', function() {
    if($(this).val().length > 3) {
      $('#choosePerson ul').css("display", "block");
      $("#choosePerson button").removeAttr("disabled");
      Calendar.getUserName($(this).val());
    } else $("#choosePerson button").attr("disabled", "disabled");
  });
  $('#choosePerson input').on('focus', function() {
    $('#choosePerson ul').css("display", "block");
    Calendar.getUsers();
    $(this).on('focusout', function() {
      setTimeout(function() {
        $('#choosePerson ul').css("display", "none");
      }, 200);
    });
  });
  $('#choosePerson button').on('click', function(e) {
    e.preventDefault();
    Calendar.addNewUser();
  });
  $('#choosePerson').on('click', 'li', function(e) {
    e.preventDefault();
    Calendar.choosePersona(this);
  });
  $('#tasksList').on('click', 'button', function(e) {
    e.preventDefault();
    if($(this).siblings("input").val().length > 0) {
      Calendar.addNewTask(this);
    }
  });
  $('#tasksList').on('click', '.closeTask', function(e) {
    e.preventDefault();
    if(confirm("Отменить задачу?")) {
      Calendar.cancelTask(this);
    }
  });
  $('#tasksList').on('click', '.cbTask', function(e) {
    Calendar.updateTaskStatus(this);
  });
});

var Calendar = (function() {

  var year;
  var month;
  var selectedDay;

  function printCalendar(Users) {
    $("#calendar").html('');
    $("table .fSize20").text(month + '/' + year);
    var html = '<tr>';
    var dayofweek = Users.firstDayOfWeek;
    dateParse(Users);
    for(var j = 1, day; j <= Users.daysInMonth;) {
      for(var i = 1; i <= 7; ++i) {
        if(i >= dayofweek && j <= Users.daysInMonth) {
          day = j;
          if(day < 10) day = '0' + day;
          html += '<td ';
          if((day == new Date().getDate()) && (month == new Date().getMonth()+1) 
              && (year == new Date().getFullYear())) {
            html += 'class="today"';
          }
          html += ' data-date="'+ year + '-' + month + '-' + day +'">';
          html += tasksInThisDay(j, Users);
          html += '</td>';
          ++j;
        } else {
          html += '<td></td>';
        }
      }
      html += '</tr>';
      $("#calendar").html(html);
      dayofweek = 1;
    }
  }

  function tasksInThisDay(thisDay, usersPerform) {
    if(thisDay < 10) thisDay = '0' + thisDay;
    var html = '<div class="row"><div class="col-md-4 calendarCellFont">';
        html = html + thisDay + '</div>';
        html = html + '<div class="col-md-8 calendarCellBorder">';
    for(var i = 0; i < usersPerform.usersPerform.length; ++i) {
      if(thisDay == usersPerform.usersPerform[i].date.day) {
        html = html + '<p data-uID="'+usersPerform.usersPerform[i].uID+'">' 
            + usersPerform.usersPerform[i].name;
        var completedTasks = parseInt(usersPerform.usersPerform[i].completedTasks, 10);
        var InProcess = parseInt(usersPerform.usersPerform[i].InProcess, 10);
        html = html + ' <span class="badge" title="Выполнено '+ 
          completedTasks
           +' из '+ 
          (InProcess+completedTasks)
           +'">'+ completedTasks +'/'+ 
           (InProcess+completedTasks)
            +'</span></p>';
      }
    }
    html = html + '</div></div>';
    return html;
  }

  function printUsersTasks(usersTasks, addUser) {
    var html = "";
    for(var i = 0; i < usersTasks.length; ++i) {
      html = html + '<div class="person"><div class="head">';
      html = html + usersTasks[i].userName + '</div>';
      html = html + '<div class="bodyPerson"><ul>';
      for(var j = 0; j < usersTasks[i].userTasks.length; ++j) {
        html = html + '<li ';
        if(usersTasks[i].userTasks[j].status == "1") {
          html = html + 'class="taskComplete"';
        }
        html = html + '><input class="cbTask" data-idTask="'+usersTasks[i].userTasks[j].taskId+'" type="checkbox"';
        if(usersTasks[i].userTasks[j].status == "1") {
          html = html + 'checked';
        }
        html = html + '> ' + usersTasks[i].userTasks[j].taskName;
        html = html + '<span data-uid="'+usersTasks[i].userId+'" data-idTask="'+usersTasks[i].userTasks[j].taskId+'"';
        html = html + ' class="glyphicon glyphicon-remove closeTask"></span></li>';
      }
      html = html + '</ul><input type="text" class="form-control" '
      html = html + 'data-uID="'+ usersTasks[i].userId +'" placeholder="Описание задачи">';
      html = html + '<button type="button" class="btn btn-info">Добавить задачу</button>';
      html = html + '</div></div>';
    }
    if(addUser == undefined) {
      $("#tasksList").html(html);
    } else {
      $("#tasksList").html($("#tasksList").html() + html);
    }
  }

  function dateParse(dateStr) {
    for(var i = 0; i < dateStr.usersPerform.length; ++i) {
      var date = dateStr.usersPerform[i]["date"];
      dateStr.usersPerform[i]["date"] = [];
      dateStr.usersPerform[i].date.year = new Date(date).getFullYear();
      dateStr.usersPerform[i].date.month = Calendar.getMonth();
      dateStr.usersPerform[i].date.day = Calendar.getDay(date);
    }
  }

  function printUsers(Users) {
    var html = "";
    for(var i = 0; i < Users.length; ++i) {
      html = html + '<li><a href="#" data-uID="'+Users[i].userId+'">'+Users[i].name+'</a></li>';
    }
    $("#choosePerson ul").html(html);
  }

  function printTask(obj, data) {
    var html = '<li><input class="cbTask" data-idtask="'+ data.taskId +'" type="checkbox"> ';
    html = html + data.taskName +'<span data-uid="'+data.userId+'" data-idtask="'+ data.taskId +
        '" class="glyphicon glyphicon-remove closeTask"></span></li>';
    $(obj).siblings("ul").append(html);
    $("#calendar [data-uid="+data.userId+"]").removeClass("temporaryTask");
    updateTaskCounter(data);
  }

  function updateTaskCounter(data) {
    $("#calendar [data-uid="+data.userId+"]").find("span").text(data.done+"/"+data.Total);
    $("#calendar [data-uid="+data.userId+"]").find("span")
        .attr("title", "Выполнено "+data.done+" из "+data.Total+"");
  }

  function getTaskCounter(userId) {
    return $("#calendar [data-uid="+userId+"]").find("span").first().text().split("/");
  }

  return {
    loadCalendar: function(Year, Month) {
      if(Month < 10) Month = '0' + Month;
      year = Year;
      month = Month;
      var request = $.ajax({
        url: 'api.php?v=1&method=getUsersPerformTask&date=' + Year + '-' + Month,
        dataType: "json"
      });
      request.done(function(obj) {
        printCalendar(obj);
      });
      request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
      });
      selectedDay = undefined;
      $("#date").html("--/--/----");
      $("#tasksList").html("");
      $("#choosePerson input").attr("disabled", "disabled");
      $("#choosePerson button").attr("disabled", "disabled");
    },
    getUserName: function(userName) {
      var request = $.ajax({
        url: 'api.php?v=1&method=getUsers',
        method: "POST",
        data: {
          userName: userName,
          date: $(selectedDay).attr("data-date")
        },
        dataType: "json"
      });
      request.done(function(Users) {
        printUsers(Users);
      });
      request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
      });
    },
    getUsers: function(userName) {
      var request = $.ajax({
        url: 'api.php?v=1&method=getUsers',
        method: "POST",
        data: {
          date: $(selectedDay).attr("data-date")
        },
        dataType: "json"
      });
      request.done(function(Users) {
        printUsers(Users);
      });
      request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
      });
    },
    getUsersTasks: function() {
      var request = $.ajax({
        url: 'api.php?v=1&method=getUsersTasks',
        method: "POST",
        data: {
          date: $(selectedDay).attr("data-date")
        },
        dataType: "json"
      });
      request.done(function(usersTasks) {
        printUsersTasks(usersTasks);
      });
      request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
      });
    },
    addNewUser: function() {
      $("#choosePerson input").attr("disabled", "disabled");
      $("#choosePerson button").attr("disabled", "disabled");
      var request = $.ajax({
        url: 'api.php?v=1&method=addNewUser',
        method: "POST",
        data: {
          userName: $("#choosePerson input").val()
        },
        dataType: "json"
      });
      request.done(function(userId) {
        if(userId.userId > 0) {
          var usersTasks = [
            {
              userName: $("#choosePerson input").val().trim(), 
              userId: userId.userId, 
              userTasks: []
            }
          ];
          printUsersTasks(usersTasks, true);
        } else alert("Невозможно добавить пользователя");
        $("#choosePerson input").removeAttr("disabled");
        $("#choosePerson button").removeAttr("disabled");
        $("#choosePerson input").val("");
      });
      request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
        $("#choosePerson input").removeAttr("disabled");
        $("#choosePerson button").removeAttr("disabled");
      });
    },
    choosePersona: function(obj) {
      var usersTasks = [
        {
          userName: $(obj).find("a").text(),
          userId: $(obj).find("a").attr("data-uid"),
          userTasks: []
        }
      ];
      printUsersTasks(usersTasks, true);
        var progress = getTaskCounter($(obj).find("a").attr("data-uid"));
        if(progress.length > 1) {
          var done = progress[0];
          var Total = progress[1];
        } else {
          var done = 0;
          var Total = 0;
        }
        $(selectedDay).find(".calendarCellBorder")
        .append('<p class="temporaryTask" data-uid="'+$(obj).find("a").attr("data-uid")+'">'+$(obj).find("a").text() + 
          ' <span class="badge" title="Выполнено '+
              done+' из '+Total+'">'+done+'/'+Total+'</span></p>');
    },
    addNewTask: function(obj) {
      $(obj).attr("disabled", "disabled");
      var data = {
        userId: $(obj).siblings("input").attr("data-uid"),
        taskName: $(obj).siblings("input").val(),
        date: $(selectedDay).attr("data-date")
      };
      var request = $.ajax({
        url: 'api.php?v=1&method=addNewTask',
        method: "POST",
        data: data,
        dataType: "json"
      });
      request.done(function(taskId) {
        data.userName = $(obj).parent(".bodyPerson").siblings(".head").text();
        data.taskId = taskId.taskId;
        var progress = getTaskCounter(data.userId);
        data.done = progress[0];
        data.Total = parseInt(progress[1], 10)+1;
        printTask(obj, data);
        $(obj).removeAttr("disabled");
      });
      request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
        $(obj).removeAttr("disabled");
      });
    },
    cancelTask: function(obj) {
      var data = {
        taskId: $(obj).attr("data-idtask")
      };
      var request = $.ajax({
        url: 'api.php?v=1&method=cancelTask',
        method: "POST",
        data: data,
        dataType: "json"
      });
      request.done(function(result) {
        if(result.status > 0) {
          data.userId = $(obj).attr("data-uid");
          var progress = getTaskCounter($(obj).attr("data-uid"));
          data.done = progress[0];
          data.Total = parseInt(progress[1], 10) - 1;
          updateTaskCounter(data);
          $("#calendar p:contains('0/0')").remove();
          $(obj).parent().remove();
        }
      });
      request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
      });
    },
    updateTaskStatus: function(obj) {
      var data = {
        taskId: $(obj).attr("data-idtask"),
        status: $(obj).prop("checked")
      };
      var request = $.ajax({
        url: 'api.php?v=1&method=updateTaskStatus',
        method: "POST",
        data: data,
        dataType: "json"
      });
      request.done(function(result) {
        if(result.status > 0) {
          data.userId = $(obj).siblings("span").attr("data-uid");
          var progress = getTaskCounter(data.userId);
          if($(obj).prop("checked")) {
            $(obj).parent().addClass("taskComplete");
            data.done = parseInt(progress[0], 10)+1;
          } else {
            $(obj).parent().removeClass("taskComplete");
            data.done = parseInt(progress[0], 10)-1;
          }
          data.Total = progress[1];
          updateTaskCounter(data);
        }
      });
      request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
      });
    },
    prevMonth: function() {
      if(month > 1) {
        --month;
      } else {
        month = 12;
        --year;
      }
      return {month:month, year:year};
    },
    nextMonth: function() {
      if(month < 12) {
        ++month;
      } else {
        month = 1;
        ++year;
      }
      return {month:month, year:year};
    },
    getMonth: function(date) {
      var Month;
      if(date != undefined) {
        Month =  new Date(date).getMonth()+1;
      } else {
        Month =  new Date().getMonth()+1;
      }
      if(Month < 10) Month = '0' + Month;
      return Month;
    },
    getDay: function(date) {
      var day;
      if(date != undefined) {
        day =  new Date(date).getDate();
      } else {
        day =  new Date().getDate();
      }
      if(day < 10) day = '0' + day;
      return day;
    },
    setSelectDay: function(obj) {
      selectedDay = obj;
    },
    getSelectDay: function() {
      return selectedDay;
    }
  }
}());