<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime extends ORM {

	private $_update_position = FALSE;

	/**
	 * @var boolean Add user updated by field on saving
	 */
	protected $_updatable = TRUE;

	/**
	 * @var boolean Add sortable with specific keys
	 */
	protected $_sortable = ['parent_id'];

	/**
	 * @var boolean Add deletable functionality
	 */
	protected $_deletable = TRUE;

	/**
	 * Overwrite page save with validation
	 *
	 * @param  Validation Validation object
	 * @return ORM
	 */
	public function save(Validation $validation = NULL)
	{
		if ($this->_updatable)
		{
			// set current user as updating user
			$this->updated_by = Prime::$user->id;
		}

		if ($this->_sortable !== FALSE AND $this->position === NULL)
		{
			// setup query
			$query = DB::select([DB::expr('MAX(`position`)'), 'pos'])
			->from($this->_table_name);

			// loop through sortable keys
			foreach ($this->_sortable as $key)
			{
				$query->where($key, $this->{$key} === NULL ? 'IS' : '=', $this->{$key});
			}

			// set position
			$this->position = $query->limit(1)->execute()->get('pos') + 10;
		}

		// call parent class
		$parent = parent::save($validation);

		if ($this->_sortable !== FALSE)
		{
			// reorder position index
			$this->reorder($this->_sortable);
		}

		return $parent;
	}

	/**
	 * Update node position
	 *
	 * @return ORM
	 */
	public function reorder(array $keys = array())
	{
		// position caret
		$pos = 'SET @pos:=-10;';

		// get values before updated
		$old = $this->original_values();

		// should we reorder old keys
		$reorder_old = FALSE;

		// loop through keys
		foreach ($keys as $key)
		{
			// check if new key has changed
			if ($old[$key] != $this->{$key})
			{
				// lets reorder!
				$reorder_old = TRUE;
				break;
			}
		}

		// setup update query
		$update = DB::update($this->_table_name)
		->set(array(
			'position' => DB::expr('@pos:=@pos + 10')
		))
		->order_by('position', 'ASC');

		// setup mysqli driver
		$db = Database::instance();

		// reorder old list
		if ($reorder_old)
		{
			// clone original update query
			$query = $update;

			// loop through keys
			foreach ($keys as $key)
			{
				$query->where($key, $old[$key] === NULL ? 'IS' : '=', $old[$key]);
			}

			// update position index
			$db->multiquery($pos.$update);
		}

		// reorder new list
		if (intval($old['position']) !== intval($this->position) OR intval($this->position) < 0 OR $this->_update_position)
		{
			// loop through keys
			foreach ($keys as $key)
			{
				$update->where($key, $this->{$key} === NULL ? 'IS' : '=', $this->{$key});
			}

			// update position index
			$db->multiquery($pos.$update);
		}

		// reset update position flag
		$this->_update_position = FALSE;
	}

	/**
	 * Update record position
	 *
	 * @param integer Reference ID
	 * @return void
	 */
	public function position($reference_id = NULL)
	{
		// reset position
		$this->position = NULL;

		// hard re-order
		$this->_update_position = TRUE;

		// check if reference id is greater than zero
		if (intval($reference_id) > 0)
		{
			// set new position
			$this->position = DB::select('position')
				->from($this->_table_name)
				->where('id', '=', intval($reference_id))
				->limit(1)
				->execute()
				->get('position') - 5;
		}

		// singleton
		return $this;
	}

	/**
	 * Finds and load a single database row into the object
	 *
	 * @return Database_Result
	 */
	public function find()
	{
		if ($this->_deletable)
		{
			$this->where('deleted_at', 'IS', NULL);
		}

		// return parent function
		return parent::find();
	}

	/**
	 * Count all records
	 *
	 * @return integer
	 */
	public function count_all()
	{
		if ($this->_deletable)
		{
			$this->where('deleted_at', 'IS', NULL);
		}

		// return parent function
		return parent::count_all();
	}

	/**
	 * Finds multiple database rows and returns an iterator of the rows found.
	 *
	 * @return Database_Result
	 */
	public function find_all()
	{
		if ($this->_deletable)
		{
			$this->where('deleted_at', 'IS', NULL);
		}

		// return parent function
		return parent::find_all();
	}

	/**
	 * Deletes a single record while ignoring relationships.
	 *
	 * @return ORM
	 */
	public function delete()
	{
		if ($this->_deletable)
		{
			if ( ! $this->_loaded)
				throw new Kohana_Exception('Cannot delete :model model because it is not loaded.', array(':model' => $this->_object_name));
	 
			$this->deleted_at = DB::expr('NOW()');

			$this->save();

			return $this->clear();
		}

		return parent::delete();
	}

} // End Model Prime