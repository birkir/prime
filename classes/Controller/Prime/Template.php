<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Template Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Template extends Controller_Prime_Media {

	/**
	 * Set directory to serve
	 * 
	 * @var string
	 */
	public $directory = 'views';

	/**
	 * Save method for files
	 * 
	 * @var string
	 */
	public $savemethod = 'app.template.save';

	/**
	 * Default landing page
	 * 
	 * @return void
	 */
	public function action_index()
	{
		$this->template->left = View::factory('Prime/Template/Tree');
	}

	/**
	 * Edit page
	 * 
	 * @return void
	 */
	public function action_edit()
	{
		$this->template->left = View::factory('Prime/Template/Tree')
		->set('path', $this->request->param('id'));
	}

} // End Prime Template Controller