<?php

class ModelAPIBase extends Model {
  
  private $db;
  private static $numberOfRecordsTemp;
  
  public function __construct() {
    $db = DataBase::getDBObj();
    $this->db = $db->getConnection();
  }

  /*
  * Возвращает список незанятых пользователей в выбранный день
  */
  public function getUsers($date) {
    $stmt = $this->db->prepare("SELECT users.userId, users.name 
    FROM users, tasks 
    WHERE (users.userId = tasks.userId AND NOT tasks.date LIKE ?)
      OR users.userId NOT IN (SELECT userId FROM tasks) 
    GROUP BY users.userId ORDER BY users.name");
    $stmt->bindValue(1, $date.'%', PDO::PARAM_STR);
    $stmt->execute();
    $usersArr = array();
    while($row = $stmt->fetch()) {
        $usersArr[] = $row;
    }
    return $usersArr;
  }

  /*
  * Поиск незанятого пользователя в выбранный день
  */
  public function getUsersName($userName, $date) {
    $stmt = $this->db->prepare("SELECT users.userId, users.name 
    FROM users, tasks 
    WHERE (users.userId = tasks.userId AND NOT tasks.date LIKE :date AND users.name LIKE :userName)
      OR users.userId NOT IN (SELECT userId FROM tasks) AND users.name LIKE :userName 
    GROUP BY users.userId ORDER BY users.name");
    $stmt->bindValue(":date", $date.'%', PDO::PARAM_STR);
    $stmt->bindValue(":userName", $userName.'%', PDO::PARAM_STR);
    $stmt->execute();
    $usersArr = array();
    while($row = $stmt->fetch()) {
        $usersArr[] = $row;
    }
    return $usersArr;
  }

  /*
  * возвращает список задач пользователей, на указанную дату
  */
  public function getUsersTasks($date) {
    $stmt = $this->db->prepare("SELECT users.userId, users.name, tasks.taskId,
        tasks.taskName, tasks.status 
    FROM users, tasks 
    WHERE users.userId = tasks.userId AND tasks.date LIKE ? 
    ORDER BY tasks.date");
    $stmt->bindValue(1, $date.'%', PDO::PARAM_STR);
    $stmt->execute();
    $tasksArr = array();
    while($row = $stmt->fetch()) {
        $tasksArr[] = $row;
    }
    return $this->structuringTasks($tasksArr);
  }

  protected function structuringTasks(array $tasks) {
    $newTasksList = array();
    for($i = 0; $i < count($tasks); ++$i) {
      $newTasksList[$tasks[$i]["userId"]]["userId"] = (int)$tasks[$i]["userId"];
      $newTasksList[$tasks[$i]["userId"]]["userName"] = $tasks[$i]["name"];
      $newTasksList[$tasks[$i]["userId"]]["userTasks"][] = array(
        "taskId" => (int)$tasks[$i]["taskId"],
        "taskName" => $tasks[$i]["taskName"],
        "status" => (int)$tasks[$i]["status"]
      );
    }
    return array_values($newTasksList);
  }

/*
* возвращает список пользователей, выполняющие задачи за месяц
*/
  public function getUsersPerformTask($date) {
    $stmt = $this->db->prepare("
    SELECT 
      users.userId AS uID,
      users.name,
      tasks.date,
        (SELECT COUNT(tasks.taskId) 
          FROM users, tasks 
          WHERE users.userId = tasks.userId AND tasks.date LIKE :date AND users.userId = uID AND tasks.status = 1) 
        AS completedTasks,
        (SELECT COUNT(tasks.taskId) FROM users, tasks WHERE users.userId = tasks.userId AND users.userId = uID AND tasks.date LIKE :date AND tasks.status = 0) 
        AS InProcess
        FROM users, tasks
        WHERE users.userId = tasks.userId AND tasks.date LIKE :date GROUP BY users.userId, DAY(tasks.date)");
    $stmt->bindValue(':date', $date.'%', PDO::PARAM_STR);
    $stmt->execute();
    $usersPerformArr['usersPerform'] = array();
    while($row = $stmt->fetch()) {
        $usersPerformArr['usersPerform'][] = $row;
    }
    $date = date_parse($date);
    $usersPerformArr["month"] = $date["month"];
    $usersPerformArr["year"] = $date["year"];
    $usersPerformArr["daysInMonth"] = date('t', mktime(0, 0, 0, $date["month"], 1, $date["year"]));
    $usersPerformArr["firstDayOfWeek"] = date('N', mktime(0, 0, 0, $date["month"], 1, $date["year"]));
    return $usersPerformArr;
  }

  public function addUser($newUserName) {
    if(mb_strlen($newUserName, "UTF-8") > 3) {
      $stmt = $this->db->prepare("INSERT INTO users (name) VALUES (?)");
      $stmt->bindValue(1, $newUserName, PDO::PARAM_STR);
      $stmt->execute();
      return array("userId" => $this->db->lastInsertId());
    }
    return array("userId" => -1);
  }

  public function addTask($userId, $taskName, $date) {
    if(mb_strlen($taskName, "UTF-8") > 0 && (int)$userId > 0) {
      $stmt = $this->db->prepare("INSERT INTO tasks (userId, taskName, date) VALUES (?, ?, ?)");
      $stmt->bindValue(1, $userId, PDO::PARAM_INT);
      $stmt->bindValue(2, $taskName, PDO::PARAM_STR);
      $stmt->bindValue(3, $date, PDO::PARAM_STR);
      $stmt->execute();
      return array("taskId" => $this->db->lastInsertId());
    }
    return array("taskId" => -1);
  }

  public function cancelTask($taskId) {
    $taskId = (int)$taskId;
    if($taskId > 0) {
      $stmt = $this->db->prepare("DELETE FROM tasks WHERE taskId = ?");
      $stmt->bindValue(1, $taskId, PDO::PARAM_INT);
      return array("status" => $stmt->execute());
    }
    return array("status" => -1);
  }

  public function updateTaskStatus($taskId, $status) {
    if($status == "true") {
      $status = 1;
    } else $status = 0;
    if((int)$taskId > 0) {
      $stmt = $this->db->prepare("UPDATE tasks SET status = ? WHERE taskId = ?");
      $stmt->bindValue(1, $status, PDO::PARAM_INT);
      $stmt->bindValue(2, $taskId, PDO::PARAM_INT);
      return array("status" => $stmt->execute());
    }
    return array("status" => -1);
  }
}
