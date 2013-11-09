<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Module extends ORM {

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