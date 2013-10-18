<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Page extends Controller_Prime_Template {

	/**
	 * @var bool Disable auto render
	 */
	public $auto_render = FALSE;


	/**
	 * @return void
	 */
	public function GetRegion(ORM $region)
	{
		// check if region is loaded
		if ($region->loaded())
		{
			// load its page id
			$page = ORM::factory('Prime_Page', $region->prime_page_id);

			// get things needed for region
			View::set_global('page', $page);
			View::set_global('prime', Prime_Frontend::instance());

			// setup view for region item
			$view = View::factory('Prime/Page/Region/Item')
			->set('item', $region->module());

			// whola
			return $view;
		}
	}

	/**
	 * @return void
	 */
	public function action_AddRegion()
	{
		$region = ORM::factory('Prime_Region');
		$region->prime_page_id = $this->request->query('page');
		$region->prime_module_id = $this->request->query('module');
		$region->name = $this->request->query('region');

		$ref = ORM::factory('Prime_Region', $this->request->query('ref'));

		if ($ref->loaded())
		{
			$pos = ($this->request->query('position') === 'above' ? 0 : $ref->position);

			DB::update('prime_regions')
			->set(['position' => DB::expr('`position` + 1')])
			->where('position', '>'.($pos === 0  ? '=' : NULL), $pos)
			->where('prime_page_id', '=', $ref->prime_page_id)
			->where('name', '=', $ref->name)
			->execute();

			$region->position = $pos;
		}
		else
		{
			$region->position = 0;
		}

		$region->save();

		$this->response->body(
			  '<div class="prime-region-item" data-id="'.$region->id.'">'
			. $this->GetRegion($region)
			. '<div class="prime-drop" data-position="below" style="display: none;">drop below</div>'
			. '</div>'
		);
	}

	/**
	 * @return void
	 */
	public function action_MovePage()
	{
		// node to move
		$page = ORM::factory('Prime_Page', $this->request->param('id'));

		// node to reference as above
		$ref = ORM::factory('Prime_Page', $this->request->query('ref'));

		// generate new position
		$new = $ref->loaded() ? $ref->position + ($page->position > $ref->position ? 1 : 0) : 0;

		// execute multi-query
		DB::update('prime_pages')
		->set(['position' => DB::expr('CASE `position` WHEN '.$page->position.' THEN '.$new.' ELSE `position` + SIGN('.($page->position - $new).') END')])
		->where('position', 'BETWEEN', DB::expr('LEAST('.$new.','.$page->position.') AND GREATEST('.$new.','.$page->position.')'))
		->where('parent_id', $page->parent_id ? '=' : 'IS', $page->parent_id)
		->execute();
	}

	/**
	 * @return void
	 */
	public function action_DeletePage()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));

		if ( ! $page->loaded())
			return $this->response->status(404);

		$page->delete();
	}

	/**
	 * @return void
	 */
	public function action_CreatePage()
	{
		$parent = ORM::factory('Prime_Page', $this->request->param('id'));

		$page = ORM::factory('Prime_Page');
		$page->parent_id = $parent->id;
		$page->name = $this->request->post('name');
		$page->slug = 'new-page';
		$page->template = 'template';
		$page->position = 100;
		$page->save();

		$tree = View::factory('Prime/Page/Tree')
		->set('nodes', ORM::factory('Prime_Page'));

		$this->response->body($tree);
	}

	/**
	 * @return void
	 */
	public function action_RenamePage()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));
		$page->name = $this->request->post('name');
		$page->save();

		$this->response->body(json_encode(['name' => $page->name, 'slug' => $page->slug]));
	}

	/**
	 * @return void
	 */
	public function action_DeleteRegion()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ( ! $region->loaded())
		{
			return $this->response->status(404);
		}

		$region->delete();
	}

	/**
	 * @return void
	 */
	public function action_RegionSettings()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ( ! $region->loaded())
			return;

		// get region module
		$module = $region->module();

		// get module fields
		$fields = $module->params();

		$view = View::factory('Prime/Region/Settings')
		->set('fields', $fields)
		->set('region', $region);

		// output view
		$this->response->body($view);
	}

	/**
	 * @return void
	 */
	public function action_RegionItemActions()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ( ! $region->loaded())
		{
			return $this->response->status(404);
		}

		$this->response->body(json_encode($region->module()->live()));
	}




	/**
	 * Main Pages Display
	 *
	 * @return void
	 */
	public function action_index()
	{
		// disable auto render
		$this->auto_render = TRUE;

		// setup template views
		$this->template->left = Request::factory('Prime/Page/Tree')->execute();

		$this->template->right = View::factory('Prime/Page/Modules')
		->bind('modules', $modules);

		// get all nodes
		$nodes = ORM::factory('Prime_Page');

		// get all modules
		$modules = ORM::factory('Prime_Module')
		->find_all();

		// setup main view
		$this->view = '<iframe'.HTML::attributes([
			'src' => '/?mode=design',
			'frameborder' => 0,
			'class' => 'scrollable prime-live-iframe',
			'style' => 'width: 100%; height: 100%;',
			'name' => 'PrimeLive'
		]).'></iframe>';
	}

	/**
	 * Render page tree
	 * 
	 * @return void
	 */
	public function action_tree()
	{
		$view = View::factory('Prime/Page/Tree')
		->set('nodes', ORM::factory('Prime_Page'))
		->set('open', json_decode(Arr::get($_COOKIE, 'tree-page', '{}'), TRUE));

		$this->response->body($view);
	}

	public function action_create()
	{
		// get parent page
		$parent = ORM::factory('Prime_Page', $this->request->param('id'));

		// setup view
		$view = View::factory('Prime/Page/Create')
		->set('page', $parent)
		->set('templates', Prime::treeselect(Kohana::list_files('views/template'), 'views/template/'));

		if ($this->request->method() === HTTP_Request::POST)
		{
			// create new page
			$page = ORM::factory('Prime_Page');
			$page->parent_id = $this->request->post('parent_id');
			$page->name = $this->request->post('name');
			$page->slug = $this->request->post('slug');
			$page->template = $this->request->post('template');
			$page->position = 100;
			$page->save();

			// get new tree
			$view = Request::factory('Prime/Page/Tree')->execute();
		}

		// show tree
		$this->response->body($view);
	}

	public function action_properties()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));

		$view = View::factory('Prime/Page/Properties')
		->set('page', $page)
		->set('templates', Prime::treeselect(Kohana::list_files('views/template'), 'views/template/'));

		if ($this->request->method() === HTTP_Request::POST)
		{
			// update page properties
			$page->name = $this->request->post('name');
			$page->slug = $this->request->post('slug');
			$page->template = $this->request->post('template');
			$page->save();

			// get new tree
			$view = Request::factory('Prime/Page/Tree')->execute();
		}

		$this->response->body($view);
	}

	public function action_remove()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));
		$page->deleted = 1;
		$page->save();
	}

	public function action_rename()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));
		$page->name = $this->request->post('name');
		$page->save();
	}

} // End Prime Page