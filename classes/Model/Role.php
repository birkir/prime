<?php defined('SYSPATH') or die('No direct script access.');

class Model_Role extends Model_Auth_Role {

	protected $_table_columns = array(
		'id' => array(),
		'name' => array(),
		'description' => array(),
		'updated_at' => array(),
		'updated_by' => array(),
		'deleted_at' => array()
	);

}