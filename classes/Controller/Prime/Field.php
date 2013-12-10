<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Field extends Controller_Prime_Template {

	/**
	 * List all available fields
	 *
	 * @return array
	 */
	private static function fields()
	{
		// Fields array
		$fields = array(
			'select' => array(),
			'items' => array()
		);

		// List field files
		$files = Kohana::list_files('classes/Prime/Field');

		foreach ($files as $file => $path)
		{
			// Cut classes prefix
			$file = substr($file, strlen('classes/'));

			// Remove php file extension
			$file = substr($file, 0, strlen($file) - 4);

			// Replace slashes with underscore
			$file = str_replace('/', '_', $file);

			if (class_exists($file))
			{
				// Call field class
				$field = call_user_func(array($file, 'factory'));

				// Push to fields array
				$fields['select'][$file] = $field->name;
				$fields['items'][$file]  = $field;
			}
		}

		return $fields;
	}

	/**
	 * Field properties list
	 *
	 * @return void
	 */
	public function action_properties()
	{
		// Extract type and id from request params
		list($type, $id) = explode(':', $this->request->param('id'));

		// Get fields by resource type and id
		$fields = ORM::factory('Prime_Field')
		->where('resource_id', '=', $id)
		->where('resource_type', '=', $type)
		->order_by('position', 'ASC')
		->find_all();

		// Setup view
		$this->view = View::factory('Prime/Field/Editor/List')
		->set('fields', $fields)
		->set('type', $type)
		->set('id', $id);
	}

	/**
	 * Create new field
	 *
	 * @return void
	 */
	public function action_create()
	{
		// Extract type and id from request params
		list ($type, $id) = explode(':', $this->request->param('id'));

		// Create default field
		$field = ORM::factory('Prime_Field');
		$field->resource_id = $id;
		$field->resource_type = $type;

		// Fieldset processor
		$this->fieldset($field);
	}

	/**
	 * Edit field by id
	 *
	 * @return void
	 */
	public function action_edit()
	{
		// Find field by param
		$field = ORM::factory('Prime_Field', $this->request->param('id'));

		if ( ! $field->loaded())
		{
			// Could not find field
			throw HTTP_Exception::factory(404, 'Field not found.');
		}

		// Fieldset processor
		$this->fieldset($field);
	}

	/**
	 * Setup fieldset view and bind needed parameters to it.
	 * Attempt to save ORM model on POST method.
	 *
	 * @param  ORM   $item   Field model to save
	 * @return void
	 */
	public function fieldset($field)
	{
		// Set resource type and id
		$resource_type_id = implode(':', array($field->resource_type, $field->resource_id));

		// Get fields
		$fields = self::fields();

		// Sort fields messy function
		uasort($fields['select'], function ($a, $b) {
			$fieldSort = array('String' => 1,'Text' => 2,'Choose' => 3,'Boolean' => 4);
			if (isset($fieldSort[$a])) {
				if (isset($fieldSort[$b])) {
					return strcmp($fieldSort[$a], $fieldSort[$b]);
				} else {
					return -1;
				}
			} else if (isset($fieldSort[$b])) {
				return 1;
			} else {
				return strcmp($a, $b);
			}
		});

		// Setup view
		$this->view = View::factory('Prime/Field/Editor/Fieldset')
		->set('item', $field)
		->set('id', $field->resource_id)
		->set('type', $field->resource_type)
		->set('fields', $fields)
		->set('action', '/Prime/Field/' . ($field->loaded() ? 'Edit/'.$field->id : 'Create/'.$resource_type_id));

		if ($this->request->method() === HTTP_Request::POST)
		{
			$post = $this->request->post();
			$options = [];

			foreach ($post as $key => $value)
			{
				if (substr($key, 0, strlen('option-')) === 'option-')
				{
					$options[substr($key, strlen('option-'))] = $value;
				}
			}

			$post['options'] = json_encode($options);
			$post['options'] = $post['options'] === '[]' ? '' : $post['options'];

			// Add post values to orm
			$field->values($post);

			try
			{
				// Save fields
				$field->save();

				// Set JSON Response
				$json = array(
					'status'  => TRUE,
					'data'    => $this->view = Request::factory('/Prime/Field/Properties/'.$resource_type_id)->execute()->body(),
					'message' => __('Field was saved.')
				);
			}
			catch (ORM_Validation_Exception $e)
			{
				// Flatten validation array
				$errors = Arr::flatten($e->errors('models'));

				// Setup JSON Response
				$json = array(
					'status'  => FALSE,
					'data'    => $errors,
					'message' => __('Field was not saved.')
				);
			}

			// Set View
			$this->view = json_encode($json);
		}
	}

	/**
	 * Delete field model(s)
	 *
	 * @return void
	 */
	public function action_delete()
	{
		// Get field ids from params
		$fields = explode(':', $this->request->param('id'));

		foreach ($fields as $field)
		{
			// Find field
			$item = ORM::factory('Prime_Field', $field);

			if ($item->loaded() AND $this->view === NULL)
			{
				// Setup view
				$this->view = Request::factory('/Prime/Field/Properties/'.implode(':', [$item->resource_type, $item->resource_id]));
			}

			// Delete model
			$item->delete();
		}

		// Execute view Request
		$this->view = $this->view->execute()->body();
	}

	/**
	 * Publish field model(s)
	 *
	 * @return void
	 */
	public function action_publish()
	{
		// Get field ids from params
		$fields = explode(':', $this->request->param('id'));

		foreach ($fields as $field)
		{
			// Find field
			$item = ORM::factory('Prime_Field', $field);

			if ($item->loaded() AND $this->view === NULL)
			{
				// Setup view
				$this->view = Request::factory('/Prime/Field/Properties/'.implode(':', [$item->resource_type, $item->resource_id]));
			}

			// Publish model
			$item->publish();
		}

		// Execute view Request
		$this->view = $this->view->execute()->body();
	}

	/**
	 * Re-order field by resource type and id
	 *
	 * @return void
	 */
	public function action_reorder()
	{
		// Get field and its reference
		list($field, $reference) = explode(':', $this->request->param('id'));

		// Move field
		$field = ORM::factory('Prime_Field', $field)
		->position($reference)
		->position($reference, FALSE);
	}

	/**
	 * After action execution
	 *
	 * @return void
	 */
	public function after()
	{
		// Disable auto render
		$this->auto_render = FALSE;

		if (isset($this->view) AND $this->view !== NULL)
		{
			// Set Response body
			$this->response->body($this->view);
		}

		// Call parent
		parent::after();
	}

}