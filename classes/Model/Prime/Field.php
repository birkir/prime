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

	protected function _load_values(array $values)
	{
		// load values defaults
		parent::_load_values($values);

		// only on load
		if ($this->loaded())
		{
			try {
				$values['options'] = json_decode($values['options'], TRUE);
			} catch (Exception $e) {}

			// set field as class
			$this->_object['field'] = call_user_func_array([$values['field'], 'factory'], [$values]);
		}

		// return self
		return $this;
	}

} // End Prime Field