<?php defined('SYSPATH') or die('No direct script access.');
/**
 * ### Boolean Field
 * Field input with checkbox, radio options or dropdown.
 *
 * Parameter | Options                          | Default value
 * ----------| ---------------------------------| -------------
 * type      | string (checkbox, radio, select) | checkbox
 * hidden    | boolean                          | false
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Boolean extends Prime_Field {

	/**
	 * @var string Template to show field as input
	 */
	protected $_input_view = 'Prime/Field/Boolean';

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

		// just return true or false
		return UTF8::ucfirst($str ? __('yes') : __('no'));
	}

} // End Priem Field Boolean