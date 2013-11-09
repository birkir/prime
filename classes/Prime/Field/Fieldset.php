<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Fieldset
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Fieldset extends Prime_Field {

	/**
	 * @var string Template to show field as input
	 */
	protected $_input_view = 'Prime/Field/Fieldset';

	/**
	 * Overload Field Data as Text
	 *
	 * @param  mixed  $item
	 * @return string
	 */
	public function text($item)
	{
		// get parent field
		$str = parent::text($item);

		if (intval($str) === 0)
			return __('No fieldset selected');

		// get page
		$fieldset = ORM::factory('Prime_Module_Fieldset', $str);

		if ($fieldset->loaded())
			return $fieldset->name;
		else
			return __('Invalid fieldset');
	}

	/**
	 * Overload as input method
	 *
	 * @param  ORM   Field object
	 * @param  array Error list
	 * @return View
	 */
	public function input($item, $errors = [])
	{
		// get parent view
		$view = parent::input($item, $errors);

		// set view fieldset orm
		$view->fieldset = ORM::factory('Prime_Module_Fieldset', $view->value);

		// return view
		return $view;
	}

} // End Priem Field Fieldset