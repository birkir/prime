<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Module extends Controller_Prime_Core {

	public function action_index()
	{
		$this->view = View::factory('Prime/Module/List');
	}

} // End Prime Module