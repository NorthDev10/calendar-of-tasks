<?php

class ControllerAPIBase extends Controller {
  
  public function __construct() {
    $this->model = new ModelAPIBase();
    $this->view = new View();
  }

  public function actionGetUsers() {
    if(isset($_POST['userName'])) {
      $data = $this->model->getUsersName($_POST['userName'], $_POST['date']);
    } else {
      $data = $this->model->getUsers($_POST['date']);
    }
    $this->view->generate(NULL, 'jsonView.php', $data);
  }

  public function actionGetUsersTasks() {
    $data = $this->model->getUsersTasks($_POST['date']);
    $this->view->generate(NULL, 'jsonView.php', $data);
  }
  
  public function actionGetUsersPerformTask() {
    $data = $this->model->getUsersPerformTask($_GET['date']);
    $this->view->generate(NULL, 'jsonView.php', $data);
  }

  public function actionAddNewUser() {
    $data = $this->model->addUser($_POST['userName']);
    $this->view->generate(NULL, 'jsonView.php', $data);
  }

  public function actionAddNewTask() {
    $data = $this->model->addTask($_POST['userId'], $_POST['taskName'], $_POST['date']);
    $this->view->generate(NULL, 'jsonView.php', $data);
  }

  public function actionCancelTask() {
    $data = $this->model->cancelTask($_POST['taskId']);
    $this->view->generate(NULL, 'jsonView.php', $data);
  }

  public function actionUpdateTaskStatus() {
    $data = $this->model->updateTaskStatus($_POST['taskId'], $_POST['status']);
    $this->view->generate(NULL, 'jsonView.php', $data);
  }
}