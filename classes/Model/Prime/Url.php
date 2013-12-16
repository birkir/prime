<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime File Url
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Url extends Model_Prime {

	/**
	 * @var boolean Model is not sortable
	 */
	protected $_sortable = FALSE;

	/**
	 * @var boolean Model is not revision controlled
	 */
	protected $_revision = FALSE;

	protected $_table_columns = array (
		'id' => array(),
		'uri' => array(),
		'redirect' => array(),
		'prime_page_id' => array(),
		'updated_at' => array(),
		'updated_by' => array(),
		'deleted_at' => array()
	);

}