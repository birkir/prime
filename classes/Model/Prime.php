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

	/**
	 * @var boolean Force update position
	 */
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
		if ($this->_updatable AND isset(Prime::$user->id))
		{
			// Set current user as updating user
			$this->updated_by = Prime::$user->id;
		}

		if ($this->_sortable !== FALSE AND $this->position === NULL)
		{
			// Setup query
			$query = DB::select([DB::expr('MAX(`position`)'), 'pos'])
			->from($this->_table_name);

			// Loop through sortable keys
			foreach ($this->_sortable as $key)
			{
				$query->where($key, $this->{$key} === NULL ? 'IS' : '=', $this->{$key});
			}

			// Set position
			$this->position = $query->limit(1)->execute()->get('pos') + 10;
		}

		// Call parent class
		$parent = parent::save($validation);

		if ($this->_sortable !== FALSE)
		{
			// Reorder position index
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
		// Position caret
		$pos = 'SET @pos:=-10;';

		// Get values before updated
		$old = $this->original_values();

		// Should we reorder old keys
		$reorder_old = FALSE;

		foreach ($keys as $key)
		{
			if ($old[$key] != $this->{$key})
			{
				// Reorder old keys
				$reorder_old = TRUE;
				break;
			}
		}

		// Setup update query
		$update = DB::update($this->_table_name)
		->set(array('position' => DB::expr('@pos:=@pos + 10')))
		->order_by('position', 'ASC');

		// Setup mysqli driver
		$db = Database::instance();

		if ($reorder_old)
		{
			// Clone original update query
			$query = $update;

			foreach ($keys as $key)
			{
				// Add old keys as where to update query
				$query->where($key, $old[$key] === NULL ? 'IS' : '=', $old[$key]);
			}

			// Update position index
			$db->multiquery($pos.$update);
		}

		if (intval($old['position']) !== intval($this->position) OR intval($this->position) < 0 OR $this->_update_position)
		{
			foreach ($keys as $key)
			{
				// Reorder new keys
				$update->where($key, $this->{$key} === NULL ? 'IS' : '=', $this->{$key});
			}

			// Update position index
			$db->multiquery($pos.$update);
		}

		// Reset update position flag
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
		// Reset position
		$this->position = NULL;

		// Hard re-order
		$this->_update_position = TRUE;

		if (intval($reference_id) > 0)
		{
			// Set new position
			$this->position = DB::select('position')
				->from($this->_table_name)
				->where('id', '=', intval($reference_id))
				->limit(1)
				->execute()
				->get('position') - 5;
		}

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
			// Add deleted at where
			$this->where('deleted_at', 'IS', NULL);
		}

		// Return parent function
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
			// Add deleted at where
			$this->where('deleted_at', 'IS', NULL);
		}

		// Return parent function
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
			// Add deleted at where
			$this->where('deleted_at', 'IS', NULL);
		}

		// Return parent function
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

			// Set deleted at value
			$this->deleted_at = DB::expr('NOW()');

			// Always valid
			$this->_valid = TRUE;

			// Update model
			$this->update();

			// Clear it
			return $this->clear();
		}

		// Call parent function
		return parent::delete();
	}

}