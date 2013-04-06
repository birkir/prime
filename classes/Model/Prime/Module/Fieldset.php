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

	/**
	 * Has many relationships
	 * @var array
	 */
	protected $_has_many = array(
		'items' => array(
			'model' => 'Prime_Module_Fieldset_Item'
		),
		'fields' => array(
			'model' => 'Prime_Module_Fieldset_Field'
		)
	);

	/**
	 * Get fieldsets and folders for a parent
	 * 
	 * @param  int    $parent_id Parent fieldset_id
	 * @return Database_Result
	 */
	public function tree($parent_id = NULL)
	{
		// no deleted fieldsets
		$this->where('prime_module_fieldset.deleted', '=', 0);

		// check if no parent_id was given
		if ($parent_id === NULL OR $parent_id === 0)
		{
			// find root nodes
			$this->where('parent_id', 'IS', NULL);
		}
		else
		{
			// find where parent
			$this->where('parent_id', '=', $parent_id);
		}

		// order by type descending
		$this->order_by('type', 'DESC');

		// then order by name ascending
		$this->order_by('name', 'ASC');

		// and find all
		return $this->find_all();
	}

} // End Prime Module Fieldset