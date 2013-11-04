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

	public function action_index()
	{
		$this->auto_render = TRUE;

		$this->check_auth();

		$this->view = 'Hello world! my profile';
	}

	public function action_test()
	{

		if ($path = Kohana::find_file('vendor', 'Zend/Loader'))
		{
			ini_set('include_path', ini_get('include_path').PATH_SEPARATOR.dirname(dirname($path)));
		}

		require_once Kohana::find_file('vendor/Zend/Loader', 'Autoloader');

		Zend_Loader_Autoloader::getInstance();

		// set correct analaysis analizer
		Zend_Search_Lucene_Analysis_Analyzer::setDefault(new Zend_Search_Lucene_Analysis_Analyzer_Common_Utf8Num_CaseInsensitive());

/**/
		// set index
		$index = Zend_Search_Lucene::open(APPPATH.'cache/lucene');

		$pages = ORM::factory('Prime_Page')
		->find_all();

		foreach ($pages as $page)
		{
			$hits = $index->find('page:'.$page->id);

			foreach ($hits as $hit)
			{
				$index->delete($hit->id);
			}

			foreach ($page->regions->find_all() as $region)
			{
				$data = json_decode($region->settings, TRUE);

				if (isset($data['content']))
				{
					$doc = Zend_Search_Lucene_Document_Html::loadHTML($data['content']);
					$doc->addField(Zend_Search_Lucene_Field::Keyword('page', $page->id));

					// add document to index
					$index->addDocument($doc);
				}
			}
		}

/**/


		$index = Zend_Search_Lucene::open(APPPATH.'cache/lucene');

		$query = Zend_Search_Lucene_Search_QueryParser::parse('foo');
		$hits = $index->find($query);

		$found = [];

		foreach ($hits as $hit)
		{
			if (in_array($hit->page, $found))
				continue;

			$found[] = $hit->page;

			$page = ORM::factory('Prime_Page', $hit->page);

			echo ' - '.$page->name.' ('.$hit->score.')<br>';
			echo $page->uri().'<br>';

		}
/**/
		exit;
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

		$this->template = View::factory('Prime/Alternative');

		// set template view
		$this->view = View::factory('Prime/Account/Login')
		->bind('message', $message)
		->bind('post', $post);

		// get post data
		$post = $this->request->post();

		// check for post method
		if ($this->request->method() === HTTP_Request::POST)
		{
			// no direct output
			$this->response->body(json_encode(['message' => 'Email or password incorrect.']));

			// try login
			if (Auth::instance()->login($post['email'], $post['password'], isset($post['remember'])))
			{
				return HTTP::redirect('Prime/Page');
			}

			$message = 'E-Mail or password incorrect, try again!';
		}
	}

	public function action_forgotpassword()
	{
		$this->auto_render = TRUE;

		$this->template = View::factory('Prime/Alternative');

		$this->view = View::factory('Prime/Account/ForgotPassword');

		if ($this->request->method() === HTTP_Request::POST)
		{

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