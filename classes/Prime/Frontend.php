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

	public static function instance()
	{
		return new Prime_Frontend;
	}

	public function __construct()
	{
		return $this;
	}

	public static function module($name = NULL, array $options = array())
	{
		// create module name
		$class_name = 'Prime_Module_'.UTF8::ucfirst($name);

		// fake region with settings json encoded
		$region = (object) [
			'settings' => json_encode($options)
		];

		// call module
		$module = call_user_func_array([$class_name, 'factory'], [$region]);

		// return its render function
		return $module->render();
	}

} // End Prime Frontend