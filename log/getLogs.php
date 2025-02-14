<?php
$file = "log.txt";
$contents = file_get_contents($file);
$lines = explode("\n", $contents);

$logs = array();

// store previous line
$prevLine = "";

// log counter
$count = 0;

// loop through lines
foreach ($lines as $lineNo => $currentLine) {
    if (!empty($currentLine)) {
        // check if prev line is not the same
        if ($prevLine == $currentLine) {
            continue;
        } else {
            $prevLine = $currentLine;
        }

        // format logs and put them in an array
        $data = explode("[~]", trim($currentLine));

        $logEntry = array(
            "title" => $data[0],
            "url" => $data[1],
            "thumbnail" => $data[2],
        );

        // add a log to logs array
        $logs[] = $logEntry;
    }

    // num of logs to show
    if ($count == 9) {
        break;
    }

    $count++;
}

// output array
echo json_encode($logs);
