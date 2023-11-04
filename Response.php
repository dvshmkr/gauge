<?php

require_once './includes.php';

class Response {
    public $rspId; // get this from the request?
    public $package;
    public $status;

    // function getArtistList($dir) {
    function __construct() {
        $this->status = FALSE;
        $this->package = new stdClass();        
        // msg("Response: " . json_encode($this));
    }

    function append($dataset_array) {
        // msg("dataset_array: " . json_encode($dataset_array));
        foreach($dataset_array as $dataset){
            // msg("dataset: " . json_encode($dataset));
            $name = $dataset->id;
            $this->package->$name = $dataset;
        }
    }

    function send() {
        echo json_encode($this->package, JSON_INVALID_UTF8_SUBSTITUTE);
    }
}



?>