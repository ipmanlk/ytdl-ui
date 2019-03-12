<?php
$file = "log.txt";
$contents = file_get_contents($file);
$lines = explode("\n", $contents);

$log_json = array();

foreach ($lines as $count => $log) {
    if (!empty($log)) {
        $data = explode("[~]", trim($log));
        $entry = array(
            "title" => $data[0],
            "url" => $data[1],
            "thumbnail" => $data[2],
        );
        $log_json[] = $entry;
    }
    if ($count == 4) {
        break;
    }

}

echo json_encode($log_json);
