<?php

class Dataset {

    public $id = "";
    public $class = "";
    public $data = [];

    function __construct($id, $class, $data) {
        $this->id = $id;
        $this->class = $class;
        $this->data = $data;
    }

    function __set($name, $value) {
        $this->$name = $value;
    }

    function __get($name) {
        return $this->$name;
    }
}
?>