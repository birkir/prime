<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field User
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_User extends Prime_Field {

	/**
	 * @var string Template to show field as input
	 */
	protected $_input_view = 'Prime/Field/User';

	/**
	 * Field fields
	 *
	 * @return void
	 */
	public function params()
	{
		return array(
			array(
				'name'    => 'multiple',
				'caption' => 'Multiple',
				'field'   => 'Prime_Field_Boolean',
				'default' => FALSE
			)
		);
	}

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
			return __('No user selected');

		// get page
		$user = ORM::factory('User', $str);

		if ($user->loaded())
			return $user->email;
		else
			return __('Invalid user');
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

		// set view page orm
		$view->user = ORM::factory('User', $view->value);

		// return view
		return $view;
	}

} // End Priem Field Page