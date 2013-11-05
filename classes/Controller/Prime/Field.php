<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Field extends Controller_Prime_Template {

	/**
	 * @var boolean Auto render
	 */
	public $auto_render = FALSE;

	/**
	 * List all fields by files available
	 *
	 * @return array
	 **/
	private static function fields()
	{
		// fields array
		$fields = array();

		// list files
		$files = Kohana::list_files('classes/Prime/Field');

		// loop through files
		foreach ($files as $file => $path)
		{
			// work with filename
			$file = substr($file, strlen('classes/'));
			$file = substr($file, 0, strlen($file) - 4);
			$file = str_replace('/', '_', $file);

			// make sure the class exists inside file
			if (class_exists($file))
			{
				// call class
				$field = call_user_func(array($file, 'factory'));

				// push to array
				$fields[$file] = $field->name;
			}
		}

		// fields array
		return $fields;
	}

	/**
	 * Field properties list
	 *
	 * @return void
	 */
	public function action_properties()
	{
		// extract type and id from request params
		list($type, $id) = explode(':', $this->request->param('id'));

		// get fields by resource type and id 
		$fields = ORM::factory('Prime_Field')
		->where('resource_id', '=', $id)
		->where('resource_type', '=', $type)
		->order_by('position', 'ASC')
		->find_all();

		// setup view
		$view = View::factory('Prime/Field/Editor/List')
		->set('fields', $fields)
		->set('type', $type)
		->set('id', $id);

		// render view
		$this->response->body($view);
	}

	/**
	 * Create new field
	 *
	 * @return void
	 */
	public function action_create()
	{
		// extract type and id from request params
		list ($type, $id) = explode(':', $this->request->param('id'));

		// create default field
		$field = ORM::factory('Prime_Field');

		// setup view
		$view = View::factory('Prime/Field/Editor/Fieldset')
		->set('item', $field)
		->set('action', '/Prime/Field/Create/'.implode(':', [$type, $id]))
		->set('id', $id)
		->set('type', $type)
		->set('fields', self::fields());

		// process post values
		if ($this->request->method() === HTTP_Request::POST)
		{
			// add post values to orm
			$field->values($this->request->post());
			$field->resource_id = $id;
			$field->resource_type = $type;

			// save fields
			$field->save();

			// get new properties view
			$view = Request::factory('/Prime/Field/Properties/'.implode(':', [$type, $id]))->execute();
		}

		// render view
		$this->response->body($view);
	}

	/**
	 * Edit field by id
	 *
	 * @return void
	 */
	public function action_edit()
	{
		// find field
		$field = ORM::factory('Prime_Field', $this->request->param('id'));

		// make sure the field was found
		if ( ! $field->loaded())
			throw HTTP_Exception::factory(404, 'Not found');

		// setup view
		$view = View::factory('Prime/Field/Editor/Fieldset')
		->set('item', $field)
		->set('action', '/Prime/Field/Edit/'.$field->id)
		->set('id', $field->resource_id)
		->set('type', $field->resource_type)
		->set('fields', self::fields());

		// process post values
		if ($this->request->method() === HTTP_Request::POST)
		{
			// add post values to orm and save
			$field->values($this->request->post());
			$field->save();

			// get new properties view
			$view = Request::factory('/Prime/Field/Properties/'.implode(':', [$field->resource_type, $field->resource_id]))->execute();
		}

		// render view
		$this->response->body($view);
	}

	public function action_delete()
	{
		$fields = explode(':', $this->request->param('id'));
		$view = NULL;

		foreach ($fields as $field)
		{
			$item = ORM::factory('Prime_Field', $field);

			if ($item->loaded() AND $view === NULL)
			{
				$view = Request::factory('/Prime/Field/Properties/'.implode(':', [$item->resource_type, $item->resource_id]));
			}

			$item->delete();
		}

		$this->response->body($view->execute());
	}

	/**
	 * Re-order field by resource type and id
	 *
	 * @return void
	 */
	public function action_reorder()
	{
		// get page and reference page
		list($field, $reference) = explode(':', $this->request->param('id'));

		// node to move
		$field = ORM::factory('Prime_Field', $field)
		->position($reference)
		->save();
	}

} // End Prime Field