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
	 * @var Disable auto render
	 */
	public $auto_render = FALSE;

	public function action_index()
	{
		$this->auto_render = TRUE;

		// setup tree view
		$this->template->left = View::factory('Prime/Page/Tree')
		->bind('nodes', $nodes);

		// get all nodes
		$nodes = ORM::factory('Prime_Page');

		// setup right view
		$this->template->right = View::factory('Prime/Page/Modules')
		->bind('modules', $modules);

		// get all modules
		$modules = ORM::factory('Prime_Module')
		->find_all();

		$this->view = '<iframe'.HTML::attributes([
			'src' => '/?mode=design',
			'frameborder' => 0,
			'class' => 'scrollable prime-live-iframe',
			'style' => 'width: 100%; height: 100%;',
			'name' => 'PrimeLive'
		]).'></iframe>';
	}

	public function GetRegion(ORM $region)
	{
		if ($region->loaded())
		{
			$page = ORM::factory('Prime_Page', $region->prime_page_id);

			View::set_global('page', $page);
			View::set_global('prime', Prime_Frontend::instance());

			$view = View::factory('Prime/Page/Region/Item')
			->set('item', $region->module());

			return $view;
		}
	}

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

	public function action_DeletePage()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));

		if ( ! $page->loaded())
			return $this->response->status(404);

		$page->delete();
	}

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

	public function action_RenamePage()
	{
		$page = ORM::factory('Prime_Page', $this->request->param('id'));
		$page->name = $this->request->post('name');
		$page->save();

		$this->response->body(json_encode(['name' => $page->name, 'slug' => $page->slug]));
	}

	public function action_DeleteRegion()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ( ! $region->loaded())
		{
			return $this->response->status(404);
		}

		$region->delete();
	}

	public function action_RegionSettings()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ( ! $region->loaded())
			return;

		// get region module
		$module = $region->module();

		// get module fields
		$fields = $module->params();

		$view = View::factory('Prime/Page/Region/Settings')
		->set('fields', $fields)
		->set('region', $region);

		// output view
		$this->response->body($view);
	}

	public function action_RegionItemActions()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ( ! $region->loaded())
		{
			return $this->response->status(404);
		}

		$this->response->body(json_encode($region->module()->live()));
	}

	public function action_EditContent()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ($region->loaded())
		{
			$module = $region->module();

			if ($module->settings['content'] !== $this->request->post('content'))
			{
				$module->settings['content'] = $this->request->post('content');

				$module->save();
			}
		}
	}

	public function action_GetContent()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ($region->loaded()) {
			$this->response->body($region->module()->settings['content']);
		}
	}

} // End Prime Page