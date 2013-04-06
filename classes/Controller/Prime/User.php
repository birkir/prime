<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime User Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_User extends Controller_Prime_Core {

	/**
	 * Initial user action proxy to list
	 * @return void
	 */
	public function action_index()
	{
		// call list action
		return $this->action_list();
	}

	/**
	 * List users in database
	 * @return void
	 */
	public function action_list()
	{
		// set list view
		$this->view = View::factory('Prime/User/List')
		->bind('items', $items);

		// find all items
		$items = ORM::factory('Prime_User')
		->order_by('username', 'ASC')
		->find_all();
	}

	public function action_create()
	{
		$this->modal = FALSE;
	}

	public function action_edit()
	{
		$this->auto_render = FALSE;
	}

	public function action_remove()
	{
		$this->modal = FALSE;
	}

	public function action_confirm()
	{
		$this->auto_render = FALSE;

		$code = $this->request->param('id');

		$encrypt = Encrypt::instance('prime');
		$code = $encrypt->decode($code);

		if (empty($code))
		{
			// log
			Kohana::$log->add(Log::WARNING, 'User tried invalid confirmation code [:code] (ip :ip)', array(
				':code' => $this->request->param('id'),
				':ip'   => Request::$client_ip
			));

			// error message
			return print('Not valid confirmation code.');
		}

		$obj = json_decode($code);

		$user = ORM::factory('Prime_User', $obj->id);

		if ( ! $user->loaded())
			throw new Kohana_Exception('User was not found.');

		// log
		Kohana::$log->add(Log::NOTICE, 'User [:user] changed his email from [:from] to [:to]', array(
			':user' => $user->username,
			':from' => $user->email,
			':to' => $obj->email
		));

		$user->email = $obj->email;
		$user->save();

		echo 'Email address updated. You my close this window.';
	}

	public function action_profile()
	{
		// disable template auto render
		$this->auto_render = FALSE;

		// set view
		$view = View::factory('Prime/User/Profile')
		->bind('user', $user);

		// load user
		$user = $this->user;

		// on post method
		if ($this->request->method() === HTTP_Request::POST)
		{
			try
			{
				// update user through auth
				$user->update_user($_POST, array(
					'name',
					'password',
					'password_confirm'
				));

				// log
				Kohana::$log->add(Log::INFO, 'User [:user] updated his profile', array(':user' => $user->username));

				// send confirmation link change email
				if ($user->email !== Arr::get($_POST, 'email'))
				{
					$encrypt = Encrypt::instance('prime');
					$code = $encrypt->encode(json_encode(array('id' => $user->id, 'email' => Arr::get($_POST, 'email'))));

					$html  = 'Hi, '.$user->name.'.<br><br>';
					$html .= 'Did you just change your email address? If so, please click <a href="'.URL::site('prime/user/confirm/'.$code).'">this link</a> to confirm these changes.<br><br>';
					$html .= 'Best regards,<br>&nbsp;&nbsp;Prime CMS';

					Prime::email(Arr::get($_POST, 'email'), 'Prime CMS - Confirm email address', $html);
				}

			} catch (Validation_Exception $e) {

			}
		}

		// return view
		$this->response->body($view);
	}

	public function action_login()
	{
		// set modal
		$this->modal = TRUE;

		// user login view
		$view = View::factory('Prime/User/Login');

		// extract post array
		$post = $this->request->post();

		// if post values
		if ($this->request->method() === HTTP_Request::POST)
		{
			// if successfully logged in
			if ($this->auth->login(Arr::get($post, 'username'), Arr::get($post, 'password'), (bool) Arr::get($post, 'remember', FALSE)))
			{
				// log
				Kohana::$log->add(Log::INFO, 'User [:user] logged in', array(':user' => $this->auth->get_user()->username));

				// redirect to page
				HTTP::redirect('prime/page');
			}
		}

		$this->view = $view;
	}

	public function action_logout()
	{
		// check for logged in
		if ($this->auth->logged_in())
		{
			// log
			Kohana::$log->add(Log::INFO, 'User [:user] logged out', array(':user' => $this->auth->get_user()->username));

			// log out
			$this->auth->logout();
		}

		// redirect to login
		HTTP::redirect('prime/user/login');
	}

} // End User