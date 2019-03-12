<?php
$required = array("url");
$inputs = array();
foreach ($required as $input) {
	if (!isset($_POST[$input]) || empty($_POST[$input])) {
		exit("-1");
	}
	$inputs[$input] = trim($_POST[$input]);
}

$url = 'https://s1.navinda.xyz/youtube/info.php?url=' . $inputs["url"];
 
//Use file_get_contents to GET the URL in question.
$response = file_get_contents($url);
 
//If $contents is not a boolean FALSE value.
if($response !== false){
    //Print out the contents.
	echo $response;
	
	$data = json_decode($response);
	
	// write to log
	if (!empty($data->title) && isset($data->title)) {
		$inputs["url"] = htmlspecialchars($inputs["url"]);
		$log = $data->title  . "[~]" .  $inputs["url"] . "[~]" . $data->thumbnail . "\n";
		$log .= file_get_contents('../log/log.txt');
		file_put_contents('../log/log.txt', $log);
	}
}


?>