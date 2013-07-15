<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field String
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Boolean extends Prime_Field {

	// Parameters
	public function params()
	{
		return [];
	}

	/**
	 * Fieldset render method
	 *
	 * @return View
	 */
	public function as_input($form = 'form_', $item)
	{
		// setup view
		$view = View::factory('Prime/Field/Boolean')
		->set('field', $this->field)
		->set('form', $form)
		->set('value', $this->value($item));

		return $view;
	}

} // End Priem Field String