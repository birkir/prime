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
		// Create authentication instance
		$auth = Auth::instance();

		// Get uri
		$uri = $this->request->param('query');

		// Set cache engine
		$cache = isset(Cache::$instances['apc']) ? Cache::instance('apc') : NULL;

		// Cache key
		Prime::$cache = 'prime://'.$uri;

		// Make sure we dont cache requests not needing it
		Prime::$cache = (isset($_GET['nocache']) OR $cache === NULL OR $auth->logged_in() OR $this->request->method() !== HTTP_Request::GET)
		              ? FALSE
		              : Prime::$cache;

		// Load cached page
		if (Prime::$cache !== FALSE AND ($html = $cache->get(Prime::$cache, NULL)) !== NULL)
		{
			return $this->response->body($html);
		}

		// Get selected page
		$page = Prime::selected($this->request);

		if ( ! $page->loaded() OR ($page->disabled AND ! Prime::$design_mode))
		{
			throw HTTP_Exception::factory(404, 'Not found');
		}

		if ($page->redirect)
		{
			// Redirect client to Page redirect URL
			HTTP::redirect($page->redirect_url);
		}

		if (($page->protocol === 'http'  AND $this->request->protocol() !== 'HTTP')
		OR ($page->protocol === 'https' AND $this->request->protocol() !== 'HTTPS'))
		{
			// Allow client only to use specific protocols
			throw new Kohana_Exception('The :protocol protocol is required. You are using :using', array(
				':protocol' => $page->protocol,
				':using'    => $this->request->protocol()
			));
		}

		if ($page->protocol === 'https_enforced' AND $this->request->protocol() !== 'https')
		{
			// Enforce client to use HTTPS protocol
			return HTTP::redirect($this->request->url('https'));
		}

		if ($page->method !== 'all' AND ! in_array($this->request->method(), explode(',', strtoupper($page->method))))
		{
			// Allow client only to use specific methods
			throw new Kohana_Exception('The :method method method is not allowed.', array(
				':method' => $this->request->method()
			));
		}

		if ( ! Kohana::find_file('views', 'template/'.$page->template))
		{
			// Find page template
			throw new Kohana_Exception('Did not find template :template', array(':template' => $page->template));
		}

		if ( ! $page->ajax AND $this->request->is_ajax())
		{
			// Disallow AJAX Request client
			throw new Kohana_Exception('AJAX Requests are not allowed.');
		}

		// Set language
		I18n::lang($page->language);

		if (( ! $this->request->is_external() OR $this->request->is_ajax()) AND intval($this->request->query('region')) > 0)
		{
			// Load given region
			$region = ORM::factory('Prime_Region', $this->request->query('region'));

			if ( ! $region->loaded())
			{
				// Region was not found
				throw new Kohana_Exception('Did not find region :region', array(':region' => $this->request->query('region')));
			}

			// Setup region template and execute
			$this->template = View::factory('Prime/Region/Item')
			->set('item', $region->module());
		}
		else
		{
			// Setup page template
			$this->template = View::factory('template/'.$page->template)

			// Bind regions
			->bind('region', $regions);

			// Get page region class
			$regions = Prime::$region;

			foreach ($page->regions->order_by('position', 'ASC')->find_all() as $region)
			{
				// Attach region models
			 	$regions->attach($region);
			}
		}

		// Set global view parameters
		View::set_global('page', $page);
		View::set_global('prime', Prime_Frontend::instance());
		View::set_global('website', Prime::$config->website);
		View::set_global('user', $auth->get_user());

		if (Prime::$cache !== FALSE)
		{
			// Cache current template output
			$cache->set(Prime::$cache, $this->template->render(), 30);
		}

		// Set Response body output
		$this->response->body($this->template->render());
	}

	/**
	 * After method
	 *
	 * @return void
	 */
	public function after()
	{
		// Force internet explorer to render in edge
		$this->response->headers('x-ua-compatible', 'ie=edge, chrome=1');

		return parent::after();
	}

}