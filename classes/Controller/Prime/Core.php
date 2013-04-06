<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Core Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Core extends Controller {

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
	 * User container
	 * @var mixed
	 */
	public $user = NULL;

	/**
	 * Before action
	 * @return void
	 */
	public function before()
	{
		// build auth instance
		$this->auth = Prime_Auth::instance();

		// load user
		$this->user = $this->auth->get_user();

		// check for login
		if ($this->request->controller() !== 'User' AND $this->user === NULL)
		{
			// redirect to login
			HTTP::redirect('prime/user/login');
			exit;
		}

		// load template
		$this->template = View::factory($this->template);

		// globally set user
		View::set_global('user', $this->user);
	}

	public function unauthorized($msg = NULL)
	{
		// load view
		$unauthorized = View::factory($this->template)
		->set('hidenavbar', TRUE)
		->set('modal', View::factory('Prime/User/Unauthorized'))
		->set('message', $msg);

		// render view
		$this->response->body($unauthorized->render());

		// set 401 Unauthorized
		$this->response->status(401);

		// send headers
		$this->response->send_headers();

		// output response body
		die($this->response->body());
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
			// 
			$this->template->view = $this->view;

			if (isset($this->modal))
			{
				$this->template->modal = $this->view;
				$this->template->hidenavbar = TRUE;
			}

			$this->response->body($this->template->render());
		}
	}

} // End Core