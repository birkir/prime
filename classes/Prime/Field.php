<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field {

	/**
	 * @var Field
	 */
	public $field;

	// Parameters
	public function params()
	{
		return [];
	}

	// Get value (orm, php storage or default)
	public function value($item = NULL)
	{
		$value = NULL;

		if ($item->loaded() AND isset($item->data) AND isset($item->data[$this->field['name']]))
			$value = $item->data[$this->field['name']];
		else if ($item->loaded() AND isset($item->settings) AND isset($item->settings[$this->field['name']]))
			$value = $item->settings[$this->field['name']];
		else
			$value = $this->field['default'];

		return $value;
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
	 */
	public function as_text(ORM $item)
	{
		return Arr::get($item->data, $this->field['name'], NULL);
	}

	/**
	 * Prepare Value for Saving
	 */
	public function prepare_value($value = NULL)
	{
		return $value;
	}

} // End Field