<?php

require_once './includes.php';

function getSystemLoad() {

    $val = shell_exec("echo -n $(uptime | cut -d ' ' -f 14)");
    $load = trim($val, ",");
    msg("Loads " . $load);
    $loadset = new Dataset("loadset", "load", $load);
    $return_set[] = $loadset;
    msg("loadset: " . json_encode($loadset));
    return $return_set;
}

function getDiskIO() {

    $val = shell_exec("echo -n $(iostat -y -o JSON -d xvda 1 1)");
    $val = json_decode($val);
    $val = json_encode($val->sysstat->hosts[0]->statistics[-d0]->disk[0]);
    $val = json_decode($val, true, 512, JSON_UNESCAPED_SLASHES);
    $val = json_encode($val["kB_read/s"]);
    msg("IO: " . json_encode($val));
    $loadset = new Dataset("loadset", "load", $val);
    $return_set[] = $loadset;
    msg("loadset: " . json_encode($loadset));
    return $return_set;
}

function getRandomData() {
    // $val = shell_exec()
    // this will return random values to the web page
}

?>

