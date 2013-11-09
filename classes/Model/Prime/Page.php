<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Page extends Model_Prime {

	/**
	 * @var array Has many relationship
	 */
	protected $_has_many = [
		'pages' => [
			'model'       => 'Prime_Page',
			'foreign_key' => 'parent_id',
			'far_key'     => 'id'
		],
		'regions' => [
			'model'       => 'Prime_Region',
			'foreign_key' => 'prime_page_id',
			'far_key'     => 'id'
		]
	];

	/**
	 * Get selected page by URI
	 *
	 * @param  string Location URI
	 * @return ORM
	 */
	public function selected($path = NULL)
	{
		// default page
		if (empty($path))
		{
			return $this->where('id', '=', Arr::get(Prime::$config, 'default_page_id', NULL))
			->find();
		}

		// inheritance
		$template = 'default';
		$language = 'en-us';

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
			->where('slug', '=', $slug)
			->where('parent_id', ! isset($page) ? 'IS' : '=', ! isset($page) ? NULL : $page->id)
			->find();

			if ($page->template !== NULL)
				$template = $page->template;

			if ($page->language !== NULL)
				$language = $page->language;

			if ( ! $page->loaded())
				break;

			// set last page
			$last = $page;
		}

		// check last page for regions uri
		if ( ! $page->loaded() AND $last->loaded())
		{
			// combine overload parts
			$uri = implode('/', array_slice($uri, $i));

			// loop through regions
			foreach ($last->regions->order_by('position', 'ASC')->find_all() as $region)
			{
				// check if module routes
				if ($region->module()->route($uri))
				{
					// set overload uri
					Prime::$page_overload_uri = $uri;

					// return last loaded page
					return $last;
				}
			}
		}

		if ($page->loaded())
		{
			if ($page->template === NULL)
				$page->template = $template;

			if ($page->language === NULL)
				$page->language = $language;
		}

		return $page;
	}

	/**
	 * Get the absolute page uri
	 *
	 * @param  ORM    Page object
	 * @return string
	 */
	public function uri()
	{
		// load page
		$page = $this;

		// set first slug
		$uri = [$page->slug];

		// only allow loaded pages
		if ( ! $page->loaded())
			return;

		while ($page->loaded())
		{
			// find parent page
			$page = ORM::factory('Prime_Page')
			->where('id', '=', $page->parent_id)
			->find();

			$uri[] = $page->slug;
		}

		// reverse the array
		$uri = array_reverse($uri);

		// join together
		return implode('/', $uri);
	}

	/**
	 * Generate page slug
	 *
	 * @param  string Pagename
	 * @return string
	 */
	public function slug($str = NULL)
	{
		$str = UTF8::strtolower($str);
		$str = str_replace(' ', '-', $str);
		$str = UTF8::transliterate_to_ascii($str);
		$str = str_replace('&', 'and', $str);
		$str = preg_replace('/[^\w-]+/', NULL, $str);
		$str = preg_replace('/\-+/', '-', $str);
		$str = preg_replace('/\-$/', '', $str);

		return $str;
	}

	/**
	 * Overwrite page save with validation
	 *
	 * @param  Validation Validation object
	 * @return ORM
	 */
	public function save(Validation $validation = NULL)
	{
		// old position and parent_id
		$old = $this->original_values();

		// generate slug
		if ((bool) $this->slug_auto === TRUE AND Arr::get($old, 'name') !== $this->name)
		{
			$this->slug = $this->slug($this->name);
			$count = 0;
			$not_available = TRUE;

			while ($not_available)
			{
				$not_available = (bool) DB::select([DB::expr('COUNT(*)'), 'sum'])->from('prime_pages')
				->where('parent_id', $this->parent_id === NULL ? 'IS' : '=', $this->parent_id)
				->where('id', '!=', $this->id)
				->where('slug', '=', $this->slug.($count > 0 ? '-'.$count : NULL))
				->execute()
				->get('sum', 0);

				$count++;
			}
		}

		return parent::save($validation);
	}

	public function lucene(Zend_Search_Lucene_Document $document, $score = 0.0)
	{
		foreach ($document->getFieldNames() as $name)
		{
			// Set search result title etc.
			$this->_object[$name] = $document->getFieldValue($name);
		}

		// Set search result score
		$this->_object['score'] = $score;

		return $this;
	}

} // End Prime Page