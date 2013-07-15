<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Region Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Region extends ORM {

	/**
	 * Belongs to relationships
	 * @var array
	 */
	protected $_belongs_to = [
		'module' => [
			'model'       => 'Prime_Module',
			'foreign_key' => 'prime_module_id',
		]
	];

	public function module()
	{
		if ( ! $this->loaded())
			return;

		// check if the class exists
		if ( ! class_exists($this->module->controller))
		{
			Kohana::$log->add(Log::ERROR, 'Class [:module] was not found', array(
				':module' => $this->module->controller
			));

			return $this;
		}

		// call the module
		return call_user_func_array(array($this->module->controller, 'factory'), array($this));
	}

} // End Prime Region Model