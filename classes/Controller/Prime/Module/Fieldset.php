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
		// setup view
		$this->view = View::factory('Prime/Module/Fieldset/Tree')
		->bind('nodes', $nodes)
		->bind('open', $open)
		->set('request', $this->request);

		$open = $this->request->is_initial() ? [] : json_decode(Arr::get($_COOKIE, 'tree-fieldsets', '{}'), TRUE);

		// get nodes
		$nodes = ORM::factory('Prime_Module_Fieldset');
	}

	public function action_new()
	{
		$fieldset = ORM::factory('Prime_Module_Fieldset');
		$fieldset->parent_id = $this->request->param('id');
		$fieldset->name = $this->request->post('name');
		$fieldset->type = $this->request->post('type');
		$fieldset->save();

		$this->view = Request::factory('Prime/Module/Fieldset/Tree')->execute();
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

		// Get fieldset fields
		$fields = $fieldset->fields();

		// Offer list of pre-defined fieldset structure templates
		$templates = array(
			array('name' => 'News', 'fields' => array(
				array('title',    'Title',     'General', 'Prime_Field_String', NULL, TRUE,  TRUE,  ''),
				array('abstract', 'Abstract',  'General', 'Prime_Field_Text',   NULL, FALSE, TRUE,  ''),
				array('article',  'Article',   'General', 'Prime_Field_Text',   NULL, FALSE, TRUE,  ''),
				array('pictures', 'Pictures',  'General', 'Prime_Field_File',   NULL, FALSE, FALSE, '')
			)),
			array('name' => 'Employee List', 'fields' => array(
				array('first_name', 'First name', 'General', 'Prime_Field_String', NULL, TRUE,  TRUE,  ''),
				array('last_name',  'Last name',  'General', 'Prime_Field_String', NULL, TRUE,  TRUE,  ''),
				array('birth',      'Birth date', 'General', 'Prime_Field_String', NULL, TRUE,  TRUE,  ''),
				array('email'),
				array('phone'),
				array('photo'),
				array('title'),
				array('department')
			)),
			array('name' => 'Contact Form', 'fields' => array(
				array('name'),
				array('email'),
				array('phone'),
				array('message')
			)),
			array('name' => 'FAQ', 'fields' => array(
				array('question'),
				array('answer')
			))
		);

		// setup view
		$this->view = View::factory('Prime/Module/Fieldset/List')
		->set('fieldset', $fieldset)
		->set('fields', $fields)
		->set('templates', $templates);
	}

	public function action_select_list()
	{
		// load fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// throw error if fieldset was not found
		if ( ! $fieldset->loaded())
			throw HTTP_Exception::factory(404, 'Fieldset not found');

		// setup view
		$this->view = View::factory('Prime/Module/Fieldset/SelectList')
		->set('fieldset', $fieldset)
		->set('fields', $fieldset->fields());
	}

	/**
	 * Create new fieldset
	 *
	 * @return void
	 */
	public function action_create()
	{
		// create fieldset record
		$item = ORM::factory('Prime_Module_Fieldset_Item');

		// find parent fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// setup view
		$this->view = View::factory('Prime/Module/Fieldset/Item/Fieldset')
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
				$data[$field->name] = $field->field->save(Arr::get($post, $field->name, NULL));
			}

			// set item data
			$item->prime_module_fieldset_id = $fieldset->id;
			$item->data = json_encode($data);
			$item->save();
		}
	}

	/**
	 * Edit fieldset item
	 *
	 * @return void
	 */
	public function action_edit()
	{
		// create fieldset record
		$item = ORM::factory('Prime_Module_Fieldset_Item', $this->request->param('id'));

		// find parent fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $item->prime_module_fieldset_id);

		// setup view
		$this->view = View::factory('Prime/Module/Fieldset/Item/Fieldset')
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
				$data[$field->name] = $field->field->save(Arr::get($post, $field->name, NULL));
			}

			$item->data = json_encode($data);
			$item->save();

			Cookie::set('prime-publish-on-save', isset($post['_publish']));

			if (isset($post['_publish']))
			{
				$item->publish();
			}
		}
	}

	public function action_delete()
	{
		$this->auto_render = FALSE;

		$fields = explode(':', $this->request->param('id'));

		foreach ($fields as $field)
		{
			$item = ORM::factory('Prime_Module_Fieldset_Item', $field);

			if ($item->loaded() AND $this->view === NULL)
			{
				$this->view = Request::factory('/Prime/Module/Fieldset/List/'.$item->prime_module_fieldset_id);
			}

			$item->delete();
		}

		// Execute Tree Request
		$this->view = $this->view->execute();
	}

	public function action_publish()
	{
		$this->auto_render = FALSE;

		$fields = explode(':', $this->request->param('id'));

		foreach ($fields as $field)
		{
			$item = ORM::factory('Prime_Module_Fieldset_Item', $field);

			if ($item->loaded() AND $this->view === NULL)
			{
				$this->view = Request::factory('/Prime/Module/Fieldset/List/'.$item->prime_module_fieldset_id);
			}

			$item->publish();
		}

		// Execute Tree Request
		$this->view = $this->view->execute();
	}

	public function action_remove()
	{
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));
		$fieldset->delete();

		$this->view = Request::factory('Prime/Module/Fieldset/Tree')->execute();
	}

	public function action_rename()
	{
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));
		$fieldset->name = $this->request->post('name');
		$fieldset->save();
	}

	public function action_reorder()
	{
		// get page and reference page
		list($item, $reference) = explode(':', $this->request->param('id'));

		// node to move
		$item = ORM::factory('Prime_Module_Fieldset_Item', $item)
		->position($reference)
		->position($reference, FALSE);
	}

	/**
	 * Overload after controller execution method
	 *
	 * @return parent
	 */
	public function after()
	{
		// Check for asyncronous request
		if ($this->request->is_ajax() OR ! $this->request->is_initial())
		{
			// Disable auto render
			$this->auto_render = FALSE;

			// Render the view
			return $this->response->body(isset($this->json) ? json_encode($this->json) : $this->view);
		}
		else
		{
			// Always display tree view
			$this->template->left = Request::factory('Prime/Module/Fieldset/Tree')
			->execute();
		}

		// Call parent after
		return parent::after();
	}

}