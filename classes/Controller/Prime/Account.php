<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Account Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Account extends Controller_Prime_Template {

	/**
	 * @var boolean Disable the need of authentication
	 */
	public $authentication = FALSE;

	/**
	 * Default page
	 *
	 * @return void
	 */
	public function action_index() {}

	/** 
	 * Checks if user is authenticated with prime role
	 *
	 * @return void
	 */
	public function authenticated()
	{
		if (Auth::instance()->logged_in('prime'))
		{
			// Redirect user to Pages
			HTTP::redirect('Prime/Page');
		}
	}

	/**
	 * Profile page
	 *
	 * @return void
	 */
	public function action_profile()
	{
		// Check for authentication
		$this->check_auth();

		// Disable auto render
		$this->auto_render = FALSE;

		// Setup view
		$view = View::factory('Prime/Account/Profile')
		->bind('item', $item)
		->bind('languages', $languages);

		// Bind user
		$item = $this->user;

		// Bind languages
		$languages = Prime::$languages;

		if ($this->request->method() === HTTP_Request::POST)
		{
			// Get POST values
			$post = $this->request->post();

			// Get parameters that changes the interface
			$lang = $item->language;

			// Set model values
			$item->values($post, array('fullname', 'password', 'language'));

			try
			{
				// Save user model
				$item->save();

				// Update JSON Response
				$json['status']  = TRUE;
				$json['data']    = ($lang !== $item->language);
				$json['message'] = __('Profile was saved.');
			}
			catch (ORM_Validation_Exception $e)
			{
				// Flatten validation array
				$errors = Arr::flatten($e->errors('models'));

				// Update JSON Response
				$json['status']  = FALSE;
				$json['data']    = $errors;
				$json['message'] = __('Profile was not saved.');
			}

			// Set JSON Response body
			$this->response->body(json_encode($json));

			return;
		}

		// Output Response body
		$this->response->body($view);
	}

	/**
	 * Translate string used by javascript
	 *
	 * @return void
	 */
	public function action_translation()
	{
		// Skip auto render
		$this->auto_render = FALSE;

		// Strings array
		$strings = array(
			'save' => __('Save'),
			'ok' => __('Ok'),
			'edit' => __('Edit'),
			'cancel' => __('Cancel'),
			'delete' => __('Delete'),
			'addField' => __('Add field'),
			'editField' => __('Edit field'),
			'clear' => __('Clear'),
			'select' => __('Select'),
			'loading' => __('Loading...'),
			'filter' => __('Filter'),
			'reset' => __('Reset'),
			'validate' => array(
				'required' => __('This field is required.'),
				'remote' => __('Please fix this field.'),
				'email' => __('Please enter a valid email address.'),
				'url' => __('Please enter a valid URL.'),
				'date' => __('Please enter a valid date.'),
				'dateISO' => __('Please enter a valid date (ISO).'),
				'number' => __('Please enter a valid number.'),
				'digits' => __('Please enter only digits.'),
				'creditcard' => __('Please enter a valid credit card number.'),
				'matches' => __('Please enter the same value again.'),
				'maxlength' => __('Please enter no more than {0} characters.'),
				'minlength' => __('Please enter at least {0} characters.'),
				'rangelength' => __('Please enter a value between {0} and {1} characters long.'),
				'range' => __('Please enter a value between {0} and {1}.'),
				'max' => __('Please enter a value less than or equal to {0}.'),
				'min' => __('Please enter a value greater than or equal to {0}')
			)
		);

		// Set response mime type
		$this->response->headers('content-type', 'text/javascript');

		// Response body
		$this->response->body('define([], function() { return '.json_encode($strings).'; });');
	}

	/**
	 * User login page
	 *
	 * @return void
	 */
	public function action_login()
	{
		// Are we already authenticated
		$this->authenticated();

		// Setup standalone template
		$this->template = View::factory('Prime/Alternative');

		// Setup view
		$this->view = View::factory('Prime/Account/Login')
		->bind('message', $message)
		->bind('post', $post);

		// Get post data
		$post = $this->request->post();

		if ($this->request->method() === HTTP_Request::POST)
		{
			if (Auth::instance()->login($post['email'], $post['password'], isset($post['remember'])))
			{
				// Redirect to Pages
				return HTTP::redirect('Prime/Page');
			}

			// Set error message
			$message = __('E-Mail or password incorrect.');
		}
	}

	/**
	 * Prompt forgot password
	 *
	 * @return void
	 */
	public function action_forgotpassword()
	{
		// Are we already authenticated
		$this->authenticated();

		$this->template = View::factory('Prime/Alternative');

		$this->view = View::factory('Prime/Account/ForgotPassword');

		if ($this->request->method() === HTTP_Request::POST)
		{

		}
	}

	/**
	 * User logout page
	 * 
	 * @return void
	 */
	public function action_logout()
	{
		// Are we already authenticated
		$this->authenticated();

		// Logout authenticated user
		Auth::instance()->logout();

		// Redirect to login
		return HTTP::redirect('Prime/Account/Login');
	}

}