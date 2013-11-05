<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Template Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Template extends Controller {

	/**
	 * @var string Template view name
	 */
	public $template = 'Prime/Template';

	/**
	 * @var View View container
	 */
	public $view = NULL;

	/**
	 * @var boolean Auto render template
	 */
	public $auto_render = TRUE;

	/**
	 * @var boolean Authentication required
	 */
	public $authentication = TRUE;

	/**
	 * Before action
	 * @return void
	 */
	public function before()
	{
		// load template
		$this->template = View::factory($this->template);

		// set r object
		View::set_global('r', $this->request);

		// check for authentication
		$this->check_auth();

	}

	/**
	 * Install Prime
	 *
	 * @return void
	 */
	public function install()
	{
		// load prime configure
		$prime = Kohana::$config->load('prime');

		// check if no file has been generated
		if (empty($prime->as_array()))
		{
			HTTP::redirect('/Prime/Install');
			exit;
		}
	}

	/**
	 * Check for authentication if needed
	 *
	 * @return void
	 */
	public function check_auth()
	{
		// check if user is logged in
		$logged_in = Auth::instance()->logged_in('prime');

		// install Prime 
		$this->install();

		// if we want authentication to be required
		if ($this->authentication AND ! $logged_in)
		{
			return HTTP::redirect('Prime/Account/Login');
		}

		// add user if available
		if ($logged_in)
		{
			// get the user
			$this->user = Auth::instance()->get_user();

			//  set user in prime class
			Prime::$user = $this->user;

			// set language
			I18n::lang($this->user->language);

			// add user to global view and vise versa
			View::set_global('user', $this->user);
		}
	}

	/**
	 * After action
	 *
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

} // End Prime Template Controller