<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Choose Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Choose extends Prime_Field {

	/**
	 * Field name definition
	 * @var string
	 */
	public $name = 'Choose';

	/**
	 * Fieldset render method
	 * 
	 * @return View
	 */
	public function render()
	{
		// setup view
		$view = View::factory('Prime/Field/Choose')
		->set('name', $this->field['key'])
		->set('caption', $this->field['name'])
		->set('options', $this->field['properties']['options'])
		->set('value', $this->value());

		return $view;
	}

} // End Field Choose Class