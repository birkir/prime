<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module {

	public $_region;

	public $settings;

	/**
	 * Factory
	 *
	 * @return Prime_Module
	 */
	public static function factory($region)
	{
		// get called class name
		$class_name = get_called_class();

		// return new instance of class
		return new $class_name($region);
	}

	public function __construct($region)
	{
		// set region global
		$this->_region = $region;

		// decode settings json
		$this->settings = Arr::merge($this->defaults(), json_decode($this->_region->settings, TRUE));

		// singleton
		return $this;
	}

	public function defaults()
	{
		$fields = $this->params();
		$defaults = array();

		foreach ($fields as $name => $field)
		{
			$defaults[$name] = isset($field['default']) ? $field['default'] : NULL;
		}
		
		return $defaults;
	}

	/**
	 * Buttons to show in live mode
	 * 
	 * @return array
	 */
	public function live()
	{
		return array
		(
			array
			(
				'name'   => __('Settings'),
				'action' => 'prime.scope.page.region.settings('.$this->_region->id.');',
				'icon'   => 'wrench'
			),
			array
			(
				'name'   => __('Delete'),
				'action' => 'prime.scope.page.region.remove('.$this->_region->id.');',
				'icon'   => 'remove'
			)
		);
	}

	/**
	 * Process $_POST list to acceptable JSON data and update Model
	 *
	 * @param array Parameters
	 * @return string
	 */
	public function save(array $params = array())
	{
		// get defaults from module
		$items = Arr::merge($this->defaults(), $params);

		// loop through module params
		foreach ($this->params() as $name => $param)
		{
			// call field
			$field = call_user_func_array(array($param['field'], 'factory'), array($param));

			// process its save state
			$items[$name] = $field->save($items[$name]);
		}

		// update settings item
		$this->_region->settings = json_encode($items);

		// save region
		$this->_region->save();
	}
}