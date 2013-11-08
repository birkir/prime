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
		// Arrays
		if (is_array($item))
		{
			if (isset($item[$this->field['name']]))
			{
				return $item[$this->field['name']];
			}
		}

		// ORM models
		if ($item instanceof ORM)
		{
			if ($item->loaded() AND isset($item->data[$this->field['name']]))
			{
				return $item->data[$this->field['name']];
			}
		}

		return $this->field['default'];
	}

	public function validation(&$validation)
	{
		$field = $this->field;

		if ((bool) Arr::get($field, 'required', FALSE))
		{
			$validation->rule($field['name'], 'not_empty');
		}
	}

	/**
	 * Factory
	 *
	 * @return Prime_Field
	 */
	public static function factory(array $field = array())
	{
		// get called class name
		$class_name = get_called_class();

		// return new instance of class
		return new $class_name($field);
	}

	/**
	 * Constructor
	 *
	 * @return self
	 */
	public function __construct($field)
	{
		// set field as global variable
		$this->field = $field;

		// set name and type
		$this->type = get_called_class();
		$this->name = str_replace('Prime_Field_', NULL, $this->type);

		// singleton much
		return $this;
	}

	/**
	 * Prepare Value for Saving
	 *
	 * @return mixed
	 */
	public function prepare_value($value = NULL)
	{
		return $value;
	}

	/**
	 * Get Field Data as Text
	 *
	 * @return string
	 */
	public function as_text($item)
	{
		return $this->value($item);
	}

	/**
	 * Fieldset render method
	 *
	 * @return View
	 */
	public function as_input($item, $errors = [])
	{
		// setup view
		$view = View::factory($this->_as_input);

		// set called field object
		$view->field = $this->field;

		// set item field value 
		$view->value = $this->value($item);

		// set field id
		$view->id = implode('_', Arr::extract($this->field, ['resource_type', 'resource_id', 'name']));

		// set error if found
		$view->error = Arr::get($errors, Arr::get($this->field, 'name'), FALSE);

		// set options if found
		$view->options = Arr::get($this->field, 'options', []);

		// return view
		return $view;
	}

} // End Field