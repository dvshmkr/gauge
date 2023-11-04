<?php //Music Library

// session_start();

require_once './includes.php';

$start = microtime(true);
$pid = getmypid();
msg("\n\n\n\nNew Run");
msg("***************** " . __FILE__ . " $pid " . "started ****************");

$response = new Response();
$request = new Request();

$result = $request->execute();
// msg("result: " . json_encode($result));

if ($result) {
    $response->append($result);
}

//msg("Response: " . json_encode($response));

$statusset[] = new Dataset("status", "statusset", $request->status);
$response->append($statusset);

$response->send();

$end = microtime(true);
$elapsed = $end - $start;
msg("Process $pid: Finished in $elapsed seconds (action)\n\n\n\n");
?>