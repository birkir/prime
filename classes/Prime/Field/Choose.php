<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Choose
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Choose extends Prime_Field {

	/**
	 * Fieldset render method
	 *
	 * @return View
	 */
	public function as_input($form = 'form_', $item)
	{
		// setup view
		$view = View::factory('Prime/Field/Choose')
		->set('field', $this->field)
		->set('form', $form)
		->set('value', $this->value($item));

		return $view;
	}

} // End Priem Field Choose