<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Boolean Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Boolean extends Prime_Field {

	/**
	 * Field name definition
	 * @var string
	 */
	public $name = 'Boolean';

	/**
	 * Fieldset render method
	 * 
	 * @return View
	 */
	public function render()
	{
		// setup view
		$view = View::factory('Prime/Field/Boolean')
		->set('name', $this->field['key'])
		->set('caption', $this->field['name'])
		->set('value', $this->value());

		return $view;
	}

	/**
	 * Value for saving
	 */
	public function save($val)
	{
		// convert to boolean
		return (bool) $val;
	}

} // End Field Boolean Class