<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Navigation
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Navigation
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Navigation extends Prime_Module {

	/**
	 * Parameters to configure module
	 * 
	 * @return array
	 */
	public function params()
	{
		return [
			'General' => [
				[
					'name'    => 'from_level',
					'caption' => 'From level',
					'field'   => 'Prime_Field_String',
					'default' => 0
				],
				[
					'name'    => 'to_level',
					'caption' => 'To level',
					'field'   => 'Prime_Field_String',
					'default' => -1
				],
				[
					'name'    => 'root_page',
					'caption' => 'Root page',
					'field'   => 'Prime_Field_Page',
					'default' => NULL
				],
				[
					'name'    => 'selected_page',
					'caption' => 'Selected page',
					'field'   => 'Prime_Field_Page',
					'default' => NULL
				],
				[
					'name'    => 'expanded',
					'caption' => 'Expanded',
					'field'   => 'Prime_Field_Boolean',
					'default' => FALSE
				],
				[
					'name'    => 'show_invisible',
					'caption' => 'Show invisible pages',
					'field'   => 'Prime_Field_Boolean',
					'default' => FALSE
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/navigation'
					]
				]
			]
		];
	}

	/**
	 * Generate tree for navigation module
	 *
	 * @param  Database_Result Pages to loop through
	 * @param  string          URI to append to
	 * @return array
	 */
	public function generate_tree($pages = NULL, $slug = NULL)
	{
		// only visible pagse
		if ( ! $this->option('show_invisible', FALSE))
		{
			$pages->where('visible', '=', 1);
		}

		// setup function variables
		$active_in_tree = FALSE;
		$expanded = (bool) $this->option('expanded', FALSE);
		$from_level = intval($this->option('from_level', 1));
		$to_level = intval($this->option('to_level', -1));

		// set flags
		$pages->where('disabled', '=', 0);

		// order by position
		$pages->order_by('position', 'ASC');

		// process query
		$pages = $pages->find_all();

		// get levels
		$level = count(explode('/', $slug)) - 1;

		// set tree
		$tree = [];

		// loop through pages
		foreach ($pages as $page)
		{
			// setup node array
			$node = [];

			// set node parameters
			$node['id']          = intval($page->id);
			$node['name']        = $page->name;
			$node['slug']        = $page->slug;
			$node['language']    = $page->language;
			$node['description'] = $page->description;
			$node['keywords']    = $page->keywords;
			$node['position']    = intval($page->position);
			$node['visible']     = (bool) $page->visible;
			$node['no_index']    = (bool) $page->noindex;
			$node['no_follow']   = (bool) $page->nofollow;

			// properties
			$node['properties'] = [];

			// additional parameters
			$node['url']      = $slug.'/'.$page->slug;
			$node['level']    = $level;
			$node['active']   = in_array($node['id'], $this->active_pages);
			$node['selected'] = $this->active_pages[0] === $node['id'];
			$node['pages']    = [];

			if ($node['active'])
				$active_in_tree = TRUE;

			// expanded pages
			if (( ! $expanded AND $node['active']) OR $expanded)
			{
				$node['pages']  = $this->generate_tree($page->pages, $node['url']);
			}

			// check for page redirect flag
			if ($page->redirect)
			{
				// set redireect url as URL
				$node['url'] = $page->redirect_url;
			}

			// stop recursive if level exceeds to_level
			if ($to_level <= ($level + 1))
			{
				$node['pages'] = [];
			}

			// set from level
			if ( ! isset($this->from_node) AND $from_level === ($level + 2) AND $node['active'])
			{
				$this->from_node = $node['pages'];
			}

			// push to tree array
			$tree[] = $node;
		}

		// return tree
		return $tree;
	}

	/**
	 * Get active nodes in tree
	 *
	 * @return array
	 */
	public function actives()
	{
		// set selected page
		$selected = intval($this->option('selected_page', 0));

		// get page from Prime class or find selected page
		$page = $selected > 0 ? ORM::factory('Prime_Page', $selected) : Prime::$selected_page;

		// setup return array with current page as first item
		$ret = array(intval($page->id));

		// while page has parent page
		while ($page->loaded() AND intval($page->parent_id) !== 0)
		{
			// find parent page
			$page = ORM::factory('Prime_Page')
			->where('id', '=', $page->parent_id)
			->find();

			// push to return array
			$ret[] = intval($page->id);
		}

		return $ret;
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// initialize pages orm model
		$pages = ORM::factory('Prime_Page');

		// check for rootpage option
		if ($this->option('root_page', 0) > 0)
		{
			// get root page model
			$root_page = ORM::factory('Prime_Page', $this->option('root_page', 0));

			// check if root page exists
			if ( ! $root_page->loaded())
				throw new Kohana_Exception('Could not find root page :page', array(':page' => $this->option('root_page', 0)));

			// alter pages model
			$pages->where('parent_id', '=', $root_page->id);
		}
		else
		{
			$pages->where('parent_id', 'IS', NULL);
		}

		// set active pages
		$this->active_pages = $this->actives();

		// generate tree
		$pages = $this->generate_tree($pages);

		// from node
		if (isset($this->from_node))
		{
			$pages = $this->from_node;
		}

		// setup view
		$view = View::factory('module/navigation/'.$this->settings['template'])
		->set('pages', $pages);

		return $view;
	}

} // End Prime Module Navigation