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

	/**
	 * @var ORM Region container
	 */
	public $_region;

	/**
	 * @var object Merged settings with default values
	 */
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

	/**
	 * Module constructor
	 * 
	 * @param ORM $region
	 * @return self
	 */
	public function __construct($region)
	{
		// set region global
		$this->_region = $region;

		// get defaults
		$this->settings = [];

		// add params to settings array
		foreach ($this->params() as $group)
		{
			foreach ($group as $name => $param)
			{
				$this->settings[$param['name']] = isset($param['default']) ? $param['default'] : NULL;
			}
		}

		// decode settings json
		try
		{
			$this->settings = Arr::merge($this->settings, json_decode($region->settings, TRUE));
		}
		catch (Exception $e)
		{
			Kohana::$log->add(Log::ERROR, 'Could not decode settings for region item [:region].', array(
				':region' => $region->id
			));
		}

		// singleton
		return $this;
	}


	/**
	 * Check url for internal module route
	 * 
	 * @return boolean
	 */
	public function route($uri = NULL)
	{
		return FALSE;
	}

	/**
	 * Actions to show in live mode, modules should extend this function.
	 * 
	 * @return array
	 */
	public function actions()
	{
		return [
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'icon-wrench']).'></i>', [
				'onclick' => 'window.top.prime.page.region.settings('.$this->_region->id.'); return false;'
			]),
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'icon-trash']).'></i>', [
				'onclick' => 'window.top.prime.page.region.remove('.$this->_region->id.'); return false;'
			])/*,
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'icon-move']).'></i>', [
				'class'   => 'prime-move-handle',
				'onclick' => 'return false;'
			])*/
		];
	}

	/**
	 * Process $_POST list to acceptable JSON data and update Model
	 *
	 * @param array Parameters
	 * @return string
	 */
	public function save(array $params = NULL)
	{
		if ($params)
		{
			// loop through module params
			foreach ($this->params() as $group => $fields)
			{
				foreach ($fields as $field)
				{
					if (isset($params[$field['name']]))
					{
						// call field
						$class = call_user_func_array(array($field['field'], 'factory'), array($field));

						// process its save state
						$this->settings[$field['name']] = $class->prepare_value($params[$field['name']]);
					}
				}
			}
		}

		// update settings item
		$this->_region->settings = json_encode($this->settings);

		// save region
		$this->_region->save();
	}

} // End Prime Module