<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Page extends ORM {

	protected $_has_many = array
	(
		'pages' => array
		(
			'model'       => 'Prime_Page',
			'foreign_key' => 'parent_id',
			'far_key'     => 'id'
		),
		'regions' => array
		(
			'model'       => 'Prime_Region',
			'foreign_key' => 'prime_page_id',
			'far_key'     => 'id'
		)
	);

	public function selected($path = NULL)
	{
		// default page
		if (empty($path))
		{
			return $this->where('id', '=', Arr::get(Prime::$config, 'default_page_id', NULL))
			->find();
		}

		// split url path
		$uri = explode('/', $path);

		// initialize last found page as ORM model
		$last = ORM::factory('Prime_Page');

		// loop through uri
		for ($i = 0; $i < count($uri); $i++)
		{
			// get slug
			$slug = $uri[$i];

			// build page orm
			$page = ORM::factory('Prime_Page')
			->base()
			->where('slug', '=', $slug)
			->where('parent_id', ! isset($page) ? 'IS' : '=', ! isset($page) ? NULL : $page->id)
			->find();

			// set last page
			$last = $page;
		}

		return $page;
	}

	public function base()
	{
		// only not deleted pages
		$this->where('deleted', '=', 0);

		// order by item position ascending
		$this->order_by('position', 'ASC');

		// return ORM for further process
		return $this;
	}

	/**
	 * Recursivly find sub pages of loaded record
	 * @return ORM
	 */
	public function recursive()
	{
		return ORM::factory('Prime_Page')
		->base()
		->where('parent_id', $this->loaded() ? '=' : 'IS', $this->loaded() ? $this->id : NULL);
	}

} // End Prime Page