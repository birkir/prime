<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Install Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Install extends Controller {

	/**
	 * Before action execution
	 *
	 * @return void
	 */
	public function before()
	{
		// call parent before
		parent::before();

		// check if no file has been generated
		if (file_exists(APPPATH.'install.prime'))
		{
			HTTP::redirect('Prime');
			exit;
		}

		// default template
		$this->template = View::factory('Prime/Alternative');

		// setup default view
		$this->view = NULL;
	}

	/**
	 * Show a welcome message to the user
	 *
	 * @return void
	 */
	public function action_index()
	{
		$this->view = View::factory('Prime/Install/Welcome');
	}

	/**
	 * Show screen with permissions status
	 *
	 * @return void
	 */
	public function action_permissions()
	{
		// directories that needs to be writable
		$this->view = View::factory('Prime/Install/Permissions')
		->bind('writable', $writable);

		// directories needed chmodding
		$writable = [
			'app'    => is_writable(APPPATH),
			'config' => is_writable(APPPATH.'config'),
			'logs'   => is_writable(APPPATH.'logs'),
			'cache'  => is_writable(APPPATH.'cache')
		];
	}

	/**
	 * Setup database connection
	 *
	 * @return void
	 */
	public function action_database()
	{
		$this->view = View::factory('Prime/Install/Database')
		->bind('post', $post)
		->bind('error', $error)
		->bind('config', $config);

		// get post data
		$post = $this->request->post();

		// process post requests
		if ($this->request->method() === HTTP_Request::POST)
		{
			// database connection
			try
			{
				$db = new mysqli(Arr::get($post, 'hostname'), Arr::get($post, 'username'), Arr::get($post, 'password'));
			}
			catch (ErrorException $e)
			{
				$error = $e->getMessage();
				return;
			}

			// try to select database
			if ( ! $db->select_db(Arr::get($post, 'database', FALSE)))
			{
				if (Arr::get($post, 'create', FALSE))
				{
					if ( ! $db->query('CREATE DATABASE '.Arr::get($post, 'database')))
					{
						$error = 'Could not create database';
						return;
					}
					else
					{
						$db->select_db(Arr::get($post, 'database'));
					}
				}
				else
				{
					$error = 'Database not found';
					return;
				}
			}
			else
			{
				$query = $db->query('SHOW TABLES');

				if (count($query->num_rows) > 0 AND Arr::get($post, 'confirm', FALSE) === FALSE)
				{
					$error = 'Database not empty, are you sure you want to continue?';
					return;
				}
			}

			if ( ! file_exists(MODPATH.'prime/schema/prime-mysql.sql'))
			{
				$error = 'Could not find sql script.';
				return;
			}

			if ( ! $db->multi_query(file_get_contents(MODPATH.'prime/schema/prime-mysql.sql')))
			{
				$error = $db->error;
				return;
			}

			// setup database config
			$database = array(
				'default' => array(
					'type' => function_exists('mysqli_connect') ? 'MySQLi' : 'MySQL',
					'connection' => array(
						'hostname' => Arr::get($post, 'hostname'),
						'database' => Arr::get($post, 'database'),
						'username' => Arr::get($post, 'username'),
						'password' => Arr::get($post, 'password'),
						'persistent' => FALSE,
					),
					'table_prefix' => '',
					'charset' => 'utf8',
					'caching' => FALSE
				)
			);

			// write database config
			$this->write_config('database', $database);

			// great, lets create user
			HTTP::redirect('Prime/Install/User');
		}
	}

	/**
	 * Create administrator user
	 *
	 * @return void
	 */
	public function action_user()
	{
		// if (intval(ORM::factory('User')->count_all()) > 0)
		//	return HTTP::redirect('Prime');

		// setup view
		$this->view = View::factory('Prime/Install/User')
		->bind('error', $error)
		->bind('config', $config);

		// catch http post
		if ($this->request->method() === HTTP_Request::POST)
		{
			// post data
			$post = $this->request->post();

			// setup auth config array
			$auth = array(
				'driver' => 'ORM',
				'hash_method' => 'sha256',
				'hash_key' => sha1(implode('.', $this->request->post()))
			);

			// write the auth configuration
			$this->write_config('auth', $auth);

			try
			{
				// create user
				$user = ORM::factory('User')
				->values($this->request->post())
				->save();

				// add roles to user
				$user->add('roles', ORM::factory('Role', ['name' => 'login']));
				$user->add('roles', ORM::factory('Role', ['name' => 'prime']));

				// create default page
				$page = ORM::factory('Prime_Page')
				->values([
					'name' => 'Frontpage',
					'slug' => 'frontpage',
					'template' => 'default',
					'description' => '',
					'keywords' => '',
					'protocol' => 'both',
					'method' => 'get,post',
					'position' => 0
				])
				->save();
			}
			catch (ORM_Validation_Exception $e)
			{
				// throw errors finer...
				$error = Debug::vars($e->errors());
				return;
			}

			// write prime configure
			$prime = array(
				'website' => array(
					'host'  => Arr::get($post, 'hostname', Arr::get($_SERVER, 'HTTP_HOST')),
					'name' => Arr::get($post, 'name', 'Default website'),
				),
				'default_page_id' => isset($page) ? $page->id : 0
			);

			// set prime hash key
			$prime['hashkey'] = sha1(implode('.', $prime['website']));

			// write prime config
			$this->write_config('prime', $prime);

			// cant access install anymore
			touch(APPPATH.'install.prime');

			// redirect to login
			HTTP::redirect('Prime');
		}
	}

	/**
	 * Write config files
	 *
	 * @param  string Filename
	 * @param  array  Configuration array
	 * @return boolean
	 */
	public function write_config($name, $arr)
	{
		// set security header and export array
		$content = Kohana::FILE_SECURITY.PHP_EOL.PHP_EOL.'return '.var_export($arr, TRUE).';';

		// write to file
		$fh = fopen(APPPATH.'config/'.$name.'.php', 'w');
		fwrite($fh, $content);
		fclose($fh);

		return TRUE;
	}

	/**
	 * Render view
	 *
	 * @return void
	 */
	public function after()
	{
		$this->template->view = $this->view;

		$this->response->body($this->template->render());

		return parent::after();
	}

} // End Prime Install