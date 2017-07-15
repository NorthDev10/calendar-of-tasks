<?php

class HttpException extends Exception {

  private $redirect;
  private $httpCode;

  public function __construct($code, $redirect = null) {
    $this->httpCode = (int)$code;
    $this->redirect = $redirect;
    switch($this->httpCode) {
      case 301:
        $message = '301 Moved Permanently';
      break;
      case 302:
        $message = '302 Moved Temporarily';
      break;
      case 403:
        $message = '403 Forbidden';
      break;
      case 404:
        $message = '404 Not Found';
      break;
      case 500:
        file_put_contents(ERROR_LOG,  date("d.m.y, H:i:s").' '.$this."\n", FILE_APPEND);
        $message = '500 Internal Server Error';
      break;
      default:
        file_put_contents(ERROR_LOG,  date("d.m.y, H:i:s").' '.$this."\n", FILE_APPEND);
        $message = $this->httpCode;
    }
    parent::__construct($message, $this->httpCode);
  }

  public function getRedirect() {
    return $this->redirect;
  }

  public function __toString() {
    return 'HTTP code: '.$this->httpCode."\n"
           .parent::__toString();
  }
}