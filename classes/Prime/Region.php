<?php 
/**
 * Prime Region Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Region {

	/**
	 * Template region container
	 * @var array
	 */
	private $items = array();

	/**
	 * Singleton instance
	 * 
	 * @return Prime_Region
	 */
	public static function instance()
	{
		return new Prime_Region;
	}

	/**
	 * Class constructor
	 *
	 * @return self
	 */
	public function __construct()
	{
		return $this;
	}

	/**
	 * Attach region to template region container
	 * 
	 * @param  Model_Prime_Region $item Region to attach
	 * @return self
	 */
	public function attach($item = NULL)
	{
		// check if region name exists
		if ( ! isset($this->items[$item->name]))
		{
			// create array instance
			$this->items[$item->name] = array();
		}

		// check if the class exists
		if ( ! class_exists($item->module->controller))
		{
			Kohana::$log->add(Log::ERROR, 'Class [:module] was not found', array(
				':module' => $item->module->controller
			));

			$this->items[$item->name][$item->id] = View::factory('Prime/Region/Error')
			->set('message', 'Class \''.$item->module->controller.'\' not found.');

			return $this;
		}

		// call the module
		$module = call_user_func_array(array($item->module->controller, 'factory'), array($item));

		// attach module to region
		$this->items[$item->name][$item->id] = $module->render();

		// singleton
		return $this;
	}

	/**
	 * Get overload constructor
	 * 
	 * @param  string $name
	 * @return View
	 */
	public function __get($name)
	{
		// render its view through region iterator
		return View::factory('Prime/Region/Iterator')
		->set('items', isset($this->items[$name]) ? $this->items[$name] : array())
		->set('name', $name);
	}

} // End Prime Region Class