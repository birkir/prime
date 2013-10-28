<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Boolean
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
	protected $_as_input = 'Prime/Field/Boolean';

	/**
	 * Overload Field Data as Text
	 *
	 * @param  mixed  $item
	 * @return string
	 */
	public function as_text($item)
	{
		// get parent field
		$str = parent::as_text($item);

		// just return true or false
		return UTF8::ucfirst($str ? __('yes') : __('no'));
	}

} // End Priem Field Boolean