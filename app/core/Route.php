<?php

class Route {

  public static function start() {
    try {
      $controllerName = 'main';
      $actionName = 'index';
      $routes = explode('/', $_SERVER['REQUEST_URI']);
      if(!empty($routes[1])) {
        $controllerName = $routes[1];
      }

      if(!empty($routes[2])) {
        $actionName = $routes[2];
      }

      $folder = $controllerName;
      $modelName = 'Model'.ucfirst($controllerName);
      
      if(!preg_match("/^[\w]+$/", $modelName)) throw new HttpException(404);
      
      $modelFile = $modelName.'.php';
      $modelPath = "app/models/".$folder.'/'.$modelFile;
      
      if(file_exists($modelPath)) {
        include $modelPath;
      }
      
      $controllerName = 'Controller'.ucfirst($controllerName);
      
      if(!preg_match("/^[\w]+$/", $controllerName)) throw new HttpException(404);
      
      $controllerFile = $controllerName.'.php';
      $controllerPath = "app/controllers/".$folder.'/'.$controllerFile;
      if(file_exists($controllerPath)) {
        include $controllerPath;
      } else {
        throw new HttpException(404);
      }
  
      $controller = new $controllerName;
      
      $actionName = 'action'.ucfirst($actionName);
      if(method_exists($controller, $actionName)) {
        if(!empty($routes[3])) {
          $controller->$actionName($routes[3]);
        } else {
          $controller->$actionName();
        }
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