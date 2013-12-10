<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime File Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_File extends Model_Prime {

	/**
	 * @var boolean Model is not sortable
	 */
	protected $_sortable = FALSE;

	/**
	 * @var boolean Model is not revision controlled
	 */
	protected $_revision = FALSE;

	/**
	 * @var array Has many relationships
	 */
	protected $_has_many = array(
		'files' => array(
			'model'       => 'Prime_File',
			'foreign_key' => 'parent_id',
			'far_key'     => 'id'
		)
	);

	protected $_table_columns = array(
		'id' => array(),
		'parent_id' => array(),
		'name' => array(),
		'slug' => array(),
		'type' => array(),
		'ext' => array(),
		'mime' => array(),
		'size' => array(),
		'width' => array(),
		'height' => array(),
		'bits' => array(),
		'channels' => array(),
		'filename' => array(),
		'updated_at' => array(),
		'updated_by' => array(),
		'deleted_at' => array(),
		'published' => array(),
		'revision' => array()
	);

}