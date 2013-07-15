<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Item Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Fieldset
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Module_Fieldset_Item extends ORM {

	protected $_fields;

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

	protected function _load_values(array $values)
	{
		// load values defaults
		parent::_load_values($values);

		// extend JSON behaviour
		try
		{
			$this->_object['data'] = json_decode($this->_object['data'], TRUE);
		}
		catch (Exception $e) {}

		// return self
		return $this;
	}

} // End Prime Module Fieldset Item Model