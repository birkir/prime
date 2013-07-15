<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Core Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Template extends Controller {

	/**
	 * Template view name
	 * @var string
	 */
	public $template = 'Prime/Template';

	/**
	 * View container
	 * @var [type]
	 */
	public $view = NULL;

	/**
	 * Auto render template
	 * @var boolean
	 */
	public $auto_render = TRUE;

	/**
	 * Before action
	 * @return void
	 */
	public function before()
	{
		// load template
		$this->template = View::factory($this->template);
	}

	/**
	 * After action
	 * @return void
	 */
	public function after()
	{
		// check for auto render flag
		if ($this->auto_render === TRUE)
		{
			// assign view
			$this->template->view = $this->view;

			// response body
			$this->response->body($this->template->render());
		}
	}

} // End Core