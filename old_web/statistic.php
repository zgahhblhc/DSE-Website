<?php
/**
 * Author: Hansheng Zhao
 * Date: 9/8/2017
 * Time: 20:42
 */

// Acquire dependencies from library
require_once __DIR__ . '/library/DBA.php';
require_once __DIR__ . '/library/Statistic.php';
// Use DBA and Statistic class from Ancient namespace
use Ancient\DBA;
use Ancient\Statistic;

// Create new DBA database instance & create new Statistic instance
$statistic = new Statistic(new DBA(__DIR__ . '/library/.statistic', 'inifile'));
// Acquire response array
$result = $statistic($_GET);
// Setup appropriate headers
foreach ($result['headers'] as $header) {header($header);}
// Return response payload
echo $result['payload'];
