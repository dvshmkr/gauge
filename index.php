<?php //final_project index.php

require_once ('includes.php');

msg("Before session_start()");
 // Start the session.
if (session_start()) {
	msg("Session started!");
	msg("Session vars: " . json_encode($_SESSION));
}


// If no session value is present, redirect the user:
// Also validate the HTTP_USER_AGENT!
if (!isset($_SESSION['agent']) OR ($_SESSION['agent'] != md5($_SERVER['HTTP_USER_AGENT']) )) {
	msg("Not logged in");
	// require_once ('login_functions.php');
	$url = absolute_url('login.php');
	header("Location: $url");
	exit();
}

include('index.html');

?>