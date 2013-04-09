<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field String Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_String extends Prime_Field {

	/**
	 * Field name definition
	 * @var string
	 */
	public $name = 'String';

	/**
	 * Fieldset render method
	 *
	 * @return View
	 */
	public function render()
	{
		// setup view
		$view = View::factory('Prime/Field/String')
		->set('name', $this->field['key'])
		->set('caption', $this->field['name'])
		->set('placeholder', Arr::get($this->field, 'placeholder', NULL))
		->set('value', $this->value());

		return $view;
	}

} // End Priem Field String Class