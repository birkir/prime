<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Module extends Model_Prime {

	/**
	 * @var boolean Model is not sortable
	 */
	protected $_sortable = FALSE;

	/**
	 * @var boolean Model is not revision controlled
	 */
	protected $_revision = FALSE;
	protected $_deletable = FALSE;

	protected $_table_columns = array (
		'id' => array(),
		'controller' => array(),
		'slug' => array(),
		'name' => array(),
		'description' => array(),
		'version' => array(),
		'js' => array(),
		'position' => array()
	);

	/**
	 * Always order by ascending position
	 *
	 * @return parent::find_all
	 */
	public function find_all()
	{
		$this->order_by('position', 'ASC');

		return parent::find_all();
	}

}