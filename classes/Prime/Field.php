<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field {

	/**
	 * @var Field
	 */
	public $field;

	/**
	 * Default field options
	 */
	protected $_defaults = [];

	/**
	 * Get value for field
	 *
	 * @return string
	 */
	public function value($item = NULL)
	{
		if (is_array($item))
		{
			if (isset($item[$this->field['name']]))
			{
				// Arrays
				return $item[$this->field['name']];
			}
		}

		if ($item instanceof ORM)
		{
			if ($item->loaded() AND isset($item->data[$this->field['name']]))
			{
				// ORM models
				return $item->data[$this->field['name']];
			}
		}

		return $this->field['default'];
	}

	/**
	 * Validate field for saving
	 *
	 * @param Validation $validation
	 * @return void
	 */
	public function validation(&$validation)
	{
		// Get field
		$field = $this->field;

		if ((bool) Arr::get($field, 'required', FALSE))
		{
			// Add required rule to validation object
			$validation->rule($field['name'], 'not_empty');
		}
	}

	/**
	 * Create and load the field
	 *
	 * @return Prime_Field
	 */
	public static function factory(array $field = array())
	{
		// Get called class name
		$class_name = get_called_class();

		return new $class_name($field);
	}

	/**
	 * Construct the field
	 *
	 * @return self
	 */
	public function __construct($field)
	{
		// Set field as global variable
		$this->field = $field;

		// Set name and type
		$this->type = get_called_class();
		$this->name = str_replace('Prime_Field_', NULL, $this->type);

		return $this;
	}

	/**
	 * Prepare Value for Saving
	 *
	 * @return mixed
	 */
	public function save($value = NULL)
	{
		return $value;
	}

	/**
	 * Get Field Data as Text
	 *
	 * @return string
	 */
	public function text($item)
	{
		return $this->value($item);
	}

	/**
	 * Fieldset render method
	 *
	 * @return View
	 */
	public function input($item, $errors = [])
	{
		// Setup view
		$view = View::factory($this->_input_view);

		// Set called field object
		$view->field = $this->field;

		// Set item field value 
		$view->value = $this->value($item);

		// Set field id
		$view->id = implode('_', Arr::extract($this->field, ['resource_type', 'resource_id', 'name']));

		// Set error if found
		$view->error = Arr::get($errors, Arr::get($this->field, 'name'), FALSE);

		// Set options if found
		$view->options = Arr::get($this->field, 'options', []);

		// Set group classes
		$view->groupClasses = 'form-group'.($view->error ? ' has-error' : NULL);

		if (Arr::get($view->options, 'hidden', FALSE))
			return;

		return $view;
	}

}