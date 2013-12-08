<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module User Forgot
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category User
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_User_Forgot extends Prime_Module {

	/**
	 * - Destination page
	 * - Catpcha
	 * - Username or Email or both allowed
	 * - Email new password or allow to enter new password from email
	 */

	/**
	 * @var string Encryption key
	 */
	protected $_encrypt_key = '8398c52679ee9e09a0c5de46becf539f47a024e1';

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
					'name'    => 'method',
					'caption' => 'Method',
					'field'   => 'Prime_Field_Choose',
					'default' => 'type_password',
					'options' => [
						'items' => [
							'type_password'     => __('User types new password'),
							'generate_password' => __('Prime generates password')
						]
					]
				],
				[
					'name'    => 'login_page',
					'caption' => 'Login page',
					'field'   => 'Prime_Field_Page',
					'default' => NULL
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
						'directory' => 'module/user/forgot'
					]
				]
			]
		];
	}

	/**
	 * Check route
	 *
	 * @return boolean
	 */
	public function route($uri = NULL)
	{
		// create encrypt instance
		$encrypt = new Encrypt($this->_encrypt_key, MCRYPT_MODE_NOFB,MCRYPT_RIJNDAEL_128);

		if ($encrypt->decode($uri))
			return TRUE;

		return FALSE;
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
		$encrypt = new Encrypt($this->_encrypt_key, MCRYPT_MODE_NOFB,MCRYPT_RIJNDAEL_128);

		$view = self::load_view('module/user/forgot', 'template');

		$view->captcha = $this->captcha();

		$view->bind('status', $status);
		$view->bind('error', $error);
		$view->bind('post', $post);
		$view->bind('pwd', $pwd);
		$view->bind('login_page', $login_page);

		$post = Request::current()->post();

		$login_page = ORM::factory('Prime_Page', $this->option('login_page'))->uri();

		if ( ! empty(Prime::$page_overload_uri))
		{
			if ($data = $encrypt->decode(Prime::$page_overload_uri))
			{
				// extract secret values
				list($timestamp, $user_id) = explode(',', $data);

				$user = ORM::factory('User', $user_id);

				if ((time() > intval($timestamp) + 86400) OR  ! $user->loaded())
				{
					$error = 'This confirmation link has expired or is invalid, please try again.';
					return $view;
				}

				if ($this->option('method') === 'generate_password')
				{
					$pwd = substr(str_shuffle('abcdefghjkmnpqrstuvxyz23456789'), 0, 8);
				}

				if ($this->option('method') === 'type_password' AND ! empty($post['password']))
				{
					$pwd = Arr::get($post, 'password');
				}

				if ( ! empty($pwd))
				{
					$user->password = $pwd;
					$user->save();
					$status = 3;
				}
				else
				{
					$status = 2;
				}
			}
		}
		else if (Request::current()->method() === HTTP_Request::POST)
		{

			if ( ! empty($post['email']))
			{

				if (FALSE) //$this->option('captcha', TRUE))
				{
					$output = Request::factory('http://www.google.com/recaptcha/api/verify')
					->query('privatekey', $this->_private_key)
					->query('remoteip', Request::$client_ip)
					->query('challenge', Arr::get($post, 'recaptcha_challenge_field', NULL))
					->query('response', Arr::get($post, 'recaptcha_response_field', NULL))
					->execute()
					->body();

					$response = explode("\n", $output);

					if ($response[0] !== 'true')
					{
						$error = 'Incorrect captcha answer, please try again.';
						return $view;
					}
				}

				$user = ORM::factory('User')
				->where('email', '=', Arr::get($post, 'email', NULL))
				->find();

				if ( ! $user->loaded())
				{
					$error = __('User account associated with this email address was not found.');
					return $view;
				}

				// create encrypt instance
				$secret = $encrypt->encode(time().','.$user->id);

				// create HTML email template
				$email = __('Hello,<br>'
				       . 'We\'ve received an password reset request for user account associated with this email address.<br>'
				       . 'To initiate the process, please click the following link:<br><br>'
				       . ':link<br><br>'
				       . 'If clicking the link above does not work, copy and paste the URL in<br>'
				       . 'a new browser window instead. The URL will expire in 24 hours for security reasons.<br><br>'
				       . 'Please disgard this message if you did not make a password reset request.<br><br>'
				       . 'This is an automatically generated message. Replies are not monitored or answered.<br><br>'
				       . 'Sincerely,<br>The Prime CMS', array(
				       		':link' => '&lt;'.URL::base(Request::current()).Request::current()->uri().'/'.$secret.'&gt;'
				       	 ));

				Prime::email(__('Password Assistance'), $email, 'prime@prime-dev.forritun.org', $user->email);

				// set status to step 1
				$status = 1;
			}
		}

		return $view;
	}

} // End Prime User Forgot Module