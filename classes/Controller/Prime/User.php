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
	 * @var array JSON Response array
	 */
	protected $json = NULL;

	/**
	 * Default page
	 *
	 * @return void
	 */
	public function action_index()
	{
		// Display list of Users
		$this->action_list();
	}

	/**
	 * Render fieldset tree
	 * 
	 * @return void
	 */
	public function action_tree()
	{
		// Setup tree view
		$this->view = View::factory('Prime/User/Tree')
		->bind('nodes', $nodes)
		->set('open', json_decode(Arr::get($_COOKIE, 'tree-user', '{}'), TRUE));

		// Get available Roles records
		$nodes = ORM::factory('Role')
		->order_by('name', 'ASC')
		->find_all();
	}

	/**
	 * List available users in group.
	 *
	 * @return void
	 */
	public function action_list()
	{
		// Setup User list view
		$this->view = View::factory('Prime/User/List')
		->bind('role', $role)
		->bind('items', $users);

		// Find selected Role model
		$role = ORM::factory('Role', $this->request->param('id'));

		// Make sure we find the Role while defined
		if ($this->request->param('id') AND ! $role->loaded())
		{
			throw HTTP_Exception::factory(404, 'User not found.');
		}

		// Load Role Users or all Users
		$users = $role->loaded() ? $role->users : ORM::factory('User');

		// Order by email address
		$users = $users->order_by('email', 'ASC')
		->find_all();
	}

	/**
	 * List all users in database
	 *
	 * @return void
	 */
	public function action_select_list()
	{
		// load fieldset
		$users = ORM::factory('User');

		// setup view
		$this->view = View::factory('Prime/User/SelectList')
		->set('users', $users);

		// Disable auto render
		$this->auto_render = FALSE;

		// Response body
		$this->response->body($this->view);
	}

	/**
	 * Display user fieldset and process the post data
	 * when available.
	 *
	 * @return void
	 */
	public function action_create()
	{
		// Factory an user account ORM
		$item = ORM::factory('User');

		// Let fieldset function handle the rest
		$this->fieldset($item);

		// Set form submit action
		$this->view->action = 'Prime/User/Create';

		// Set selected Role
		$this->view->role = ORM::factory('Role', $this->request->param('id'));
	}

	/**
	 * Display user account fieldset and process the post data
	 * when available.
	 *
	 * @return void
	 */
	public function action_edit()
	{
		// Get user account ORM record
		$item = ORM::factory('User', $this->request->param('id'));

		// Make sure the user account was found
		if ( ! $item->loaded())
		{
			throw HTTP_Exception::factory(404, 'User not found.');
		}

		// Let fieldset function handle the rest
		$this->fieldset($item);

		// Set form submit action
		$this->view->action = 'Prime/User/Edit/'.$item->id;
	}

	/**
	 * Setup fieldset view and bind needed parameters to it.
	 * Attempt to save ORM model on POST method.
	 *
	 * @param  ORM   $item   User ORM to save
	 * @return void
	 */
	private function fieldset(ORM $item = NULL)
	{
		// Setup view
		$this->view = View::factory('Prime/User/Fieldset')

		// Bind parameters
		->bind('item',       $item)
		->bind('properties', $properties)
		->bind('roles',      $roles)
		->bind('fields',     $fields)
		->bind('errors',     $errors);

		// Find all available Roles
		$roles = ORM::factory('Role')->find_all();

		// Get user account Roles
		$u_roles = $item->loaded()
		         ? $item->roles->find_all()->as_array('name', 'id')
		         : array(0);

		// Get properties for User Roles
		$fields = ORM::factory('Prime_Field')
		->where('resource_type', '=', 'Role')
		->where('resource_id', 'IN', DB::expr('('.((count($u_roles) > 0) ? implode(',', $u_roles) : '0').')'))
		->order_by('position', 'ASC')
		->find_all();

		// Extract properties from User model
		$properties = json_decode($item->data, TRUE);

		// Process POST data
		if ($this->request->method() === HTTP_Request::POST)
		{
			// Store POST data array
			$post = $this->request->post();

			// Create JSON Response
			$this->json = array(
				'status'  => FALSE,
				'data'    => NULL,
				'message' => NULL
			);

			try
			{
				if ($item->loaded() AND empty($post['password']))
				{
					// Do not save Password while undefined
					unset($post['password'], $post['password_confirm']);
				}

				// Initialize with Password validation
				$validation = Model_User::get_password_validation($post);

				foreach ($fields as $field)
				{
					// Prepare Field value for saving
					$properties[$field->name] = $field->field->save(Arr::get($post, $field->name, NULL));

					// Append field rules to Validation
					$field->field->validation($validation);
				}

				// Copy the validation object with new data
				$validation = $validation->copy(Arr::merge($post, $properties ? $properties : array()));

				// Append values to User Model
				$item->values($post, array('fullname', 'email', 'password'));

				// Set User properties
				$item->data = json_encode($properties);

				// Save User model
				$item->save($validation);

				foreach ($item->roles->find_all() AS $role)
				{
					// Remove previous Roles
					$item->remove('roles', $role);
				}

				foreach (Arr::get($post, 'roles', array()) AS $role)
				{
					// Add defined Roles
					$item->add('roles', ORM::factory('Role', $role));
				}

				// Update JSON Response
				$this->json = array(
					'status'  => TRUE,
					'data'    => $item->as_array(),
					'message' => __('User was saved.')
				);
			}
			catch (ORM_Validation_Exception $e)
			{
				// Flatten validation array
				$errors = Arr::flatten($e->errors('models'));

				// Update JSON Response
				$this->json['status'] = FALSE;
				$this->json['data'] = $errors;
				$this->json['message'] = __('User was not saved.');
			}
		}
	}

	/**
	 * Remove User and all relations to Roles
	 *
	 * @return void
	 */
	public function action_remove()
	{
		// Create JSON Response
		$this->json = array(
			'status'  => TRUE,
			'message' => __('User was deleted.')
		);

		// Find defined User model
		$user = ORM::factory('User', $this->request->param('id'));

		if ( ! $user->loaded())
		{
			// Update JSON Response
			$this->json = array(
				'status'  => FALSE,
				'message' => __('User was not found.')
			);
		}

		foreach ($user->roles->find_all() as $role)
		{
			// Remove relation to Role
			$user->remove('roles', $role);
		}

		// Finally delete the User
		$user->delete();
	}

	/**
	 * Find User model by email address
	 *
	 * @return void
	 */
	public function action_available()
	{
		// Get User by email address
		$item = ORM::factory('User')
		->where('email', '=', $this->request->query('value'));

		if (intval($this->request->param('id')) > 0)
		{
			// Dont check the current email
			$item->where('id', '!=', intval($this->request->param('id')));
		}

		// Find User
		$item = $item->find();

		// Create JSON Response
		$this->json = array(
			'status'  => ! $item->loaded(),
			'message' => __('This email address is already in use.')
		);
	}


	/**
	 * -------------------------------------------------------------
	 *                             ROLES
	 * =============================================================
	 */


	/**
	 * Create new Role model
	 *
	 * @return void
	 */
	public function action_role_create()
	{
		// Factory an Role model
		$role = ORM::factory('Role');

		// Set given Role name
		$role->name = $this->request->post('name');

		try 
		{
			try
			{
				// Save and validate Role
				$role->save();
			}
			catch (Database_Exception $e)
			{
				// Update JSON Response
				$this->json = array(
					'status'  => FALSE,
					'message' => __($e->getMessage())
				);
			}
		}
		catch (ORM_Validation_Exception $e)
		{
			// Update JSON Response
			$this->json = array(
				'status'  => FALSE,
				'message' => UTF8::ucfirst(implode(',', $e->errors('model')))
			);
		}

		// Display Roles tree
		$this->action_tree();
	}

	/**
	 * Rename role
	 *
	 * @return void
	 */
	public function action_role_rename()
	{
		try 
		{
			// Find Role and rename
			$role = ORM::factory('Role', $this->request->param('id'))
			->values($this->request->post())
			->save();
		}
		catch (ORM_Validation_Exception $e)
		{
			// Update JSON Response
			$this->json = array(
				'status'  => FALSE,
				'message' => UTF8::ucfirst(implode(',', $e->errors('model')))
			);
		}
	}

	/**
	 * Remove role
	 *
	 * @return void
	 */
	public function action_role_delete()
	{
		// Find Role and delete
		$role = ORM::factory('Role', $this->request->param('id'))->delete();

		// Display Roles Tree
		$this->action_tree();
	}

	/**
	 * Overload after controller execution method
	 *
	 * @return parent
	 */
	public function after()
	{
		// Check for asyncronous request
		if ($this->request->is_ajax() OR ! $this->request->is_initial())
		{
			// Disable auto render
			$this->auto_render = FALSE;

			// Render the view
			return $this->response->body(isset($this->json) ? json_encode($this->json) : $this->view->render());
		}
		else
		{
			// Always display tree view
			$this->template->left = Request::factory('Prime/User/Tree')
			->execute();
		}

		// Call parent after
		return parent::after();
	}

}