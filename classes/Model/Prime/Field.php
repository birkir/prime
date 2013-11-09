<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Field extends Model_Prime {

	/**
	 * @var boolean Add sortable with specific keys
	 */
	protected $_sortable = ['resource_id', 'resource_type'];

	/**
	 * Rules for the field model
	 *
	 * @return array Rules
	 */
	public function rules()
	{
		return array(
			'resource_id' => array(
				array('not_empty')
			),
			'resource_type' => array(
				array('not_empty')
			),
			'caption' => array(
				array('not_empty')
			),
			'name' => array(
				array('not_empty'),
				array('alpha_dash'),
				array(array($this, 'unique_name'), array(':validation'))
			),
			'options' => array(
				array(array($this, 'invalid_json'))
			)
		);
	}

	/**
	 * Validate JSON
	 *
	 * @param  string  $string String to validate
	 * @return boolean
	 */
	public function invalid_json($string = NULL)
	{
		return !! json_decode($string, TRUE);
	}

	/**
	 * Unique field name
	 *
	 * @return boolean
	 */
	public function unique_name($validation)
	{
		// Get data to be validated
		$data = $validation->data();

		// Find named records casted to integer
		$found = intval(DB::select(array(DB::expr('COUNT(*)'), 'found'))
		->from($this->_table_name)
		->where('resource_id', '=', Arr::get($data, 'resource_id'))
		->where('resource_type', '=', Arr::get($data, 'resource_type'))
		->where('name', '=', Arr::get($data, 'name'))
		->where('id', '!=', Arr::get($data, 'id', 0))
		->where('deleted_at', 'IS', NULL)
		->execute()
		->get('found', 0));

		return ($found === 0);
	}

	/**
	 * Overwrite load values function
	 *
	 * @param  array List of values
	 * @return ORM
	 */
	protected function _load_values(array $values)
	{
		// Load values defaults
		parent::_load_values($values);

		if ($this->loaded())
		{
			try
			{
				// Attempt to decode JSON data
				$values['options'] = json_decode($values['options'], TRUE);
			}
			catch (Exception $e)
			{
				Kohana::$log->add(Log::ERROR, 'Failed loading options for field [:field].', array(':field' => $this->id));
			}

			if ( ! class_exists($values['field']))
			{
				// Fallback to default Field
				$values['field'] = 'Prime_Field';
			}

			// Allow reference to field key in model
			$this->_object['field'] = call_user_func_array([$values['field'], 'factory'], [$values]);
		}

		return $this;
	}

}