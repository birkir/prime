<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Choose
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Choose extends Prime_Field {

	/**
	 * @var string Template to show field as input
	 */
	protected $_as_input = 'Prime/Field/Choose';

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

		// get options
		$options = Arr::get($this->field, 'options', []);

		// get option items
		$items = Arr::get($options, 'items', []);

		// find selected value in options
		return Arr::get($items, $str, NULL);
	}

} // End Priem Field Choose