<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Frontend Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Frontend extends Controller {

	/**
	 * Process action
	 *
	 * @return void
	 */
	public function action_process()
	{
		$auth = Auth::instance();

		// get uri
		$uri = $this->request->param('query');

		// set cache engine
		$cache = isset(Cache::$instances['apc']) ? Cache::instance('apc') : NULL;

		// cache key
		Prime::$cache = 'prime://'.$uri;

		// make sure we dont cache requests not needing it
		Prime::$cache = (
			   isset($_GET['nocache'])
			OR $cache === NULL
			OR $auth->logged_in()
			OR $this->request->method() !== HTTP_Request::GET
			OR Kohana::$environment === Kohana::DEVELOPMENT
		) ? FALSE : Prime::$cache;

		// load cached page
		if (Prime::$cache !== FALSE AND ($html = $cache->get(Prime::$cache, NULL)) !== NULL)
		{
			return $this->response->body($html);
		}

		// get selected page
		$page = Prime::selected($this->request);

		// page loaded
		if ( ! $page->loaded() OR ($page->disabled AND ! Prime::$design_mode))
		{
			throw HTTP_Exception::factory(404, 'Not found');
		}

		// redirects
		if ($page->redirect)
		{
			// forward user
			HTTP::redirect($page->redirect_url);
		}

		// only accept specific protocols
		if (($page->protocol === 'http'  AND $this->request->protocol() !== 'HTTP')
		OR ($page->protocol === 'https' AND $this->request->protocol() !== 'HTTPS'))
		{
			throw new Kohana_Exception('The :protocol protocol is required. You are using :using', array(
				':protocol' => $page->protocol,
				':using'    => $this->request->protocol()
			));
		}

		// enforce https protocol
		if ($page->protocol === 'https_enforced' AND $this->request->protocol() !== 'https')
		{
			return HTTP::redirect($this->request->url('https'));
		}

		// check methods
		if ($page->method !== 'all' AND ! in_array($this->request->method(), explode(',', strtoupper($page->method))))
		{
			throw new Kohana_Exception('The :method method method is not allowed.', array(
				':method' => $this->request->method()
			));
		}

		// check if template was found
		if ( ! Kohana::find_file('views', 'template/'.$page->template))
		{
			throw new Kohana_Exception('Did not find template :template', array(':template' => $page->template));
		}

		// disallow ajax requests
		if ( ! $page->ajax AND $this->request->is_ajax())
		{
			throw new Kohana_Exception('AJAX Requests are not allowed.');
		}

		// set language
		I18n::lang($page->language);

		// check for internal or ajax request with region query string
		if (( ! $this->request->is_external() OR $this->request->is_ajax()) AND intval($this->request->query('region')) > 0)
		{
			// fetch region
			$region = ORM::factory('Prime_Region', $this->request->query('region'));

			// check if it was loaded
			if ( ! $region->loaded())
			{
				throw new Kohana_Exception('Did not find region :region', array(':region' => $this->request->query('region')));
			}

			// setup region template
			$this->template = View::factory('Prime/Region/Item')
			->set('item', $region->module());
		}
		else
		{
			// setup template
			$this->template = View::factory('template/'.$page->template)

			// bind regions
			->bind('region', $regions);

			// get page region class
			$regions = Prime::$region;

			// loop through regions
			foreach ($page->regions->order_by('position', 'ASC')->find_all() as $region)
			{
			 	$regions->attach($region);
			}
		}

		// set global view parameters
		View::set_global('page', $page);
		View::set_global('prime', Prime_Frontend::instance());
		View::set_global('website', Prime::$config->website);
		View::set_global('user', $auth->get_user());

		// check for cache flag
		if (Prime::$cache !== FALSE)
		{
			$cache->set(Prime::$cache, $this->template->render(), 30);
		}

		// respond template
		$this->response->body($this->template->render());
	}

	public function after()
	{
		// force internet explorer to latest version
		$this->response->headers('x-ua-compatible', 'ie=edge, chrome=1');

		return parent::after();
	}

} // End Prime Frontend