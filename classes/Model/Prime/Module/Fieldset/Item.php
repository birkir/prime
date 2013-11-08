<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Item Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Fieldset
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Module_Fieldset_Item extends Model_Prime {

	/**
	 * @var boolean Add sortable with specific keys
	 */
	protected $_sortable = ['prime_module_fieldset_id'];

	/**
	 * Belongs to relationships
	 * @var array
	 */
	protected $_belongs_to = [
		'fieldset' => [
			'model'       => 'Prime_Module_Fieldset',
			'foreign_key' => 'prime_module_fieldset_id'
		]
	];

	public function get($column)
	{
		if ( isset($this->_object['data']) AND is_array($this->_object['data']) AND array_key_exists($column, Arr::get($this->_object, 'data', [])))
		{
			return $this->_object['data'][$column];
		}

		return parent::get($column);
	}

	public function data_to_columns($columns = [])
	{
		foreach ($columns as $column)
		{
			$this->select([DB::expr(
				  'SUBSTRING(REPLACE(REPLACE(REPLACE(data,\'{\',\'\'),\'}\',\',\'),\'"\',\'\'),'
				. 'LOCATE(CONCAT(:column,\':\'),REPLACE(REPLACE(REPLACE(data,\'{\',\'\'),\'}\',\',\'),\'"\',\'\')) + CHAR_LENGTH(CONCAT(:column,\':\')),'
        		. 'LOCATE(\',\',SUBSTRING(REPLACE(REPLACE(REPLACE(data,\'{\',\'\'),\'}\',\',\'),\'"\',\'\'),'
                . 'LOCATE(CONCAT(:column,\':\'),REPLACE(REPLACE(REPLACE(data,\'{\',\'\'),\'}\',\',\'),\'"\',\'\')) + CHAR_LENGTH(CONCAT(:column,\':\')))) - 1)'
			, [':column' => $column]), 'data_'.$column]);
		}

		return $this;
	}

	protected function _load_values(array $values)
	{
		// load values defaults
		parent::_load_values($values);

		// extend JSON behaviour
		try
		{
			$this->_object['data'] = json_decode($this->_object['data'], TRUE);
		}
		catch (Exception $e)
		{
			Kohana::$log->add(Log::ERROR, 'Failed loading data for fieldset item.');
		}

		// return self
		return $this;
	}

} // End Prime Module Fieldset Item