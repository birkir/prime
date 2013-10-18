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
	 * Params for field
	 *
	 * @return array
	 */
	public function params()
	{
		return [];
	}

	/**
	 * Get value for field
	 *
	 * @return string
	 */
	public function value($item = NULL)
	{
		if ($item->loaded())
		{
			if (isset($item->data) AND isset($item->data[$this->field['name']]))
			{
				return $item->data[$this->field['name']];
			}
			else if ($item->loaded() AND isset($item->settings) AND isset($item->settings[$this->field['name']]))
			{
				return $item->settings[$this->field['name']];
			}
		}

		return $this->field['default'];
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
	 * Get Field Data as Text
	 *
	 * @return string
	 */
	public function as_text(ORM $item)
	{
		return Arr::get($item->data, $this->field['name'], NULL);
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

} // End Field