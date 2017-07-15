<?php

class View {

  private $CSS;
  private $JavaScript;
  private $breadcrumbsName;
  
  public function __construct() {
    $this->CSS = [];
    $this->JavaScript = [];
    $this->breadcrumbsName = '';
  }

  public function generate($contentView, $templateView, $data = null, $extract = true) {
    if(is_array($data) && $extract) {
      extract($data);
    }
    $breadcrumbsName = $this->breadcrumbsName;
    $CSS = '';
    foreach($this->CSS as $value) {
      $CSS .= '<link rel="stylesheet" type="text/css" href="'.$value.'">'."\n";
    }

    $JavaScript = '';
    foreach($this->JavaScript as $value) {
      if($value[1]) {
        $JavaScript .= '<script async src="'.$value[0].'"></script>'."\n";
      } else {
        $JavaScript .= '<script defer src="'.$value[0].'"></script>'."\n";
      }
    }
    include 'app/views/'.$templateView;
  }

  public function addLinkCSS($css) {
    $this->CSS[] = $css;
  }
  
  public function addLinkJS($js, $async = true) {
    $this->JavaScript[] = [$js, $async];
  }
  
  public function setBreadcrumbsName($name) {
    $this->breadcrumbsName = $name;
  }
}