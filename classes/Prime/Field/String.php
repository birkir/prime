<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field String
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_String extends Prime_Field {

	// Parameters
	public function params()
	{
		return [
			'type' => [
				'caption' => 'Type',
				'field'   => 'Prime_Field_Choose',
				'default' => 'string',
				'options' => [
					'items' => [
						'string'    => 'String',
						'email'     => 'Email',
						'integer'   => 'Integer',
						'float'     => 'Float',
						'money'     => 'Money',
						'decimal'   => 'Decimal'
					]
				]
			],
		];
	}

	/**
	 * Fieldset render method
	 *
	 * @return View
	 */
	public function as_input($form = 'form_', $item)
	{
		// setup view
		$view = View::factory('Prime/Field/String')
		->set('field', $this->field)
		->set('form', $form)
		->set('caller', $this)
		->set('item', $item)
		->set('value', $this->value($item));

		return $view;
	}

} // End Priem Field String