<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Fieldset
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Module_Fieldset extends Controller_Prime_Template {

	/**
	 * Render fieldset tree
	 * 
	 * @return void
	 */
	public function action_tree()
	{
		$this->auto_render = FALSE;

		// setup view
		$view = View::factory('Prime/Module/Fieldset/Tree')
		->bind('nodes', $nodes)
		->bind('open', $open)
		->set('request', $this->request);

		$open = $this->request->is_initial() ? [] : json_decode(Arr::get($_COOKIE, 'tree-fieldsets', '{}'), TRUE);

		// get nodes
		$nodes = ORM::factory('Prime_Module_Fieldset');

		$this->response->body($view);
	}

	public function action_new()
	{
		$this->auto_render = FALSE;

		$fieldset = ORM::factory('Prime_Module_Fieldset');
		$fieldset->parent_id = $this->request->param('id');
		$fieldset->name = $this->request->post('name');
		$fieldset->type = $this->request->post('type');
		$fieldset->save();

		$view = Request::factory('Prime/Module/Fieldset/Tree')->execute();

		$this->response->body($view);
	}

	/**
	 * Default page
	 *
	 * @return void
	 */
	public function action_index()
	{
		// show tree
		$this->template->left = Request::factory('Prime/Module/Fieldset/Tree')
		->execute();
	}

	/**
	 * Show list of fieldset rows
	 *
	 * @return void
	 */
	public function action_list()
	{
		// show tree
		$this->template->left = Request::factory('Prime/Module/Fieldset/Tree')
		->execute();

		// load fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// throw error if fieldset was not found
		if ( ! $fieldset->loaded())
			throw HTTP_Exception::factory(404, 'Not found');

		// setup view
		$this->view = View::factory('Prime/Module/Fieldset/List')
		->set('fieldset', $fieldset)
		->set('fields', $fieldset->fields());

		// just view for ajax requests
		if ($this->request->is_ajax() OR ! $this->request->is_external())
		{
			// disable auto render
			$this->auto_render = FALSE;

			// output center view
			$this->response->body($this->view);
		}
	}

	/**
	 * Create new fieldset
	 *
	 * @return void
	 */
	public function action_create()
	{
		$this->auto_render = FALSE;

		// create fieldset record
		$item = ORM::factory('Prime_Module_Fieldset_Item');

		// find parent fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// setup view
		$view = View::factory('Prime/Module/Fieldset/Item/Fieldset')
		->set('action', 'Prime/Module/Fieldset/Create/'.$fieldset->id)
		->set('fieldset', $fieldset)
		->set('item', $item);

		// process post values
		if ($this->request->method() === HTTP_Request::POST)
		{
			// get post data
			$post = $this->request->post();
			$data = [];

			// loop through fieldset fields
			foreach ($fieldset->fields() as $field)
			{
				$data[$field->name] = $field->field->prepare_value(Arr::get($post, $field->name, NULL));
			}

			// set item data
			$item->prime_module_fieldset_id = $fieldset->id;
			$item->data = json_encode($data);
			$item->save();
		}

		// render view
		$this->response->body($view);
	}

	/**
	 * Edit fieldset item
	 *
	 * @return void
	 */
	public function action_edit()
	{
		$this->auto_render = FALSE;

		// create fieldset record
		$item = ORM::factory('Prime_Module_Fieldset_Item', $this->request->param('id'));

		// find parent fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $item->prime_module_fieldset_id);

		// setup view
		$view = View::factory('Prime/Module/Fieldset/Item/Fieldset')
		->set('action', 'Prime/Module/Fieldset/Edit/'.$item->id)
		->set('fieldset', $fieldset)
		->set('item', $item);

		// process post values
		if ($this->request->method() === HTTP_Request::POST)
		{
			// get post data
			$post = $this->request->post();
			$data = [];

			// loop through fieldset fields
			foreach ($fieldset->fields() as $field)
			{
				$data[$field->name] = $field->field->prepare_value(Arr::get($post, $field->name, NULL));
			}

			$item->data = json_encode($data);
			$item->save();
		}

		// render view
		$this->response->body($view);
	}

	public function action_delete()
	{
		$this->auto_render = FALSE;

		$fields = explode(':', $this->request->param('id'));
		$view = NULL;

		foreach ($fields as $field)
		{
			$item = ORM::factory('Prime_Module_Fieldset_Item', $field);

			if ($item->loaded() AND $view === NULL)
			{
				$view = Request::factory('/Prime/Module/Fieldset/List/'.$item->prime_module_fieldset_id);
			}

			$item->delete();
		}

		$this->response->body($view->execute());
	}

	public function action_remove()
	{
		$this->auto_render = FALSE;

		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));
		$fieldset->delete();

		$view = Request::factory('Prime/Module/Fieldset/Tree')->execute();

		$this->response->body($view);
	}

	public function action_rename()
	{
		$this->auto_render = FALSE;

		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));
		$fieldset->name = $this->request->post('name');
		$fieldset->save();
	}

	public function action_reorder()
	{
		$this->auto_render = FALSE;

		// get page and reference page
		list($item, $reference) = explode(':', $this->request->param('id'));

		// node to move
		$item = ORM::factory('Prime_Module_Fieldset_Item', $item)
		->position($reference)
		->save();
	}

} // End Prime Module Fieldset