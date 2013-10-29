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

	public function before()
	{
		parent::before();

		// load prime configure
		$prime = Kohana::$config->load('prime');

		// check if no file has been generated
		if ( ! empty($prime->as_array()))
		{
			HTTP::redirect('Prime');
			exit;
		}

		// default template
		$this->template = View::factory('Prime/Alternative');

		$this->view = NULL;
	}

	public function action_index()
	{
		// setup view
		$this->view = View::factory('Prime/Install/Welcome');
	}

	public function action_permissions()
	{
		// directories that needs to be writable
		$this->view = View::factory('Prime/Install/Permissions')
		->bind('writable', $writable);

		$writable = [
			'app'    => is_writable(APPPATH),
			'config' => is_writable(APPPATH.'config'),
			'logs'   => is_writable(APPPATH.'logs'),
			'cache'  => is_writable(APPPATH.'cache')
		];
	}

	public function action_database()
	{
		$this->view = View::factory('Prime/Install/Database')
		->bind('post', $post)
		->bind('error', $error)
		->bind('config', $config);

		$post = $this->request->post();

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

			$config = array(
				'default' => array(
					'type' => 'MySQL',
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

			$config = Kohana::FILE_SECURITY.PHP_EOL.PHP_EOL.'return '.var_export($config, TRUE).';';

			if (is_writable(APPPATH.'config/database.php'))
			{
				$fh = fopen(APPPATH.'config/database.php', 'w');
				fwrite($fh, $config);
				fclose($fh);

				HTTP::redirect('Prime/Install/User');
			}
		}
	}

	public function action_user()
	{
		$count = intval(ORM::factory('User')->count_all());

		if ($count === 0)
		{
			$this->view = View::factory('Prime/Install/User')
			->bind('error', $error)
			->bind('config', $config);

			if ($this->request->method() === HTTP_Request::POST)
			{
				try {
					ORM::factory('User')
					->values($this->request->post())
					->save();
				}
				catch (ORM_Validation_Exception $e)
				{
					$error = Debug::vars($e->errors());
				}

				// write prime configure
				$config = array(
					'website' => array(
						'host'  => Arr::get($post, 'hostname', Arr::get($_SERVER, 'HTTP_HOST')),
						'name' => Arr::get($post, 'name', 'Default website'),
					),
					'default_page_id' => 0
				);

				$config['hashkey'] = sha1(implode('.', $config['website']));

				$config = Kohana::FILE_SECURITY.PHP_EOL.PHP_EOL.'return '.var_export($config, TRUE).';';

				if (is_writable(APPPATH.'config/prime.php'))
				{
					$fh = fopen(APPPATH.'config/prime.php', 'w');
					fwrite($fh, $config);
					fclose($fh);

					HTTP::redirect('Prime');
				}
			}
		}
	}

	public function after()
	{
		$this->template->view = $this->view;

		$this->response->body($this->template->render());

		return parent::after();
	}

}