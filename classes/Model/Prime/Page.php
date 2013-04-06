<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Page extends ORM {

	/**
	 * Has many relationsip
	 * @var array
	 */
	protected $_has_many = array
	(
		'pages' => array
		(
			'model'       => 'Prime_Page',
			'foreign_key' => 'parent_id',
			'far_key'     => 'id'
		),
		'regions' => array
		(
			'model'       => 'Prime_Region',
			'foreign_key' => 'prime_page_id',
			'far_key'     => 'id'
		)
	);

	/**
	 * Get all pages per level
	 * 
	 * @param  boolean $backend   Backend or frontend view
	 * @param  int     $parent_id Parent page id
	 * @return Database_Result
	 */
	public function pages($backend = FALSE, $parent_id = NULL)
	{
		$this->where('prime_page.deleted', '=', 0);

		if ($parent_id === NULL OR $parent_id === 0)
		{
			$this->where('parent_id', 'IS', NULL);
		}
		else
		{
			$this->where('parent_id', '=', $parent_id);
		}

		if ($backend !== TRUE)
		{
			$this->where('visible', '=', TRUE);
		}

		$this->order_by('index', 'ASC');

		return $this->find_all();
	}

} // End Prime Page Model