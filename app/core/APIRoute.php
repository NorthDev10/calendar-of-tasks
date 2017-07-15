<?php

class APIRoute {

  public static function start() {
    try {
      if(!isset($_GET["method"])) throw new HttpException(403);
      if(empty($_GET["method"])) throw new HttpException(404);

      $modelPath = 'app/models/API/ModelAPIBase.php';

      if(file_exists($modelPath)) {
        include $modelPath;
      }
      
      $controllerPath = 'app/controllers/API/ControllerAPIBase.php';
      if(file_exists($controllerPath)) {
        include $controllerPath;
      } else {
        throw new HttpException(404);
      }
  
      $controller = new ControllerAPIBase();
      
      $actionName = 'action'.ucfirst($_GET["method"]);
      if(method_exists($controller, $actionName)) {
          $controller->$actionName();
      } else {
        throw new HttpException(404);
      }
    } catch(HttpException $e) {
      header('HTTP/1.1 '.$e->getMessage());
      header('Status: '.$e->getMessage());
      if($e->getRedirect()) {
        header('Location: '.$e->getRedirect());
      }
    } catch(Exception $e) {
      file_put_contents(ERROR_LOG,  date("d.m.y, H:i:s").' '.$e."\n", FILE_APPEND);
      header('HTTP/1.1 500 Internal Server Error');
      header("Status: 500 Internal Server Error");
    }
  }
}