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
	 * Field fields
	 *
	 * @return void
	 */
	public function params()
	{
		return array(
			array(
				'name'    => 'type',
				'caption' => 'Type',
				'field'   => 'Prime_Field_Choose',
				'default' => 'list',
				'options' => array(
					'items' => array(
						'list' => 'Fieldset List',
						'item' => 'Fieldset Item'
					)
				)
			),
			array(
				'name'    => 'fieldset',
				'caption' => 'Fieldset',
				'field'   => 'Prime_Field_Fieldset',
				'default' => NULL
			),
			array(
				'name'    => 'multiple',
				'caption' => 'Multiple',
				'field'   => 'Prime_Field_Boolean',
				'default' => FALSE
			)
		);
	}

	/**
	 * Construct the field
	 *
	 * @return self
	 */
	public function __construct($field)
	{
		// construct the parent
		parent::__construct($field);

		return $this;
	}

	/**
	 * Overload Field Data as Text
	 *
	 * @param  mixed  $item
	 * @return string
	 */
	public function text($item)
	{
		$options = Arr::get($this->field, 'options', []);

		// Get field type
		$type = Arr::get($options, 'type', 'list');

		// get parent field
		$str = parent::text($item);

		if (intval($str) === 0)
		{
			return __('No fieldset'.($type === 'item' ? ' item' : NULL).' selected');
		}

		if ($type === 'item')
		{
			$item = ORM::factory('Prime_Module_Fieldset_Item', $str);

			if ($item->loaded())
			{
				$data = $item->data;
				return reset($data);
			}
			else
			{
				return __('Invalid fieldset item');
			}
		}
		else
		{
			// get fieldset
			$fieldset = ORM::factory('Prime_Module_Fieldset', $str);

			return $fieldset->loaded() ? $fieldset->name : __('Invalid fieldset');
		}

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
		$options = Arr::get($this->field, 'options', []);

		// get parent view
		$view = parent::input($item, $errors);

		// Get field type
		$view->type = Arr::get($options, 'type', 'list');

		// Get selected fieldset
		$view->fieldset = ORM::factory('Prime_Module_Fieldset', Arr::get($options, 'fieldset'));

		// Get field item
		$view->item = ORM::factory('Prime_Module_Fieldset'.($view->type === 'item' ? '_Item' : NULL), $view->value);

		// return view
		return $view;
	}

}