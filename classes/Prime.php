<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Contains low-level and most used methods in Prime:
 *
 * - Environment initialization
 * - Locating files within the cascading filesystem (overloaded)
 * - Most used functions in Prime CMS
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime {

	// Release version and codename
	const VERSION  = '3.3.0';
	const CODENAME = 'holymontain';

	// Delta environment (staging flag)
	const DELTA = TRUE;

	/**
	 * @var  boolean  Has [Prime::init] been called?
	 */
	protected static $_init = FALSE;

	/**
	 * @var  Config   Kohana Config object
	 */
	public static $config;

	/**
	 * @var  Prime_Region Template region container
	 */
	public static $region;

	/**
	 * @var  Prime_Page  Selected Page on Frontend
	 */
	public static $selected_page;

	/**
	 * @var  Boolean      Design mode on/off
	 */
	public static $design_mode;

	/**
	 * Singleton instance
	 */
	public static function init(array $settings = NULL)
	{
		if (Prime::$_init)
		{
			// Do not allow execution twice
			return;
		}

		// Load the prime configuration
		Prime::$config = Kohana::$config->load('prime');

		// Load region controller
		Prime::$region = new Prime_Region;

		// Check for design mode
		Prime::$design_mode = (bool) (Arr::get($_GET, 'mode', 'frontend') === 'design');

		// Prime is now initialized
		Prime::$_init = TRUE;
	}

	/**
	 * Get selected page from Request URI
	 *
	 * @param HTTP_Request The HTTP Request to use for detection
	 * @return Prime_Page Selected Page or NULL
	 */
	public static function selected(HTTP_Request $request)
	{
		Prime::$selected_page = ORM::factory('Prime_Page')
		->selected($request->param('query'));

		return Prime::$selected_page;
	}

	/**
	 * Prepare list of files to array for combobox
	 * 
	 * @param  array recursive array of files
	 * @return array
	 */
	public static function treeselect($nodes, $mask = 'views/', $level = 1)
	{
		// list buffer
		$list = [];

		// loop through nodes
		foreach ($nodes as $node)
		{
			// process recursive
			if (is_array($node))
			{
				// combine to list
				$list = Arr::merge($list, Prime::treeselect($node, $mask, ++$level));
			}
			else
			{
				$node = str_replace([APPPATH, MODPATH, SYSPATH], NULL, $node);
				$node = substr($node, 0, strlen($mask)) === $mask ? substr($node, strlen($mask)) : $node;
				$node = substr($node, 0, strrpos($node, '.'));
				$list[$node] = $node;
			}
		}

		return $list;
	}

	/**
	 * Cleans up the environment:
	 *
	 * - Destroy the Prime::$website and Prime::$page objects
	 * 
	 * @return void
	 */
	public static function deinit()
	{
		if (Prime::$_init)
		{
			// Destroy objects created by init
			Prime::$config = Prime::$region = NULL;

			// Prime is no longer initialized
			Prime::$_init = FALSE;
		}
	}

	/**
	 * Generates a version string based on the variables defined above.
	 * 
	 * @return string
	 */
	public static function version()
	{
		return 'Prime '.Prime::VERSION.' ('.Prime::CODENAME.')';
	}

} // End Prime