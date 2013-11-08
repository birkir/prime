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
	 *
	 * @return void
	 */
	public function before()
	{
		// Load template
		$this->template = View::factory($this->template);

		// Set Request as global object
		View::set_global('r', $this->request);

		// Check for User authentication
		$this->check_auth();
	}

	/**
	 * Check if Prime Installation is needed and redirect
	 * to installation page.
	 *
	 * @return void
	 */
	public function install()
	{
		// Load Prime configuration
		$prime = Kohana::$config->load('prime');

		if (empty($prime->as_array()))
		{
			// Redirect to Installation page
			HTTP::redirect('/Prime/Install');
			exit;
		}
	}

	/**
	 * Check if authentication is needed
	 *
	 * @return void
	 */
	public function check_auth()
	{
		// Check for Prime installation
		$this->install();

		// Checks if User is logged in with Prime role
		$logged_in = Auth::instance()->logged_in('prime');

		if ($this->authentication AND ! $logged_in)
		{
			// Redirect User to Login page because he is not logged in
			// TODO: logged in users that dont have prime role.
			return HTTP::redirect('Prime/Account/Login');
		}

		if ($logged_in)
		{
			// Get the user
			$this->user = Auth::instance()->get_user();

			//  Set User in Prime facade
			Prime::$user = $this->user;

			// Set Users defined Prime Language
			I18n::lang($this->user->language);

			// Globally register User model to Views
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
		if ($this->auto_render === TRUE)
		{
			// Assign view to main template
			$this->template->view = $this->view;

			// Attach template to Response body
			$this->response->body($this->template->render());
		}
	}

}