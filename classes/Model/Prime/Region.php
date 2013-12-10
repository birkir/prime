<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Region Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Region extends Model_Prime {

	/**
	 * @var boolean Add sortable with specific keys
	 */
	protected $_sortable = ['prime_page_id', 'name', 'sticky'];

	/**
	 * Belongs to relationships
	 *
	 * @var array Relationships
	 */
	protected $_belongs_to = [
		'module' => [
			'model'       => 'Prime_Module',
			'foreign_key' => 'prime_module_id',
		]
	];

	protected $_table_columns = array(
		'id' => array(),
		'prime_page_id' => array(),
		'prime_module_id' => array(),
		'sticky' => array(),
		'name' => array(),
		'settings' => array(),
		'position' => array(),
		'updated_at' => array(),
		'updated_by' => array(),
		'deleted_at' => array(),
		'published' => array(),
		'revision' => array()
	);

	/**
	 * Get region module
	 *
	 * @return Prime_Module_?
	 */
	public function module()
	{
		if ( ! class_exists($this->module->controller))
		{
			// Could not find module class 
			Kohana::$log->add(Log::ERROR, 'Class [:module] was not found', array(
				':module' => $this->module->controller
			));

			return $this;
		}

		// Call the module
		return call_user_func_array(array($this->module->controller, 'factory'), array($this));
	}

}