<?php

class Controller_Prime_Account extends Controller_Prime_Template {

	/**
	 * @var Disable auto render
	 */
	public $auto_render = FALSE;

	/**
	 * Disable the need of authentication
	 */
	public $authentication = FALSE;

	/**
	 * Dummy function to make admin account
	 */
	public function action_makeadmin()
	{
		$post = ['email' => 'admin@prime.com', 'password' => 'foobazar'];

		ORM::factory('User', 1)
		->values([
			'password' => 'adminadmin'
		])
		->save();

		exit;
	}

	public function action_index()
	{
		$this->auto_render = TRUE;

		$this->check_auth();

		$this->view = 'Hello world! my profile';
	}

	/**
	 * Logs a user out
	 */
	public function action_login()
	{
		if (Auth::instance()->logged_in())
			return HTTP::redirect('Prime/Account');

		// do a template render
		$this->auto_render = TRUE;

		// set template view
		$this->template = View::factory('Prime/Login')
		->bind('message', $message);

		// check for post method
		if ($this->request->method() === HTTP_Request::POST)
		{
			// no direct output
			$this->response->body(json_encode(['message' => 'Email or password incorrect.']));

			// get post data
			$post = $this->request->post();

			// try login
			if (Auth::instance()->login($post['email'], $post['password'], isset($post['remember'])))
			{
				return HTTP::redirect('Prime/Account');
			}

			$message = 'E-Mail or password incorrect, try again!';
		}
	}

	/**
	 * Logs a user out
	 * 
	 * @return void
	 */
	public function action_logout()
	{
		Auth::instance()->logout();

		return HTTP::redirect('Prime/Account/Login');
	}

} // End Prime Auth Controller