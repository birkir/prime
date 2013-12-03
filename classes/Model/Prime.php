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
	 * @var boolean Columns to revision
	 */
	protected $_revision = TRUE;

	/**
	 * @var boolean Should we work with drafts
	 */
	public static $_draft = FALSE;

	/**
	 * Publish loaded object
	 *
	 * @return ORM
	 */
	public function publish()
	{
		if ( ! $this->_loaded)
			throw new Kohana_Exception('Cannot publish :model model because it is not loaded.', array(':model' => $this->_object_name));

		if ( ! $this->_revision)
			throw new Kohana_Exception('Cannot publish :model model because its not revision controlled.', array(':model' => $this->_object_name));

		// Update columns array
		$sets = array();

		// Get table columns
		$columns = $this->_table_columns;

		// Unset flags
		unset($columns['published']);
		unset($columns['revision']);

		foreach ($columns as $column => $_)
		{
			// Append revisioned columns to 
			$sets[] = '`'.$this->_table_name.'`.`'.$column.'` = `'.$this->_table_name.'_rev`.`'.$column.'`';
		}

		// Create transfer query
		$query = ' UPDATE	`'.$this->_table_name.'`'.PHP_EOL
		       . ' JOIN     `'.$this->_table_name.'_rev`'.PHP_EOL
		       . ' ON       `'.$this->_table_name.'_rev`.`revision` = `'.$this->_table_name.'`.`revision`'.PHP_EOL
		       . ' SET      '.implode(', ', $sets).PHP_EOL
		       . ' WHERE    `'.$this->_table_name.'`.`id` ='.$this->id;

		// Load draft row into published row
		DB::query(Database::UPDATE, $query)->execute();

		// Set published flag
		DB::update($this->_table_name)
		->set(array('published' => $this->revision))
		->where('id', '=', $this->id)
		->execute();
	}

	/**
	 * Discard loaded object
	 *
	 * @return ORM
	 */
	public function discard()
	{
		if ( ! $this->_loaded)
			throw new Kohana_Exception('Cannot publish :model model because it is not loaded.', array(':model' => $this->_object_name));

		if ( ! $this->_revision)
			throw new Kohana_Exception('Cannot publish :model model because its not revision controlled.', array(':model' => $this->_object_name));

		DB::update($this->_table_name)
		->set(array('revision' => DB::expr('`published`')))
		->where('id', '=', $this->id)
		->execute();
	}

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

		// Call parent class
		$parent = parent::save($validation);

		return $parent;
	}

	/**
	 * Update record position
	 *
	 * @param integer Reference ID
	 * @return void
	 */
	public function position($reference_id = NULL, $drafts = TRUE)
	{
		// Are we working with drafts
		$draft = ($drafts === TRUE AND $this->_revision);

		if (intval($reference_id) > 0)
		{
			// Get new position
			$sel = $draft ? DB::select('position')
			->from($this->_table_name.'_rev')
			->where($this->_table_name.'_rev.revision', '=', DB::expr('`'.$this->_table_name.'`.`revision`'))
			->limit(1) : 'position';

			// Set new position
			$position = DB::select(array($sel, 'pos'))
				->from($this->_table_name)
				->where('id', '=', intval($reference_id))
				->limit(1)
				->execute()
				->get('pos') - 5;
		}
		else
		{
			// Setup query
			$query = DB::select([DB::expr('MAX(`position`)'), 'pos'])
			->from($this->_table_name.($draft ? '_rev' : NULL));

			foreach ($this->_sortable as $key)
			{
				// Loop through sortable keys
				$query->where($key, $this->{$key} === NULL ? 'IS' : '=', $this->{$key});
			}

			if ($draft)
			{
				$query->where('revision', '=', DB::select('revision')
					->from($this->_table_name)
					->where($this->_table_name.'.id', '=', DB::expr('`'.$this->_table_name.'_rev`.`id`'))
					->limit(1));
			}

			// Set position
			$query = $query->limit(1);

			$position = $query->execute()->get('pos') + 10;
		}

		// Update row position
		$query = DB::update($this->_table_name.($draft ? '_rev' : NULL))
		->set(array('position' => $position))
		->where('id', '=', $this->id);

		if ($draft AND $this->revision !== NULL)
		{
			// Where revision = draft
			$query->where('revision', '=', $this->revision);
		}

		// Execute update query
		$query->execute();

		// Position caret
		$pos = 'SET @pos:=0;';

		if ($draft)
		{
			// Setup update query
			$update = DB::update($this->_table_name.'_rev')
			->where('revision', '=', DB::select('revision')->from($this->_table_name)->where('id', '=', DB::expr('`'.$this->_table_name.'_rev`.`id`'))->limit(1))
			->set(array('position' => DB::expr('@pos:=@pos + 10')))
			->order_by('position', 'ASC');
		}
		else
		{
			// Setup update query
			$update = DB::update($this->_table_name)
			->set(array('position' => DB::expr('@pos:=@pos + 10')))
			->order_by('position', 'ASC');
		}

		// Setup mysqli driver
		$db = Database::instance();

		foreach ($this->_sortable as $key)
		{
			// Reorder new keys
			$update->where($this->_table_name.($draft ? '_rev' : NULL).'.'.$key, $this->{$key} === NULL ? 'IS' : '=', $this->{$key});
		}

		// Update position index
		$db->multiquery($pos.$update);

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
			$this->where($this->_object_name.'.deleted_at', 'IS', NULL);
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
			$this->where($this->_object_name.'.deleted_at', 'IS', NULL);
		}

		if (Model_Prime::$_draft === TRUE AND $this->_revision)
		{
			// Append join statement
			$this->join(array($this->_table_name.'_rev', $this->_object_name.'_rev'))
			->on($this->_object_name.'_rev.revision', '=', DB::expr('`'.$this->_object_name.'`.`revision`'));
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
			$this->where($this->_object_name.'.deleted_at', 'IS', NULL);
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

			// Update the record with deleted flag
			DB::update($this->_table_name)
			->set(array('deleted_at' => DB::expr('NOW()')))
			->where('id', '=', $this->id)
			->execute();

			// Delete revision also
			if ($this->_revision)
			{
				DB::update($this->_table_name.'_rev')
				->set(array('deleted_at' => DB::expr('NOW()')))
				->where('revision', '=', $this->revision)
				->execute();
			}

			// Clear it
			return $this->clear();
		}

		// Call parent function
		return parent::delete();
	}

	/**
	 * Create a record
	 *
	 * @return ORM
	 */
	public function create(Validation $validation = NULL)
	{
		parent::create($validation);

		if (Model_Prime::$_draft === TRUE AND $this->_revision)
		{
			if ( ! is_array($this->_revision))
			{
				$this->_revision = $this->_table_columns;
				unset($this->_revision['published']);
				unset($this->_revision['revision']);
			}

			// Get columns to transfer
			$columns = '`'.implode('`, `', array_keys($this->_revision)).'`';

			// Build query
			$query = 'INSERT INTO       `'.$this->_table_name.'_rev`'.PHP_EOL
			       . '                  ('.$columns.')'.PHP_EOL
			       . 'SELECT            '.$columns.PHP_EOL
			       . 'FROM              `'.$this->_table_name.'`'.PHP_EOL
			       . 'WHERE             `id` = '.$this->id;

			// Get inserted id
			list($id, $rows) = DB::query(Database::INSERT, $query)->execute();

			// Update item revision id
			DB::update($this->_table_name)
			->set(array('revision' => $id))
			->where('id', '=', $this->id)
			->execute();
		}

		return $this;
	}

	/**
	 * Updates a single record or multiple records
	 *
	 * @param  Validation $validation Validation object
	 * @return ORM
	 * @throws Kohana_Exception
	 */
	public function update(Validation $validation = NULL)
	{
		// Run validation if the model isn't valid or we have additional validation rules.
		if ( ! $this->_valid OR $validation)
		{
			$this->check($validation);
		}

		if (Model_Prime::$_draft === TRUE AND $this->_revision)
		{
			// Get whole data not changes
			$rev_data = $this->_object;

			// Unset columns not in revision table
			unset($rev_data['published']);
			unset($rev_data['revision']);

			if ($this->revision === $this->published)
			{
				// Insert to revision table
				list($rev_id, $_) = DB::insert($this->_table_name.'_rev')
				->columns(array_keys($rev_data))
				->values($rev_data)
				->execute($this->_db);

				// Update original table revision
				DB::update($this->_table_name)
				->set(array('revision' => $rev_id))
				->where($this->_primary_key, '=', $this->pk())
				->execute($this->_db);

				// Set revision as inserted row
				$this->_object['revision'] = $rev_id;
			}
			else
			{
				// Update revision table
				DB::update($this->_table_name.'_rev')
				->set($rev_data)
				->where('revision', '=', $this->revision)
				->execute($this->_db);
			}
		}
		else
		{
			// Update a single record
			DB::update($this->_table_name)
			->set($this->_object)
			->where($this->_primary_key, '=', $this->pk())
			->execute($this->_db);

			if (isset($data[$this->_primary_key]))
			{
				// Primary key was changed, reflect it
				$this->_primary_key_value = $data[$this->_primary_key];
			}
		}

		if (empty($this->_changed))
		{
			// Nothing to update
			return $this;
		}

		$data = array();
		foreach ($this->_changed as $column)
		{
			// Compile changed data
			$data[$column] = $this->_object[$column];
		}

		if (is_array($this->_updated_column))
		{
			// Fill the updated column
			$column = $this->_updated_column['column'];
			$format = $this->_updated_column['format'];

			$data[$column] = $this->_object[$column] = ($format === TRUE) ? time() : date($format);
		}

		// Use primary key value
		$id = $this->pk();

		// Object has been saved
		$this->_saved = TRUE;

		// All changes have been saved
		$this->_changed = array();
		$this->_original_values = $this->_object;

		return $this;
	}

	protected function _build($type)
	{
		if (Model_Prime::$_draft === TRUE AND $this->_revision)
		{
			foreach ($this->_db_pending as $i => $method)
			{
				$name = $method['name'];
				$args = $method['args'];

				if ($name === 'where' AND strpos(Arr::get($args, 0), '.') === FALSE)
				{
					$this->_db_pending[$i]['args'][0] = $this->_object_name.'_rev.'.$args[0];
				}
			}
		}

		return parent::_build($type);
	}

	/**
	 * Returns an array of columns to include in the select query.
	 * 
	 * @return array
	 */
	protected function _build_select()
	{
		if (Model_Prime::$_draft === TRUE AND $this->_revision)
		{
			// Append join statement
			$this->_db_builder
			->join(array($this->_table_name.'_rev', $this->_object_name.'_rev'))
			->on($this->_object_name.'_rev.revision', '=', DB::expr('`'.$this->_object_name.'`.`revision`'));

			// TODO: skip or alter join when `revision` IS NULL.

			if ( ! is_array($this->_revision))
			{
				$this->_revision = $this->_table_columns;
				unset($this->_revision['published']);
				unset($this->_revision['revision']);
			}

			// Setup columns
			$columns = array();

			foreach ($this->_table_columns as $column => $_)
			{
				// Set columns from joined revision table
				$columns[] = array($this->_object_name.(isset($this->_revision[$column]) ? '_rev' : NULL).'.'.$column, $column);
			}

			return $columns;
		}

		// Fallback to default select
		return parent::_build_select();
	}

}