<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Frontend Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Frontend {

	/**
	 * Instance
	 *
	 * @return Prime_Frontend
	 */
	public static function instance()
	{
		return new Prime_Frontend;
	}

	/**
	 * Constructor
	 *
	 * @return self
	 */
	public function __construct()
	{
		return $this;
	}

	/**
	 * Module
	 *
	 * @return Prime_Frontend
	 */
	public static function module($name = NULL, array $options = array())
	{
		$module = ORM::factory('Prime_Module', ['slug' => $name]);

		if ( ! $module->loaded())
			return '<!-- Module not found -->';

		// fake region with settings json encoded
		$region = (object) [
			'settings' => json_encode($options)
		];

		// call module
		$module = call_user_func_array([$module->controller, 'factory'], [$region]);

		// return its render function
		return $module->render();
	}

} // End Prime Frontend