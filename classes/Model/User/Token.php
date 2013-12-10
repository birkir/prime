<?php defined('SYSPATH') or die('No direct script access.');

class Model_User_Token extends Model_Auth_User_Token {

	protected $_table_columns = array(
		'id' => array(),
		'user_id' => array(),
		'user_agent' => array(),
		'token' => array(),
		'created' => array(),
		'expires' => array()
	);
}