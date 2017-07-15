<?php

class DataBase {

  private $_connection;
  private static $_DBObj;

  public static function getDBObj() {
    if(!self::$_DBObj) {
      self::$_DBObj = new self();
    }
    return self::$_DBObj;
  }

  private function __construct() {
    try {
      $dsn = "mysql:host=".HOST.";dbname=".DB.";charset=utf8";
      $opt = array(
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
      );
      $this->_connection = new PDO($dsn, USER, PASS, $opt);
      $this->_connection->query('SET TIME_ZONE="+02:00"');
    } catch(PDOException $e) {  
      file_put_contents(ERROR_LOG,  date("d.m.y, H:i:s").' '.$e->getMessage()."\n", FILE_APPEND);
      header('HTTP/1.1 500');
      die("Не удалось подключится к БД");
    }
  }

  private function __clone() {}
  
  public function getConnection() {
    return $this->_connection;
  }
}