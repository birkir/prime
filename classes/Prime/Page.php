<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Page {

	/**
	 * Constructer
	 */
	public function __construct()
	{
		return $this;
	}

	/**
	 * Singleton instance
	 * 
	 * @return Prime_Page
	 */
	public static function instance()
	{
		return new Prime_Page;
	}

	/**
	 * Generate page alias from it's name and parent_id
	 * 
	 * @param  string  $str       Page name
	 * @param  integer $parent_id Parent page id
	 * @return string
	 */
	public static function alias($str, $parent_id = 0)
	{
		// base number
		$num = 0;

		// generate alias with dash
		$str = $_str = URL::title($str, '-', TRUE);

		// find page with same alias and parent page id
		$page = ORM::factory('Prime_Page')
		->where('parent_id', '=', $parent_id)
		->where('deleted', '=', 0)
		->where('alias', '=', $str)
		->find();

		while ($page->loaded())
		{
			// add incremented number to it
			$str = $_str.'-'.(++$num);

			// check for page
			$page = ORM::factory('Prime_Page')
			->where('parent_id', '=', $parent_id)
			->where('deleted', '=', 0)
			->where('alias', '=', $str)
			->find();
		}

		// return generated string
		return $str;
	}

	/**
	 * Get selected page
	 * 
	 * @param  Prime_Website $website Website object
	 * @return Prime_Page
	 */
	public static function selected($website = NULL)
	{
		// load website config if not loaded
		if ($website === NULL)
		{
			// get from prime
			$website = Prime::$website->settings();
		}

		// get current request
		$request = Request::current();

		// get uri
		$uri = $request->param('query');

		// if default page
		if ($qp = Arr::get($request->query(), 'page'))
		{
			// get pageid from query string
			$page = ORM::factory('Prime_page', $qp);
		}
		else if (empty($uri))
		{
			// get default page id from website config
			$page = ORM::factory('Prime_Page', Arr::get($website, 'default_page_id', 1));
		}
		else
		{
			// split query
			$uri = explode('/', $uri);

			// initialize last found page as ORM model
			$last = ORM::factory('Prime_Page');

			// loop through uri
			for ($i = 0; $i < count($uri); $i++)
			{
				// get alias
				$alias = $uri[$i];

				// build page orm
				$page = ORM::factory('Prime_Page')
				->where('alias', '=', $alias)
				->where('parent_id', ! isset($page) ? 'IS' : '=', ! isset($page) ? NULL : $page->id)
				->find();

				// check if not loaded
				if ( ! $page->loaded())
				{
					// check for page with no alias
					$page = ORM::factory('Prime_Page')
					->where('alias', '=', '')
					->where('parent_id', ! $last->loaded() ? 'IS' : '=', ! $last->loaded() ? NULL : $last->id)
					->find();

					// step back
					$i--;

					// and continue finding selected page
					continue;
				}

				// check if not loaded
				if ( ! $page->loaded())
				{
					// check if last page was loaded
					if ($last->loaded())
					{
						// get route
						$route = implode('/', array_slice($uri, $i));

						// loop though regions on page
						foreach ($last->regions->get_all() as $region)
						{
							// load module
							$module = call_user_func_array(array($region->module->controller, 'factory'), array($region));

							// check module for route
							if ($module->route($route))
							{
								// return last page
								return $last;
							}
						}
					}

					// defaults to false
					return FALSE;
				}

				// set last page
				$last = $page;
			}
		}

		// we must have found an page !
		return $page;
	}
}