<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Template Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Template extends Prime_Field {

	/**
	 * Field name definition
	 * @var string
	 */
	public $name = 'Template';

	/**
	 * Fieldset render method
	 *
	 * @return View
	 */
	public function render()
	{
		// setup view
		$view = View::factory('Prime/Field/Template')
		->set('name', $this->field['key'])
		->set('caption', $this->field['name']);

		return $view;
	}

} // End Field Template Class