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

	/**
	 * @var Name
	 */
	public $name;

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
		// check if no name is set
		if ($this->name === NULL)
		{
			// generate from class name
			$this->name = str_replace(array('Prime_Field_', '_'), array(NULL, ' '), get_called_class());
		}

		// set field as global variable
		$this->field = $field;

		// singleton much
		return $this;
	}

	/**
	 * Options
	 */
	public function options()
	{
		return array();
	}

	/**
	 * Get value for render or show
	 */
	public function value()
	{
		if (isset($this->field['settings'][$this->field['key']]))
		{
			return $this->field['settings'][$this->field['key']];
		}
		else if (isset($this->field['value']))
		{
			return $this->field['value'];
		}
		else if (isset($this->field['default']))
		{
			return $this->field['default'];
		}

		return '';
	}

	/**
	 * Value for saving
	 */
	public function save($val)
	{
		return $val;
	}

	/**
	 * Value for showing
	 */
	public function show()
	{
		return $this->field['value'];
	}

	/**
	 * Core render method
	 *
	 * @return String
	 */
	public function render()
	{
		return '';
	}

} // End Field