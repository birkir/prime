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
	protected $_input_view = 'Prime/Field/Choose';

	/**
	 * Field fields
	 *
	 * @return void
	 */
	public function params()
	{
		return array(
			array(
				'name'        => 'items',
				'caption'     => 'Items',
				'field'       => 'Prime_Field_Text',
				'default'     => NULL,
				'options'     => array(
					'placeholder' => 'eg. foo: bar \\n',
					'rows' => 5
				)
			),
			array(
				'name'        => 'multiple',
				'caption'     => 'Multiple',
				'field'       => 'Prime_Field_Boolean',
				'default'     => FALSE
			)
		);
	}

	public static function items($text = NULL)
	{
		if (is_array($text)) return $text;

		// get option items
		$items = array();
		$lines = explode("\n", $text);

		foreach ($lines as $line)
		{
			$key = substr($line, 0, strpos($line, ':'));
			$val = substr($line, strpos($line, ':') + 1);
			$items[UTF8::trim($key)] = UTF8::trim($val);
		}

		if (count($items) === 0)
		{
			$items[] = __('no options');
		}

		return $items;
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

		// get options
		$options = Arr::get($this->field, 'options', []);

		// get items as array
		$items = self::items(Arr::get($options, 'items'));

		// find selected value in options
		return Arr::get($items, $str, NULL);
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
		// get options
		$options = Arr::get($this->field, 'options', []);

		// get items as array
		$items = self::items(Arr::get($options, 'items'));

		// get parent view
		$view = parent::input($item, $errors);

		// set view fieldset orm
		$view->items = $items;

		// Allow multiple choice
		$view->multiple = Arr::get($options, 'multiple', FALSE);

		// return view
		return $view;
	}

}