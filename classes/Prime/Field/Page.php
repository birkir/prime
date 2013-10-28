<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Page
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Page extends Prime_Field {

	/**
	 * @var string Template to show field as input
	 */
	protected $_as_input = 'Prime/Field/Page';

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

		if (intval($str) === 0)
			return __('No page selected');

		// get page
		$page = ORM::factory('Prime_Page', $str);

		if ($page->loaded())
			return $page->name;
		else
			return __('Invalid page');
	}

	/**
	 * Overload as input method
	 *
	 * @param  ORM   Field object
	 * @param  array Error list
	 * @return View
	 */
	public function as_input($item, $errors = [])
	{
		// get parent view
		$view = parent::as_input($item, $errors);

		// set view page orm
		$view->page = ORM::factory('Prime_Page', $view->value);

		// return view
		return $view;
	}

} // End Priem Field Page