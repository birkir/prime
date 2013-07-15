<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Fieldset
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Module_Fieldset extends ORM {

	protected $_fields;

	/**
	 * Has many relationships
	 * @var array
	 */
	protected $_has_many = array(
		'items' => array(
			'model' => 'Prime_Module_Fieldset_Item'
		)
	);

	public function fields()
	{
		if ( ! $this->loaded())
			return;

		return ORM::factory('Prime_Field')
		->where('resource_type', '=', 'Module_Fieldset')
		->where('resource_id', '=', $this->id)
		->order_by('position', 'ASC')
		->find_all();
	}

	public function base()
	{
		// order by item position ascending
		$this->order_by('position', 'ASC');

		// return ORM for further process
		return $this;
	}
	/**
	 * Recursivly find sub pages of loaded record
	 * @return ORM
	 */
	public function recursive()
	{
		return ORM::factory('Prime_Module_Fieldset')
		->base()
		->where('parent_id', $this->loaded() ? '=' : 'IS', $this->loaded() ? $this->id : NULL);
	}

} // End Prime Module Fieldset