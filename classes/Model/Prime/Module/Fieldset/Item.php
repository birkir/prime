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
	protected $_sortable = array(
		'prime_module_fieldset_id'
	);

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

	protected $_table_columns = array(
		'id' => array(),
		'prime_module_fieldset_id' => array(),
		'data' => array(),
		'position' => array(),
		'updated_at' => array(),
		'updated_by' => array(),
		'deleted_at' => array(),
		'published' => array(),
		'revision' => array()
	);

	/**
	 * Overload model getter for extraction of data JSON field.
	 *
	 * @param  string $column
	 * @return string
	 */
	public function get($column)
	{
		if ( isset($this->_object['data']) AND is_array($this->_object['data']) AND array_key_exists($column, Arr::get($this->_object, 'data', [])))
		{
			return $this->_object['data'][$column];
		}

		return parent::get($column);
	}

	/**
	 * Convert json data to columns in SQL. For performance we only convert fields needed.
	 *
	 * @param  array $columns Columns wanted
	 * @return ORM
	 */
	public function data_to_columns($columns = [])
	{
		foreach ($columns as $column)
		{
			$this->select([DB::expr(
				  'SUBSTRING(REPLACE(REPLACE(REPLACE('.$this->_db->quote_column($this->_object_name.'.data').',\'{\',\'\'),\'}\',\',\'),\'"\',\'\'),'
				. 'LOCATE(CONCAT(:column,\':\'),REPLACE(REPLACE(REPLACE('.$this->_db->quote_column($this->_object_name.'.data').',\'{\',\'\'),\'}\',\',\'),\'"\',\'\')) + CHAR_LENGTH(CONCAT(:column,\':\')),'
        		. 'LOCATE(\',\',SUBSTRING(REPLACE(REPLACE(REPLACE('.$this->_db->quote_column($this->_object_name.'.data').',\'{\',\'\'),\'}\',\',\'),\'"\',\'\'),'
                . 'LOCATE(CONCAT(:column,\':\'),REPLACE(REPLACE(REPLACE('.$this->_db->quote_column($this->_object_name.'.data').',\'{\',\'\'),\'}\',\',\'),\'"\',\'\')) + CHAR_LENGTH(CONCAT(:column,\':\')))) - 1)'
			, [':column' => $column]), 'data_'.$column]);
		}

		return $this;
	}

	/**
	 * Overload load values from database method for extracting JSON data field.
	 *
	 * @param  array $values Values to parse
	 * @return ORM
	 */
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
}