<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Dashboard Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Dashboard extends Controller_Prime_Core {

	public function action_index()
	{
		$this->view = View::factory('Prime/Dashboard/Template');
	}

	public function action_tree()
	{
	}

} // End Dashboard