<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Region Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Region extends ORM {

	/**
	 * Belongs to relationships
	 * @var array
	 */
	protected $_belongs_to = array
	(
		'module' => array
		(
			'model' => 'Prime_Module',
			'foreign_key' => 'prime_module_id',
		)
	);

	/**
	 * Get all regions in page
	 * @param  boolean $revision
	 * @return ORM              
	 */
	public function get_all()
	{
		$this->where('prime_region.deleted', '=', 0)
		->order_by('index', 'ASC');

		return $this->find_all();
	}

} // End Prime Region Model