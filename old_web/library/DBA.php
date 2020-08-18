<?php
/**
 * Author: Hansheng Zhao
 * Date: 9/8/2017
 * Time: 18:04
 */

namespace Ancient;

/**
 * Class DBA
 * A wrapper for DBA database
 */
class DBA {
  private $path = ''; // <string> The database path
  private $handler = ''; // <string> The database handler

  /**
   * DBA constructor.
   * Create connection to database.
   * @param $path string The database path
   * @param $handler string The DBA handler
   */
  public function __construct($path, $handler = null) {
    // Save database path to private variable
    $this->path = $path;
    // Check if handler is not provided
    if (is_null($handler)) {
      // Acquire available handlers
      $handlers = dba_handlers();
      // Check and set handler according to search
      if (in_array('tcadb', $handlers)) {
        $handler = 'tcadb';
      } elseif (in_array('qdbm', $handlers)) {
        $handler = 'qdbm';
      } elseif (in_array('db4', $handlers)) {
        $handler = 'db4';
      } elseif (in_array('gdbm', $handlers)) {
        $handler = 'gdbm';
      } else {
        $handler = 'inifile';
      }
    }
    // Save handler to private variable
    $this->handler = $handler;
    // Create database file if doesn't exists
    $resource = dba_open($path, 'c', $handler);
    dba_close($resource);
  }

  /**
   * Invoke method for set|get shortcut
   * @param $key string The key
   * @param $value null|string The value
   * @return bool|string The operation result
   */
  public function __invoke($key, $value = null) {
    // Check if value provided to set|get
    return is_null($value)
      ? $this->get($key) : $this->set($key, $value);
  }

  /**
   * Has method for checking key existence
   * @param $key string The key
   * @return bool Whether the key exist or not
   */
  public function has($key) {
    // Open database with read lock
    $resource = dba_open(
      $this->path, 'rd', $this->handler
    );
    // Check if key exists in the database
    $flag = dba_exists($key, $resource);
    // Close database and return result
    dba_close($resource);
    return $flag;
  }

  /**
   * Set method for persistence.
   * @param $key string The key
   * @param $value string The value
   * @return bool The operation status
   */
  public function set($key, $value) {
    // Check if key exists
    $flag = $this->has($key);
    // Open database with write lock
    $resource = dba_open(
      $this->path, 'wd', $this->handler
    );
    // Insert or replace and get status
    $result = $flag
      ? dba_replace($key, $value, $resource)
      : dba_insert($key, $value, $resource);
    // Close database and return result
    dba_close($resource);
    return $result;
  }

  /**
   * Get method for retrieving.
   * @param $key string The key
   * @return string|null The value
   */
  public function get($key) {
    // Check if key exists
    if ($this->has($key)) {
      // Open database with read lock
      $resource = dba_open(
        $this->path, 'rd', $this->handler
      );
      // Acquire value from database
      $result = dba_fetch($key, $resource);
      // Close database and return result
      dba_close($resource);
      return $result;
    }
    return null;
  }

  /**
   * Del method for removing.
   * @param $key string The key
   * @return bool The operation status
   */
  public function del($key) {
    // Check if key exists
    if ($this->has($key)) {
      // Open database with write lock
      $resource = dba_open(
        $this->path, 'wd', $this->handler
      );
      // Delete key value pair from database
      $flag = dba_delete($key, $resource);
      // Close database and return result
      dba_close($resource);
      return $flag;
    }
    return false;
  }

  /**
   * Incr method for increment.
   * @param $key string The key
   * @param $step integer Increment step
   * @return bool The operation status
   */
  public function incr($key, $step = 1) {
    $value = (int)$this->get($key) + $step;
    return $this->set($key, $value);
  }

  /**
   * Decr method for decrement.
   * @param $key string The key
   * @param $step integer The decrement step
   * @return bool The operation status
   */
  public function decr($key, $step = 1) {
    $value = (int)$this->get($key) - $step;
    return $this->set($key, $value);
  }

  /**
   * Iterate method for acquiring all content.
   * @return array The database key-value pair
   */
  public function iterate() {
    $result = []; // Result array
    // Open database with read lock
    $resource = dba_open(
      $this->path, 'rd', $this->handler
    );
    $key = dba_firstkey($resource);
    while (is_string($key)) {
      $result[$key] = dba_fetch($key, $resource);
      $key = dba_nextkey($resource);
    }

    dba_close($resource);
    return $result;
  }

  /**
   * Clear method for clearing all content.
   * @return array The database key-value pair
   */
  public function clear() {
    $result = $this->iterate();
    // Open database with write lock
    $resource = dba_open(
      $this->path, 'wd', $this->handler
    );
    foreach (array_keys($result) as $key) {
      dba_delete($key, $resource);
    }
    // Close database and return result
    dba_close($resource);
    return $result;
  }
}
