let Calendar = (function() {
  
  let usersList = [];
  
  let dayListObj;
  let personnelList = [];
  
  let weeksVueObj;
  let tasksList;
  let choosePerson;
  
  function getCalendarObj(Users) {
    let dayofweek = Users.firstDayOfWeek;
    usersList = [];
    if(weeksVueObj != undefined) {
      weeksVueObj.selectedDay = {};
    }
    dateParse(Users);
    if(dayListObj == undefined) {
      dayListObj = {
        month: getMonth(Users.month),
        year: Users.year,
        weeks: []
      };
    } else {
      dayListObj.month = getMonth(Users.month);
      dayListObj.year = Users.year;
      dayListObj.weeks = [];
    }
    for(let j = 1, week = 0, day; j <= Users.daysInMonth; ++week) {
      dayListObj.weeks[week] = [];
      for(let i = 1; i <= 7; ++i) {
        let dayObj = {isToday:false};
        if(i >= dayofweek && j <= Users.daysInMonth) {
          day = j;
          if(day < 10) day = '0' + day;
          dayObj.day = day;
          if((j == getDay()) && (Users.month == getMonth()) 
              && (year == new Date().getFullYear())) {
            dayObj.isToday = true;
          }
          dayObj.tasks = tasksInThisDay(j, Users);
          ++j;
          dayListObj.weeks[week].push(dayObj);
        } else {
          dayListObj.weeks[week].push({});
        }
      }
      dayofweek = 1;
    }
  }
  
  function dateParse(dateStr) {
    for(var i = 0; i < dateStr.usersPerform.length; ++i) {
      var date = dateStr.usersPerform[i]["date"];
      dateStr.usersPerform[i]["date"] = [];
      dateStr.usersPerform[i].date.year = new Date(date).getFullYear();
      dateStr.usersPerform[i].date.month = getMonth(date);
      dateStr.usersPerform[i].date.day = getDay(date);
    }
  }
  
  function tasksInThisDay(thisDay, usersPerform) {
    if(thisDay < 10) thisDay = '0' + thisDay;
    let tasksInThisDay = [];
    for(let i = 0; i < usersPerform.usersPerform.length; ++i) {
      if(thisDay == usersPerform.usersPerform[i].date.day) {
        if(usersList[usersPerform.usersPerform[i].uID] == undefined) {
          let completedTasks = parseInt(usersPerform.usersPerform[i].completedTasks);
          let InProcess = parseInt(usersPerform.usersPerform[i].InProcess);
          usersList[usersPerform.usersPerform[i].uID] = {
            uID: usersPerform.usersPerform[i].uID,
            name: usersPerform.usersPerform[i].name,
            InProcess: InProcess,
            completedTasks: completedTasks,
            ofAllTasks: InProcess+completedTasks
          };
        }
        tasksInThisDay.push(usersList[usersPerform.usersPerform[i].uID]);
      }
    }
    return tasksInThisDay;
  }
  
  function getMonth(date) {
    let Month;
    if(!isNumeric(date)) {
      if(date != undefined) {
        Month =  new Date(date).getMonth()+1;
      } else {
        Month =  new Date().getMonth()+1;
      }
    } else Month = date;
    if(Month < 10) Month = '0' + Month;
    return Month;
  }
  
  function getDay(date) {
    let day;
    if(!isNumeric(date)) {
      if(date != undefined) {
        day =  new Date(date).getDate();
      } else {
        day =  new Date().getDate();
      }
    } else day = date;
    if(day < 10) day = '0' + day;
    return day;
  }
  
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  
  function initCalendar() {
    if(weeksVueObj == undefined) {
      Vue.component('weeks', {
        props: ['weekObj', 'selectedDay'],
        template: `<tr>
            <td 
              v-for="day in weekObj"
              v-bind:class="{today:day.isToday, selectedDay:selectedDay.day == day.day?1:0}"
              v-if="day.isToday!=undefined"
              v-on:click="selectDay(day)">
                <div class="row">
                  <div class="col-md-4 calendarCellFont">{{day.day}}</div>
                  <div class="col-md-8 calendarCellBorder">
                    <p v-for="task in day.tasks">
                      {{task.name}} 
                      <span class="badge" title="Выполнено">
                        {{task.completedTasks}}/{{task.ofAllTasks}}
                      </span>
                    </p>
                  </div>
                </div>
            </td>
            <td v-else></td>
          </tr>`,
        methods: {
          selectDay: function(day) {
            initTasksList();
            removeFreeUserOnThisDay(tasksList.personsTasksObj, weeksVueObj.selectedDay);
            choosePerson.setPersonnel([]);
            choosePerson.disabled = false;
            weeksVueObj.setSelectedDay(day);
            choosePerson.day = day.day;
            choosePerson.month = dayListObj.month;
            choosePerson.year = dayListObj.year;
            if(day.tasks.length > 0) {
              var formData = new FormData();
              formData.append("date", `${dayListObj.year}-${dayListObj.month}-${day.day}`);
              fetch('api.php?v=1&method=getUsersTasks', {method: 'POST', body: formData})
              .then(function(response) {
                if(response.status == 200) {
                  return response.json();
                }
              })
              .then(function(obj) {
                tasksList.personsTasksObj = obj;
              })
              .catch(function(e) {
                alert("Request failed");
              });
            } else tasksList.personsTasksObj = [];
          }
        }
      });
      
      weeksVueObj = new Vue({
        el:"#calendar",
        data: {
          weeksObj: dayListObj,
          selectedDay: {}
        },
        methods: {
          setSelectedDay: function(day) {
            this.selectedDay = day;
          },
          nextMonth: function() {
            if(month < 12) {
              ++month;
            } else {
              month = 1;
              ++year;
            }
            if(tasksList != undefined) {
              tasksList.personsTasksObj = [];
            }
            if(choosePerson != undefined) {
              choosePerson.disabled = true;
            }
            Calendar.loadCalendar(year, month);
          },
          prevMonth: function() {
            if(month > 1) {
              --month;
            } else {
              month = 12;
              --year;
            }
            if(tasksList != undefined) {
              tasksList.personsTasksObj = [];
            }
            if(choosePerson != undefined) {
              choosePerson.disabled = true;
            }
            Calendar.loadCalendar(year, month);
          }
        }
      });
    }
  }
  
  function removeFreeUserOnThisDay(userTasks, usersWorkOnThisDay) {
     if(usersWorkOnThisDay.tasks != undefined) {
       usersMustBeReleased = [];
      for(let i = 0; i < userTasks.length; ++i) {
        if(userTasks[i].userTasks.length == 0) {
          usersMustBeReleased.push(userTasks[i].userId);
        }
      }
      for(let i = 0; i < usersWorkOnThisDay.tasks.length; ++i) {
        if(usersMustBeReleased.indexOf(usersWorkOnThisDay.tasks[i].uID)+1) {
          usersWorkOnThisDay.tasks.splice(i--, 1);
        }
      }
     }
  }
  
  function initTasksList() {
    if(tasksList == undefined) {
      Vue.component('person', {
        props: ['personTasks'],
        template: `<div class="person">
                    <div class="head">{{personTasks.userName}}</div>
                    <div class="bodyPerson">
                      <ul>
                        <li 
                          v-for="(userTask, index) in personTasks.userTasks" 
                          v-bind:class="{taskComplete:userTask.status}">
                          <input type="checkbox" v-model="userTask.status" v-on:click="updateStatus(userTask, personTasks)"> {{userTask.taskName}}
                          <span class="glyphicon glyphicon-remove closeTask" v-on:click="remove(index, personTasks)"></span>
                        </li>
                      </ul>
                      <input type="text" v-model="descriptionTask" class="form-control" placeholder="Описание задачи">
                      <button type="button" class="btn btn-info" v-on:click="addTask(personTasks)">Добавить задачу</button>
                    </div>
                  </div>`,
        data: function () {
          return {descriptionTask:""}
        },
        methods: {
          addTask: function(user) {
            let formData = new FormData();
            formData.append("userId", user.userId);
            formData.append("taskName", this.descriptionTask);
            formData.append("date", `${dayListObj.year}-${dayListObj.month}-${weeksVueObj.selectedDay.day}`);
            let self = this;
            fetch("api.php?v=1&method=addNewTask", {method:"POST", body:formData})
              .then(function(response) {
                if(response.status == 200) {
                  return response.json();
                }
              })
              .then(function(obj) {
                if(obj.taskId > 0) {
                  user.userTasks.push({
                    status: 0,
                    taskId: obj.taskId,
                    taskName: self.descriptionTask
                  });
                  usersList[user.userId].InProcess++;
                  usersList[user.userId].ofAllTasks++;
                  if(searchInObjVal(user.userId, weeksVueObj.selectedDay.tasks) == -1) {
                    weeksVueObj.selectedDay.tasks.push(usersList[user.userId]);
                  }
                  self.descriptionTask = "";
                }
              })
              .catch(function(e) {
                alert("Request failed");
              });
          },
          updateStatus: function(userTask, personTasks) {
            let formData = new FormData();
            formData.append("taskId", userTask.taskId);
            formData.append("status", userTask.status);
            let self = this;
            fetch("api.php?v=1&method=updateTaskStatus", {method:"POST", body:formData})
              .then(function(response) {
                if(response.status == 200) {
                  return response.json();
                }
              })
              .then(function(obj) {
                if(obj.status != -1) {
                  let id = searchInObjVal(personTasks.userId, weeksVueObj.selectedDay.tasks);
                  if(userTask.status) {
                    weeksVueObj.selectedDay.tasks[id].completedTasks++;
                  } else {
                    weeksVueObj.selectedDay.tasks[id].completedTasks--;
                  }
                }
              })
              .catch(function(e) {
                alert("Request failed");
              });
          },
          remove: function(index, personTasks) {
            if(confirm("Отменить задачу?")) {
              let formData = new FormData();
              formData.append("taskId", personTasks.userTasks[index].taskId);
              let self = this;
              fetch("api.php?v=1&method=cancelTask", {method:"POST", body:formData})
                .then(function(response) {
                  if(response.status == 200) {
                    return response.json();
                  }
                })
                .then(function(obj) {
                  if(obj.status != -1) {
                    usersList[personTasks.userId].InProcess--;
                    usersList[personTasks.userId].ofAllTasks--;
                    if(personTasks.userTasks[index].status == "1") {
                      usersList[personTasks.userId].completedTasks--;
                    }
                    personTasks.userTasks.splice(index, 1);
                    if(personTasks.userTasks.length == 0) {//Remove user from this day
                      let id;
                      if((id = searchInObjVal(personTasks.userId, weeksVueObj.selectedDay.tasks)) != -1) {
                        weeksVueObj.selectedDay.tasks.splice(id, 1);
                      }
                    }
                  }
                })
                .catch(function(e) {
                  alert("Request failed");
                });
            }
          }
        }
      });

      tasksList = new Vue({
        el:"#tasksList",
        data: {
          personsTasksObj: []
        }
      });
    }
  }
  
  function searchInObjVal(id, obj, strArg = "uID") {
    for(let i = 0; i < obj.length; ++i) {
      if(id == obj[i][strArg]) {
        return i;
      }
    }
    return -1;
  }
  
  function initChoosePerson() {
    if(choosePerson == undefined) {
      choosePerson = new Vue({
        el:"#choosePerson",
        data: {
          userName: "",
          disabled:true,
          day:"--",
          month:"--",
          year:"----",
          personnel: [],
          classObject: {
            menu: {
              dsplayBlock: false
            }
          }
        },
        methods: {
          setPersonnel: function(userList) {
            this.personnel = userList;
          },
          getPersonnel: function() {
            if(this.personnel.length == 0) {
              var formData = new FormData();
              formData.append("date", `${this.year}-${this.month}-${this.day}`);
              let self = this;
              fetch('api.php?v=1&method=getUsers', {method: 'POST', body: formData})
              .then(function(response) {
                if(response.status == 200) {
                  return response.json();
                }
              })
              .then(function(obj) {
                self.setPersonnel(obj);
                self.classObject.menu.dsplayBlock = true;
              })
              .catch(function(e) {
                alert("Request failed");
              });
            } else {
              this.classObject.menu.dsplayBlock = true;
            }
          },
          hideListPersonnel: function() {
            personnelList = [];
            setTimeout(() => {
              this.classObject.menu.dsplayBlock = false;
            }, 200);
          },
          choosePerson: function(user) {
            if(usersList[user.userId] == undefined) {
              usersList[user.userId] = {
                uID: user.userId,
                name: user.name,
                InProcess: 0,
                completedTasks: 0,
                ofAllTasks: 0
              };
            }
            if(searchInObjVal(user.userId, tasksList.personsTasksObj, "userId") == -1) {
              weeksVueObj.selectedDay.tasks.push(usersList[user.userId]);
              tasksList.personsTasksObj.push({"userId":user.userId,"userName":user.name,"userTasks":[]});
            }
          },
          findUserByName: function() {
            if(this.userName.length > 2) {
              var formData = new FormData();
              formData.append("userName", this.userName);
              formData.append("date", `${this.year}-${this.month}-${this.day}`);
              let self = this;
              fetch('api.php?v=1&method=getUsers', {method: 'POST', body: formData})
                .then(function(response) {
                  if(response.status == 200) {
                    return response.json();
                  }
                })
                .then(function(obj) {
                  self.setPersonnel(obj);
                  self.classObject.menu.dsplayBlock = true;
                })
                .catch(function(e) {
                  alert("Request failed");
                });
            }
          },
          addNewUser: function() {
            if(this.userName.length > 2) {
              var formData = new FormData();
              formData.append("userName", this.userName);
              let self = this;
              fetch('api.php?v=1&method=addNewUser', {method: 'POST', body: formData})
                .then(function(response) {
                  if(response.status == 200) {
                    return response.json();
                  }
                })
                .then(function(user) {
                  if(user.userId > 0) {
                    self.personnel.push({
                      userId: user.userId,
                      name: self.userName
                    });
                    self.userName = "";
                  } else throw 0;
                })
                .catch(function(e) {
                  alert("Request failed");
                });
            }
          }
        }
      });
    }
  }
    
  return {
    loadCalendar: function(Year, Month) {
      if(Month < 10) Month = '0' + Month;
      year = Year;
      month = Month;
      var myHeaders = new Headers();
      initChoosePerson();
      fetch('api.php?v=1&method=getUsersPerformTask&date=' + Year + '-' + Month, {method: 'GET'})
        .then(function(response) {
          if(response.status == 200) {
            return response.json();
          }
        })
        .then(function(obj) {
          getCalendarObj(obj);
          initCalendar();
        })
        .catch(function() {
          alert("Request failed");
        });
    }
    
  }
}());
Calendar.loadCalendar(new Date().getFullYear(), new Date().getMonth()+1);


