<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Fieldset
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Module_Fieldset extends ORM {

	/**
	 * @var array Fields container
	 */
	protected $_fields;

	/**
	 * @var boolean Model is not sortable
	 */
	protected $_sortable = FALSE;

	/**
	 * @var boolean Model is not revision controlled
	 */
	protected $_revision = FALSE;

	/**
	 * @var array Has many relationships
	 */
	protected $_has_many = [
		'items' => [
			'model' => 'Prime_Module_Fieldset_Item'
		]
	];

	/** 
	 * Find fieldset fields inherited.
	 *
	 * @return Database_Result
	 */
	public function fields()
	{
		if ( ! $this->loaded())
			return;

		// Use current fieldset as base
		$inherited = array($this->id);
		$parent    = $this;

		while ($parent->loaded() AND $parent->parent_id !== NULL)
		{
			// Append to inherited array
			$inherited[] = $parent->parent_id;

			// Load the parent node
			$parent = ORM::factory('Prime_Module_Fieldset')
			->where('id', '=', $this->parent_id)
			->where('type', '=', 1)
			->find();
		}

		return ORM::factory('Prime_Field')
		->where('resource_type', '=', 'Module_Fieldset')
		->where('resource_id', 'IN', $inherited)
		->order_by('position', 'ASC')
		->find_all();
	}

	public function base()
	{
		// Order by item position ascending
		$this->order_by('position', 'ASC');

		// Return ORM for further process
		return $this;
	}

	/**
	 * Recursivly find sub pages of loaded record
	 *
	 * @return ORM
	 */
	public function recursive()
	{
		return ORM::factory('Prime_Module_Fieldset')
		->base()
		->where('parent_id', $this->loaded() ? '=' : 'IS', $this->loaded() ? $this->id : NULL);
	}

}