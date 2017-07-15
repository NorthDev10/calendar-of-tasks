<?php

class ControllerMain extends Controller {
  
  public function __construct() {
    $this->view = new View();
  }
  
  public function actionIndex() {
    $this->view->addLinkCSS("/css/style.css");
    $this->view->addLinkJS("/js/main.js", false);
    $this->view->generate("main/ViewMain.php", 'templateView.php');
  }
}