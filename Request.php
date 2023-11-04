<?php

require_once './includes.php';

class Request {
    public $reqId;
    public $method;
    public $action;
    public $acton;
    public $status;

    function __construct() {
        $this->reqId = uniqid();        
        $this->method = $_SERVER['REQUEST_METHOD'];
        # What ever the method, get the attached args

        switch($this->method) {
            case 'POST':
                // If POST vars are json
                $request = json_decode(file_get_contents('php://input'));
                msg("Request: " . var_dump_ret($request));
                $this->action = $request->action ?? null;
                msg("Action: " . json_encode($this->action));
                $this->acton = $request->acton ?? null;
                msg("Acton: " . json_encode($this->acton));
                // Get POST vars
                // $this->action = $_POST['action'] ?? null;
                // $this->acton = $_POST['acton'] ?? null;                
                msg("POST: " . json_encode($_POST));                
                break;
            case 'GET':
                // Not implemented
                break;
            default:
                msg("Unknown http method" . $this->method);
        }                             
    }

    function execute() {
        // Request::execute returns an array of objects
        try {
            // perform the action
            $func = $this->action; // Why do I have to store this in $func to make the call work?
            $result = $func($this->acton);            
            //msg("Result: " . json_encode($result));          
            $this->status = array("Success", $this->action);                      
            return $result;
        }
        
        //catch(\Error $e) {
        catch(Exception $e) {
            $this->status = array("Error", "$this->action: " . $e->getMessage());            
        }

        finally {
            msg("Status: " . $this->status[0] . ": " . $this->status[1]);
        }

          
    }
}

?>