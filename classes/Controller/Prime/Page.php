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
	 * Default page
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
			'src' => '',
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
		->bind('open', $open)
		->set('request', $this->request);

		$open = $this->request->is_initial() ? [] : json_decode(Arr::get($_COOKIE, 'tree-page', '{}'), TRUE);

		$this->response->body($view);
	}

	/**
	 * Create new page
	 *
	 * @return void
	 */
	public function action_create()
	{
		// get parent page
		$parent = ORM::factory('Prime_Page', $this->request->param('id'));

		// setup default values
		$default = ORM::factory('Prime_Page');
		$default->slug_auto = 1;
		$default->noindex = 0;
		$default->nofollow = 0;
		$default->redirect = 0;
		$default->protocol = 'both';
		$default->method = 'all';
		$default->ajax = 1;
		$default->gzip = 1;
		$default->visible = 1;
		$default->disabled = 0;

		// setup view
		$view = View::factory('Prime/Page/Properties')
		->set('page', $default)
		->set('action', '/Prime/Page/Create/' . $this->request->param('id'))
		->set('templates', Prime::treeselect(Kohana::list_files('views/template'), 'views/template/'));

		if ($this->request->method() === HTTP_Request::POST)
		{
			// create new page
			$page = ORM::factory('Prime_Page');
			$page->values($this->request->post());
			$page->parent_id = $parent->id;
			$page->save();

			// get new tree
			$view = Request::factory('Prime/Page/Tree')->execute();
		}

		// show tree
		$this->response->body($view);
	}

	/**
	 * Setup page properties dialog and process
	 *
	 * @return void
	 */
	public function action_properties()
	{
		// get requested page model
		$page = ORM::factory('Prime_Page', $this->request->param('id'));

		// setup view
		$view = View::factory('Prime/Page/Properties')
		->set('page', $page)
		->set('action', '/Prime/Page/Properties/' . $page->id)
		->set('templates', Prime::treeselect(Kohana::list_files('views/template'), 'views/template/'));

		// process post values
		if ($this->request->method() === HTTP_Request::POST)
		{
			// update page properties
			$page->values($this->request->post());
			$page->save();

			// get new tree
			$view = Request::factory('Prime/Page/Tree')->execute();
		}

		$this->response->body($view);
	}

	/**
	 * Remove page
	 *
	 * @return void
	 */
	public function action_remove()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));
		$page->deleted = 1;
		$page->save();
	}

	/**
	 * Rename page
	 *
	 * @return void
	 */
	public function action_rename()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));
		$page->name = $this->request->post('name');
		$page->save();
	}

	/**
	 * Move page above reference page
	 *
	 * @return void
	 */
	public function action_reorder()
	{
		// get page and reference page
		list($page, $ref) = explode(':', $this->request->param('id'));

		// node to move
		$page = ORM::factory('Prime_Page', $page);

		// node to reference as above
		$ref = ORM::factory('Prime_Page', $ref);

		// generate new position
		$new = $ref->loaded() ? $ref->position + ($page->position > $ref->position ? 1 : 0) : 0;

		// execute multi-query
		DB::update('prime_pages')
		->set(['position' => DB::expr('CASE `position` WHEN '.$page->position.' THEN '.$new.' ELSE `position` + SIGN('.($page->position - $new).') END')])
		->where('position', 'BETWEEN', DB::expr('LEAST('.$new.','.$page->position.') AND GREATEST('.$new.','.$page->position.')'))
		->where('parent_id', $page->parent_id ? '=' : 'IS', $page->parent_id)
		->where('deleted', '=', 0)
		->execute();
	}

} // End Prime Page