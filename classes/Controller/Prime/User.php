<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime User Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_User extends Controller_Prime_Template {

	/**
	 * @var JSON data object
	 */
	public $json = NULL;

	/**
	 * Render fieldset tree
	 * 
	 * @return void
	 */
	public function action_tree()
	{
		// setup view
		$this->view = View::factory('Prime/User/Tree')
		->bind('nodes', $nodes)
		->set('open', json_decode(Arr::get($_COOKIE, 'tree-user', '{}'), TRUE));

		// get nodes
		$nodes = ORM::factory('Role')
		->order_by('name', 'ASC')
		->find_all();
	}

	/**
	 * Default page
	 *
	 * @return void
	 */
	public function action_index()
	{
		// proxy action list
		$this->action_list();
	}

	/**
	 * List available users
	 *
	 * @param id Role
	 * @return void
	 */
	public function action_list()
	{
		// setup view
		$this->view = View::factory('Prime/User/List')
		->bind('role', $role)
		->bind('items', $users);

		// get role
		$role = ORM::factory('Role', $this->request->param('id'));

		// make sure we find role
		if ($this->request->param('id') AND ! $role->loaded())
			throw HTTP_Exception::factory(404, 'User not found.');

		// load users by role or all
		$users = $role->loaded() ? $role->users : ORM::factory('User');

		// order by email (default)
		$users = $users->order_by('email', 'ASC')
		->find_all();
	}

	/**
	 * Create new user
	 *
	 * @return void
	 */
	public function action_create()
	{
		// setup view
		$this->view = View::factory('Prime/User/Fieldset')
		->bind('item', $item)
		->bind('properties', $properties)
		->bind('fields', $fields)
		->set('action', 'Prime/User/Create');

		// get base item
		$item = ORM::factory('User');

		// get user roles
		$roles = $item->roles->find_all();

		// get properties fields
		$fields = ORM::factory('Prime_Field')
		->where('resource_type', '=', 'Role')
		->where('resource_id', '=', 0)
		->order_by('position', 'ASC')
		->find_all();

		// catch http post
		$this->_save($item, $fields);
	}

	/**
	 * Update user
	 *
	 * @return void
	 */
	public function action_edit()
	{
		// setup view
		$this->view = View::factory('Prime/User/Fieldset')
		->bind('item', $item)
		->bind('properties', $properties)
		->bind('fields', $fields);

		// get base item
		$item = ORM::factory('User', $this->request->param('id'));

		// check if item is loaded
		if ( ! $item->loaded())
			throw HTTP_Exception::factory(404, 'User not found.');

		// get user roles
		$roles = $item->roles->find_all();
		$no_roles = count($roles) === 0;

		// get properties fields
		$fields = ORM::factory('Prime_Field')
		->where('resource_type', '=', 'Role')
		->where('resource_id', $no_roles ? 'IS' : 'IN', $no_roles ? NULL : DB::expr('('.implode(',', $roles->as_array('name', 'id')).')'))
		->order_by('position', 'ASC')
		->find_all();

		// extract properties
		$properties = json_decode($item->data, TRUE);

		// set action
		$this->view->action = 'Prime/User/Edit/' . $item->id;

		// catch http post
		$this->_save($item, $fields);
	}

	/**
	 * Remove user
	 *
	 * @return void
	 */
	public function action_remove()
	{
		$this->json = ['status' => TRUE];

		$user = ORM::factory('User', $this->request->param('id'));

		foreach ($user->roles->find_all() as $role)
		{
			$user->remove('roles', $role);
		}

		$user->delete();
	}

	/**
	 * Check for email availability
	 *
	 * @return void
	 */
	public function action_available()
	{
		// get item by email
		$item = ORM::factory('User', ['email' => $this->request->query('value')]);

		// response
		$this->json = [
			'valid' => ! $item->loaded(),
			'message' => __('This email address is already in use.')
		];
	}

	/**
	 * Create role in tree
	 *
	 * @return void
	 */
	public function action_create_role()
	{
		$role = ORM::factory('Role');
		$role->name = $this->request->post('name');

		try 
		{
			$role->save();
		}
		catch (ORM_Validation_Exception $e)
		{
			$this->json = [
				'message' => UTF8::ucfirst(implode(',', $e->errors('model')))
			];
		}

		// display tree
		$this->action_tree();
	}

	/**
	 * Rename role
	 *
	 * @return void
	 */
	public function action_rename_role()
	{
		$role = ORM::factory('Role', $this->request->param('id'));
		$role->name = $this->request->post('name');
		$role->save();
	}

	/**
	 * Remove role
	 *
	 * @return void
	 */
	public function action_remove_role()
	{
		$page = ORM::factory('Role', $this->request->param('id'));
		$page->delete();
	}

	/**
	 * Catch HTTP Post data and save user
	 *
	 * @return void
	 */
	private function _save(ORM $item = NULL, $fields = NULL)
	{
		// catch the http post
		if ($this->request->method() === HTTP_Request::POST)
		{
			// get http post
			$post = $this->request->post();

			// setup response json
			$this->json = [
				'success' => FALSE,
				'data' => NULL,
				'message' => NULL
			];

			// set expected fields
			$expected = ['fullname', 'email', 'password'];

			// set properties field
			$properties = [];

			// loop through properties fields
			foreach ($fields as $field)
			{
				$properties[$field->name] = $field->field->prepare_value(Arr::get($post, $field->name, NULL));
			}

			try
			{
				if ($item->loaded() AND empty($post['password']))
				{
					unset($post['password'], $post['password_confirm']);
				}

				// validation for passwords
				$password_validation = Model_User::get_password_validation($post);

				// set values to model
				$item->values($post, $expected);

				// set properties
				$item->data = json_encode($properties);

				// save model
				$item->save($password_validation);

				// set successful
				$this->json['success'] = TRUE;
				$this->json['data'] = $item->as_array();
				$this->json['message'] = __('User has been created.');
			}
			catch (ORM_Validation_Exception $e)
			{
				// combine external validation messages with errors
				$errors = $e->errors('models');
				$external = Arr::get($errors, '_external', []);
				unset($errors['_external']);

				// set errors and message
				$this->json['data'] = Arr::merge($errors, $external);
				$this->json['message'] = __('User could not be created.');
			}
		}
	}

	/**
	 * Overload after controller execution method
	 *
	 * @return parent::after
	 */
	public function after()
	{
		// check for asyncronous request
		if ($this->request->is_ajax() OR ! $this->request->is_initial())
		{
			// disable auto render
			$this->auto_render = FALSE;

			// render the view
			return $this->response->body(isset($this->json) ? json_encode($this->json) : $this->view->render());
		}
		else
		{
			// always set tree
			$this->template->left = Request::factory('Prime/User/Tree')
			->execute();
		}

		return parent::after();
	}

} // End Prime User