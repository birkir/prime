<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Fieldset
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Module_Fieldset extends Controller_Prime_Core {

	private function fields()
	{
		$fields = array();

		$files = Kohana::list_files('classes/Prime/Field');
		
		foreach ($files as $file => $path)
		{
			$file = substr($file, strlen('classes/'));
			$file = substr($file, 0, strlen($file) - 4);
			$file = str_replace('/', '_', $file);

			if (class_exists($file))
			{
				$field = call_user_func(array($file, 'factory'));
				$fields[$file] = $field->name;
			}
		}

		return $fields;
	}

	public function before()
	{
		parent::before();

		$this->auto_render = FALSE;
	}

	public function action_index()
	{
		$this->action_detail();
	}

	public function action_detail()
	{
		// enable auto render
		$this->auto_render = TRUE;

		// set left view
		$this->template->left = View::factory('Prime/Module/Fieldset/Tree')
		->set('item', $this->request->param('id'));
	}

	public function action_tree()
	{
		// fieldsets
		$items = ORM::factory('Prime_Module_Fieldset')->tree($this->request->param('id'));

		// setup response
		$response = array(
			'status' => 'success',
			'items' => array()
		);

		foreach ($items as $item)
		{
			$_item= array(
				'data' => array('title' => $item->name, 'attr' => array('href' => '#'), 'icon' => ($item->type === 'category' ? 'icon-folder-close' : 'icon-list-alt')),
				'attr' => array('data-id' => $item->id, 'data-type' => $item->type === 'category' ? 'folder' : 'file', 'id' => 'page_id_'.$item->id, 'rel' => $item->type)
			);

			$childs = ORM::factory('Prime_Module_Fieldset')->tree($item->id);

			if (count($childs) > 0)
			{
				$_item['state'] = 'closed';
				$_item['children'] = array();
			}

			$response['items'][] = $_item;
		}

		$this->response->body(json_encode($response));
	}

	public function action_create()
	{
		$item = ORM::factory('Prime_Module_Fieldset');
		$item->name = Arr::get($_POST, 'name');
		$item->type = Arr::get($_POST, 'type') === 'file' ? 'fieldset' : 'category';
		$item->parent_id = Arr::get($_POST, 'parent');
		$item->created = date('Y-m-d H:i:s');
		$item->save();

		$this->response->body(json_encode(array('status' => 'success', 'message' => $item->id)));
	}

	public function action_rename()
	{
		$item = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));
		$item->name = Arr::get($_POST, 'name');
		$item->save();

		$this->response->body(json_encode(array('status' => 'success')));
	}

	public function action_remove()
	{
		$item = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));
		$item->deleted = 1;
		$item->save();

		$this->response->body(json_encode(array('status' => 'success')));
	}







	public function action_item_list()
	{
		// setup view
		$view = View::factory('Prime/Module/Fieldset/Item/List')
		->bind('fieldset', $fieldset)
		->bind('items', $items);

		// find fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// find items
		$items = $fieldset->items->find_all();

		// render view
		$this->response->body($view->render());
	}

	public function action_item_create()
	{
		// setup view
		$view = View::factory('Prime/Module/Fieldset/Item/Fieldset')
		->bind('fieldset', $fieldset)
		->bind('item', $item);

		// find fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// find item
		$item = ORM::factory('Prime_Module_Fieldset_Item');

		// render view
		$this->response->body($view->render());
	}

	public function action_item_edit()
	{
		// setup view
		$view = View::factory('Prime/Module/Fieldset/Item/Fieldset')
		->bind('fieldset', $fieldset)
		->bind('item', $item);

		// find item
		$item = ORM::factory('Prime_Module_Fieldset_Item', $this->request->param('id'));

		// find fieldset
		$fieldset = $item->fieldset;

		// render view
		$this->response->body($view->render());
	}

	/**
	 * Item REST service
	 * 
	 * @return void
	 */
	 public function action_item()
	 {
		// set response status
		$response = array(
			'status' => 'error'
		);

		$data = json_decode($this->request->body(), TRUE);

		// switch methods
		switch ($this->request->method())
		{
			case HTTP_Request::POST:

				$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));
		
				$res = array();

				foreach ($fieldset->fields->order_by('index', 'ASC')->find_all() as $field)
				{
					if (isset($data['field'.$field->id]))
					{
						$res[$field->name] = $data['field'.$field->id];
					}
				}

				$item = array(
					'prime_module_fieldset_id' => $fieldset->id,
					'created' => date('Y-m-d H:i:s '),
					'updated' => date('Y-m-d H:i:s '),
					'data' => json_encode($res)
				);

				ORM::factory('Prime_Module_Fieldset_Item')
				->values($item)
				->save();

				$response['status'] = 'success';

				break;

			case HTTP_Request::DELETE:
				$item = ORM::factory('Prime_Module_Fieldset_Item', $data['id']);
				$item->deleted = 1;
				$item->save();
				$response['status'] = 'success';
				$response['fieldset_id'] = $item->prime_module_fieldset_id;
				break;

			case HTTP_Request::PUT:

				$item = ORM::factory('Prime_Module_Fieldset_Item', $this->request->param('id'));

				foreach ($item->fieldset->fields->order_by('index', 'ASC')->find_all() as $field)
				{
					if (isset($data['field'.$field->id]))
					{
						$res[$field->name] = $data['field'.$field->id];
					}
				}

				$item->values(array(
					'updated' => date('Y-m-d H:i:s '),
					'data' => json_encode($res)
				))->save();

				$response['status'] = 'success';

				break;
		}

		// return response
		return $this->response->body(json_encode($response));
	 }














	/**
	 * List fields in fieldset
	 *
	 * @return void
	 */
	public function action_field_list()
	{
		// setup view
		$view = View::factory('Prime/Module/Fieldset/Field/List')
		->bind('fieldset', $fieldset)
		->set('fields', $this->fields());

		// find fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// render view
		$this->response->body($view->render());
	}

	/**
	 * Create fieldset field
	 *
	 * @return void
	 */
	public function action_field_create()
	{
		// setup view
		$view = View::factory('Prime/Module/Fieldset/Field/Fieldset')
		->bind('item', $item)
		->bind('fieldset', $fieldset)
		->set('fields', $this->fields());

		// set item orm
		$item = ORM::factory('Prime_Module_Fieldset_Field');

		// find fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->request->param('id'));

		// render view
		$this->response->body($view->render());
	}

	/**
	 * Edit fieldset field
	 *
	 * @return void
	 */
	public function action_field_edit()
	{
		// setup view
		$view = View::factory('Prime/Module/Fieldset/Field/Fieldset')
		->bind('item', $item)
		->bind('fieldset', $fieldset)
		->set('fields', $this->fields());

		// find item
		$item = ORM::factory('Prime_Module_Fieldset_Field', $this->request->param('id'));

		// find fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $item->prime_module_fieldset_id);

		// render view
		$this->response->body($view->render());
	}

	/**
	 * Field REST service
	 * 
	 * @return void
	 */
	 public function action_field()
	 {
		// set response status
		$response = array(
			'status' => 'error'
		);

		$data = json_decode($this->request->body(), TRUE);

		// switch methods
		switch ($this->request->method())
		{
			case HTTP_Request::POST:
				ORM::factory('Prime_Module_Fieldset_Field')
				->values($data)
				->save();
				$response['status'] = 'success';
				break;

			case HTTP_Request::DELETE:
				ORM::factory('Prime_Module_Fieldset_Field', $data['id'])
				->delete();
				$response['status'] = 'success';
				break;

			case HTTP_Request::PUT:
				$data['visible'] = isset($data['visible']) ? 1 : 0;
				$data['required'] = isset($data['required']) ? 1 : 0;
				ORM::factory('Prime_Module_Fieldset_Field', $this->request->param('id'))
				->values($data)
				->save();
				$response['status'] = 'success';
				break;
		}

		// return response
		return $this->response->body(json_encode($response));
	 }

} // End Fieldset Module