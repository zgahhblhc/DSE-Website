<?php
/**
 * Author: Hansheng Zhao
 * Date: 9/8/2017
 * Time: 19:19
 */

namespace Ancient;

/**
 * Statistic Class
 * A class for statistics
 */
class Statistic {
  // The DBA database object
  private $database = null;
  // The request array
  private $request = null;
  // The response array
  private $response = null;

  /**
   * Statistic constructor.
   * @param $database DBA The database object
   */
  public function __construct($database) {
    // Store database object to private variable
    $this->database = $database;
  }

  /**
   * Save the request array and process
   * @param $request array The request array
   */
  public function __invoke($request) {
    // Store the request array to private variable
    $this->request = $request;
    // Initialize the response to default array
    $this->response = [
      'headers' => [
        'Cache-Control: private, no-cache, proxy-revalidate, max-age=0',
        'Content-Disposition: inline'
      ],
      'payload' => []
    ];
    // Process the request array to create result
    $this->process();
    // Generate the response array after process
    $this->generate();
    // Return the generated response array
    return $this->response;
  }

  /**
 * Acquire content from database using key & value pair
 * @param $key string The key
 * @param $value null|string|array The value
 * @return string The content
 */
  private function get($key, $value = null) {
    $result = [];
    if (is_array($value)) {
      foreach ($value as $subkey => &$subval) {
        $result[] = $this->database->get(json_encode([$key => $subval]));
      }
    } elseif (is_null($value) || empty($value)) {
      $result = $this->database->get($key);
    } else {
      $result = $this->database->get(json_encode([$key => $value]));
    }
    return $result;
  }

  /**
   * Delete content from database using key & value pair
   * @param $key string The key
   * @param $value null|string|array The value
   * @return bool|array The operation status
   */
  private function del($key, $value = null) {
    $result = [];
    if (is_array($value)) {
      foreach ($value as $subkey => &$subval) {
        $result[] = $this->database->del(json_encode([$key => $subval]));
      }
    } elseif (is_null($value) || empty($value)) {
      $result = $this->database->del($key);
    } else {
      $result = $this->database->del(json_encode([$key => $value]));
    }
    return $result;
  }

  /**
   * Operate on database with provided key & value pair
   * @param $key string The parameter for key
   * @param $value null|string|array The parameter for value
   */
  private function operate($key, $value = null) {
    // Update row with incremented count
    if (is_array($value)) {
      foreach ($value as $subkey => &$subval) {$this->operate($key, $subval);}
    } elseif (is_null($value) || empty($value)) {
      $this->database->incr($key);
    } else {
      $this->database->incr(json_encode([$key => $value]));
    }
    // Return null
    return null;
  }

  /**
   * Process provided command and options
   * @param $key string The potential command type
   * @param $value string The potential command options
   */
  private function command($key, $value) {
    // Flag for checking if command is valid
    $valid = false;
    // Initialize result dataset with current metadata
    $result = ['metadata' => ['command' => '', 'key' => [], 'value' => []], 'content' => []];
    // Check and build commands from provide key & value pairs
    switch ($key) {
      case '_get':
        // Valid command
        $valid = true;
        $result['metadata']['command'] = '_get';
        $value = is_string($value) ? [$value] : $value;
        foreach ($value as $subkey => $subval) {
          // Acquire parameters from command option
          $payload = is_string($subval) ? (json_decode($subval, true) ?: trim(strip_tags($subval))): [];
          if (is_string($payload)) {
            $request = [];
            parse_str($payload, $request);
            $payload = $request;
          }
          foreach($payload as $key => $value) {
            $key = $result['metadata']['key'][] = trim(strip_tags($key));
            $value = $result['metadata']['value'][] = is_string($value) ? trim(strip_tags($value)) : $value;
            $result['content'][] = $this->get($key, $value);
          }
        }
        break;
      case '_del':
        // Valid command
        $valid = true;
        $result['metadata']['command'] = '_del';
        $value = is_string($value) ? [$value] : $value;
        forEach($value as $subkey => $subval) {
          // Acquire parameters from command option
          $payload = is_string($subval) ? (json_decode($subval, true) ?: trim(strip_tags($subval))) : [];
          if (is_string($payload)) {
            $request = [];
            parse_str($payload, $request);
            $payload = $request;
          }
          foreach($payload as $key => $value) {
            $key = $result['metadata']['key'][] = trim(strip_tags($key));
            $value = $result['metadata']['value'][] = is_string($value) ? trim(strip_tags($value)) : $value;
            $result['content'][] = $this->get($key, $value);
            $this->del($key, $value);
          }
        }
        break;
    }
    // Check if result dataset should be saved to response payload
    if ($valid) {
      // Push the result array to private variable
      array_push($this->response['payload'], $result);
    } else {
      // Invalid command, perform operation normally
      $this->operate($key, $value);
    }
    // Return null
    return null;
  }

  /**
   * Process the request and build the result
   */
  private function process() {
    // Iterate over the request object
    forEach($this->request as $key => &$value) {
      // Acquire request key & value pair
      $key = trim(strip_tags($key));
      $value = is_string($value) ? trim(strip_tags($value)) : $value;
      // Check if command supplied in request
      if (preg_match('/^_[^_]*/', $key)) {
        // Build result payload from command
        $this->command($key, $value);
      } else {
        // Operate on supplied key & value pair
        $this->operate($key, $value);
      }
    }
    // Return null
    return null;
  }

  /**
   * Generate result array after request processed
   */
  private function generate() {
    // Check if result payload is empty
    if (empty($this->response['payload'])) {
      // Set pixel GIF as payload if payload is empty
      array_push($this->response['headers'], 'Content-Type: image/gif');
      $this->response['payload'] = base64_decode('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=');
    } else {
      // Set the result to parsed JSON dataset if payload is not empty
      array_push($this->response['headers'], 'Content-Type: application/json');
      $this->response['payload'] = json_encode($this->response['payload']);
    }
    // Return null
    return null;
  }
}
