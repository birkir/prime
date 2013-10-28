<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Field extends ORM {

	public function save(Validation $validation = NULL)
	{
		// create position if non existent
		if ( ! $this->loaded() AND $this->position === NULL)
		{
			$this->position = DB::select([DB::expr('MAX(`position`)'), 'pos'])
			->from('prime_fields')
			->where('resource_id', '=', $this->resource_id)
			->where('resource_type', '=', $this->resource_type)
			->limit(1)
			->execute()
			->get('pos') + 1;
		}

		// continue ...
		return parent::save($validation);
	}

	protected function _load_values(array $values)
	{
		// load values defaults
		parent::_load_values($values);

		// only on load
		if ($this->loaded())
		{
			try
			{
				$values['options'] = json_decode($values['options'], TRUE);
			}
			catch (Exception $e)
			{
				Kohana::$log->add(Log::ERROR, 'Failed loading options for field.');
			}

			// set field as class
			if ( ! class_exists($values['field']))
			{
				// kohana LOG
				$values['field'] = 'Prime_Field';
			}
			
			$this->_object['field'] = call_user_func_array([$values['field'], 'factory'], [$values]);
		}

		// return self
		return $this;
	}

} // End Prime Field