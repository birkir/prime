<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Field Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Fieldset
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Module_Fieldset_Field extends ORM {

	/**
	 * Belongs to relationships
	 * @var array
	 */
	protected $_belongs_to = array(
		'fieldset' => array(
			'model'       => 'Prime_Module_Fieldset',
			'foreign_key' => 'prime_module_fieldset_id'
		)
	);

	/**
	 * Render fieldset field
	 * 
	 * @param  ORM    $obj Field data
	 * @return View
	 */
	public function render($obj = NULL)
	{
		// prepare field configuration
		$config = array(
			'key'        => 'field'.$this->id,
			'name'       => $this->caption,
			'default'    => $this->{"default"},
			'properties' => json_decode($this->properties, TRUE)
		);

		// check if data object was loaded and its data not an array 
		if ($obj->loaded() AND ! is_array($obj->data))
		{
			// convert data to array
			$obj->data = json_decode($obj->data, TRUE);
		}

		// if data object has field key in it
		if (isset($obj->data[$this->name]))
		{
			// set field value from data object
			$config['value'] = $obj->data[$this->name];
		}

		// call field static function
		$field = call_user_func_array(array($this->field, 'factory'), array($config));

		// return view
		return $field->render();
	}

} // End Prime Module Fieldset Field Model