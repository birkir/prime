<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Frontend
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Frontend {

	/**
	 * Get new frontend instance
	 *
	 * @return Prime_Frontend
	 */
	public static function instance()
	{
		return new Prime_Frontend;
	}

	/**
	 * Load new instance of frontend
	 *
	 * @return self
	 */
	public function __construct()
	{
		return $this;
	}

	/**
	 * Append module to template with slugs.
	 *
	 * @return Prime_Frontend
	 */
	public static function module($name = NULL, array $options = array())
	{
		// Find module by slug
		$module = ORM::factory('Prime_Module', ['slug' => $name]);

		if ( ! $module->loaded())
			return '<!-- Module not found -->';

		// Setup region with generated JSON options
		$region = (object) [
			'settings' => json_encode($options)
		];

		// Call module controller
		$module = call_user_func_array([$module->controller, 'factory'], [$region]);

		return $module->render();
	}

}