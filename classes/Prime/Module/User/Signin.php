<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module User Signin
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category User
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_User_Signin extends Prime_Module {

	public function params()
	{
		return [
			'General' => [
				[
					'name'    => 'destination_page',
					'caption' => 'Destination page',
					'field'   => 'Prime_Field_Page',
					'default' => '',
				],
				[
					'name'    => 'allow_remember',
					'caption' => 'Allow remember',
					'field'   => 'Prime_Field_Boolean',
					'default' => TRUE,
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/user/signin'
					]
				]
			]
		];
	}

	/**
	 * Render module
	 *
	 * @return View
	 */
	public function render()
	{
		// load the view
		$view = self::load_view('module/user/signin', self::option('template'))
		->set('user', $this->user)
		->bind('data', $data)
		->bind('success', $success)
		->bind('error', $error);

		// initialize array
		$data = [];

		// whether to allow remember me
		$data['has-remember'] = self::option('allow_remember');

		// catch post email and remember
		$data['email'] = Arr::get(Request::current()->post(), 'email', NULL);
		$data['remember'] = Arr::get(Request::current()->post(), 'remember', NULL);

		// catch post requests
		if (Request::current()->method() === HTTP_Request::POST)
		{
			// get post request
			$post = Request::current()->post();

			if (isset($post['logout']))
			{
				// log the user out
				Auth::instance()->logout();
			}

			// try login
			else if (Auth::instance()->login($post['email'], $post['password'], isset($post['remember'])))
			{
				$page = ORM::factory('Prime_Page', intval(self::option('destination_page')));

				if ($page->loaded())
				{
					HTTP::redirect($page->uri());
				}

				$success = TRUE;
			}
			else
			{
				$error = __('E-Mail or password incorrect, try again!');
			}
		}

		// get template
		return $view;
	}

} // End Prime User Signin Module