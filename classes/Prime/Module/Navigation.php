<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Navigation
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Html
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Navigation extends Prime_Module {

	public static function factory($region)
	{
		return new Prime_Module_Navigation($region);
	}

	/**
	 * Parameters to configure module
	 * 
	 * @return array
	 */
	public function params()
	{
		return array
		(
			'expanded' => array
			(
				'name'    => 'Expanded',
				'group'   => 'General',
				'field'   => 'Prime_Field_Boolean',
				'default' => FALSE
			),
			'from_level' => array
			(
				'name'    => 'From level',
				'group'   => 'General',
				'field'   => 'Prime_Field_String',
				'default' => NULL
			),
			'to_level' => array
			(
				'name'    => 'To level',
				'group'   => 'General',
				'field'   => 'Prime_Field_String',
				'default' => NULL
			),
			'root_page' => array
			(
				'name'    => 'Root page',
				'group'   => 'General',
				'field'   => 'Prime_Field_Page',
				'default' => NULL
			),
			'template' => array
			(
				'name'    => 'Template',
				'group'   => 'Layout',
				'field'   => 'Prime_Field_Template',
				'properties' => array(
					'scope' => 'module/navigation'
				),
				'default' => 'default'
			)
		);
	}

	public static function actives($page)
	{
		$ret = array($page->id);

		while ($page->loaded() AND intval($page->parent_id) !== 0)
		{
			$page = ORM::factory('Prime_Page')
			->where('id', '=', $page->parent_id)
			->where('deleted', '=', 0)
			->find();

			$ret[] = $page->id;
		}

		return $ret;
	}

	public static function prefix($page = 0)
	{
		$page = ORM::factory('Prime_Page')
		->where('id', '=', $page)
		->where('deleted', '=', 0)
		->find();

		$alias = $page->alias;

		while ($page->loaded() AND intval($page->parent_id) !== 0)
		{
			$page = ORM::factory('Prime_Page')
			->where('id', '=', $page->parent_id)
			->where('deleted', '=', 0)
			->find();

			$alias = $page->alias.'/'.$alias;
		}

		return $alias;
	}

	/**
	 * Generate nested pages array
	 * 
	 * @param  integer $page  Page ID or NULL
	 * @param  integer $level Level of childrens
	 * @param  string  $alias Append alias to url
	 * @return array
	 */
	public static function tree($settings = array(), $page = NULL, $level = 1, $alias = '')
	{
		// null page variable
		$alias = ($page === NULL ? self::prefix($settings['root_page']) : $alias);
		$page = ($page === NULL ? $settings['root_page'] : $page);
		$page = (intval($page) === 0 ? NULL : $page);

		// default level values
		$settings['from_level'] = empty($settings['from_level']) ? 1 : $settings['from_level'];
		$settings['to_level'] = empty($settings['to_level']) ? 999 : $settings['to_level'];

		// setup orm
		$items = ORM::factory('Prime_Page')
		->select(array(DB::select(DB::expr('COUNT(*)'))->from('prime_pages')->where('deleted', '=', 0)->where('parent_id', '=', DB::expr('`prime_page`.`id`')), 'childs'))
		->where('parent_id', ($page === NULL ? 'IS' : '='), $page)
		->where('deleted', '=', 0)
		->order_by('index', 'ASC')
		->find_all()
		->as_array();

		// pages array
		$pages = array();

		// loop through items
		foreach ($items as $i => $item)
		{
			// we want new object
			$node = (object) $item->as_array();

			// set level
			$node->level = $level;

			// set url
			$node->url = $alias.'/'.$node->alias;

			// set selected page
			$node->selected = $settings['selected']->id === $node->id;

			// set active page
			$node->active = in_array($node->id, $settings['active']);

			// set children
			$node->children = $node->childs > 0 ? self::tree($settings, $node->id, $level + 1, $node->url) : array();

			if ($settings['to_level'] <= $node->level OR $settings['expanded'] === FALSE)
			{
				$node->children = array();
			}

			// append to pages array
			$pages[] = $node;
		}

		// return pages array
		return $pages;
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// set selected page
		$this->settings['selected'] = Prime::$page->selected();

		// nest backward
		$this->settings['active'] = self::actives($this->settings['selected']);

		// setup view
		$view = View::factory('module/navigation/'.$this->settings['template'])
		->set('items', self::tree($this->settings));

		return $view;
	}

	/**
	 * Save settings
	 *
	 * @return void
	 */
	public function save(array $params = array())
	{
		return parent::save($params);
	}

} // End Prime Module Navigation