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
	 * @var boolean Disable auto render template
	 */ 
	public $auto_render = FALSE;

	/**
	 * Render page tree
	 * 
	 * @return void
	 */
	public function action_tree()
	{
		$view = View::factory('Prime/Module/Fieldset/Tree')
		->set('nodes', ORM::factory('Prime_Module_Fieldset'))
		->set('open', json_decode(Arr::get($_COOKIE, 'tree-fieldsets', '{}'), TRUE));

		$this->response->body($view);
	}

	/**
	 * Default action
	 */
	public function action_index()
	{
		$this->auto_render = TRUE;

		// setup left view
		$this->template->left = Request::factory('Prime/Module/Fieldset/Tree')->execute();

		// center view
		$this->view = NULL;
	}

	public function action_detail()
	{
		// load fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// throw error if fieldset was not found
		if ( ! $fieldset->loaded())
			return $this->response->status(404);

		// setup view
		$view = View::factory('Prime/Module/Fieldset/List')
		->set('fieldset', $fieldset)
		->set('fields', $fieldset->fields());

		if ($this->request->is_ajax())
		{
			$this->response->body($view);
		}
		else
		{
			$this->action_index();
			$this->view = $view;
		}
	}

	public function action_ItemCreate()
	{
		$view = View::factory('Prime/Module/Fieldset/Item/Fieldset')
		->set('fieldset', ORM::factory('Prime_Module_Fieldset', $this->request->param('id')))
		->set('item', ORM::factory('Prime_Module_Fieldset'));

		$this->response->body($view);
	}

	public function action_ItemUpdate()
	{
		$item = ORM::factory('Prime_Module_Fieldset_Item', $this->request->param('id'));

		$view = View::factory('Prime/Module/Fieldset/Item/Fieldset')
		->set('fieldset', ORM::factory('Prime_Module_Fieldset', $item->prime_module_fieldset_id))
		->set('item', $item);

		$this->response->body($view);
	}

	public function action_ItemSave()
	{
		$post = $this->request->post();
		$data = [];

		$fieldset = ORM::factory('Prime_Module_Fieldset', Arr::get($post, '_fieldset_id', 0));

		if ( ! $fieldset->loaded()) return;

		foreach ($fieldset->fields() as $field)
		{
			$data[$field->name] = $field->field->prepare_value(Arr::get($post, $field->name, NULL));
		}

		$item = ORM::factory('Prime_Module_Fieldset_Item', Arr::get($post, '_fieldset_item_id', 0));
		$item->prime_module_fieldset_id = $fieldset->id;
		$item->data = json_encode($data);
		$item->position = 0;
		$item->save();
	}

} // End Prime Module Fieldset