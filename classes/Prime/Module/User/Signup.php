<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module User Signup
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category User
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_User_Signup extends Prime_Module {

	/**
	 * Captcha,
	 * Roles available
	 */

	// reCAPTCHA keys
	protected $_public_key  = '6Ldy0ekSAAAAAFnQtmGNWgpLBuA-pIUSe11NAkCh';
	protected $_private_key = '6Ldy0ekSAAAAAJrasJ3RFyAIfMX5oPmfOolabKON';

	/**
	 * Params for configuration 
	 *
	 * @return array
	 */
	public function params()
	{
		return [
			'General' => [
				[
					'name'    => 'return_page',
					'caption' => 'Return page',
					'field'   => 'Prime_Field_Page',
					'default' => ''
				],
				[
					'name'    => 'allowed_roles',
					'caption' => 'Allowed roles (comma seperated)',
					'field'   => 'Prime_Field_String',
					'default' => 'login'
				],
				[
					'name'    => 'captcha',
					'caption' => 'Enable captcha',
					'field'   => 'Prime_Field_Boolean',
					'default' => TRUE
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/user/signup'
					]
				]
			]
		];
	}

	public function captcha()
	{
		$server = (stripos(Request::current()->protocol(), 'https') ? 'https' : 'http').'://www.google.com/recaptcha/api';

		$view = '<script type="text/javascript">var RecaptchaOptions = { theme : \'white\' };</script>'
		      . '<script type="text/javascript" src="'.$server.'/challenge?k='.$this->_public_key.'"></script>';

		return $this->option('captcha', TRUE) ? $view : NULL;
	}

	/**
	 * Render module
	 *
	 * @return View
	 */
	public function render()
	{
		$view = self::load_view('module/user/signup', 'template');

		$view->captcha = $this->captcha();
		$view->bind('status', $status);
		$view->bind('errors', $errors);
		$view->bind('post', $post);
		$view->bind('roles', $roles);
		$view->bind('return_url', $return_url);

		$return_url = ORM::factory('Prime_Page', $this->option('return_page', 0))->uri();

		$post = Request::current()->post();

		$roles = explode(',', $this->option('allowed_roles'));
		foreach ($roles as $i => $_role) $roles[$i] = trim($_role);

		if (Request::current()->method() === HTTP_Request::POST)
		{
			try
			{
				// create user
				$user = ORM::factory('User')
				->values($post)
				->save();

				foreach (Arr::get($post, 'roles', array()) as $role)
				{
					// Get role
					$role = ORM::factory('Role', array('name' => $role));

					if (in_array($role->name, $roles))
					{
						// Add role to created User
						$user->add('roles', $role);
					}
				}

				if ( ! empty($return_url))
				{
					// Redirect to Return_URL
					header('Location: '.$return_url);
					exit;
				}

				$status = 1;
			}
			catch (ORM_Validation_Exception $e)
			{
				$errors = $e->errors('model');
				$status = 0;
			}
		}

		return $view;
	}

}