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
	 * Authentication method frontend
	 *
	 * @return string
	 */
	public function action_authenticated()
	{
		$response = array(
			'status' => 'success'
		);

		$this->response->body(json_encode($response));
	}

	/**
	 * Get region contextmenus for current page
	 * 
	 * @return array
	 */
	public function action_modules()
	{
		// find page
		$this->page = ORM::factory('Prime_Page', $this->request->param('id'));

		$items = array();

		// get all regions
		foreach ($this->page->regions->get_all() as $region)
		{
			// check if the class exists
			if ( ! class_exists($region->module->controller))
			{
				$items[$region->id] = array(
					array('name' => __('Module not loaded.'), 'icon' => 'ban-circle', 'action' => 'return false;'),
					array('name'   => __('Delete'), 'action' => 'prime.scope.page.region.remove('.$region->id.');', 'icon'   => 'remove')
				);

				continue;
			}

			// module factory
			$module = call_user_func_array(array($region->module->controller, 'factory'), array($region));

			// attach to items array
			$items[$region->id] = $module->live();
		}

		$this->response->body(json_encode($items));
	}

	/**
	 * Process action
	 *
	 * @return void
	 */
	public function action_process()
	{
		// get uri
		$uri = $this->request->param('query');

		// serve default favicon 
		if ($uri === 'favicon.ico')
		{
			// set png header
			$this->response->headers('content-type', 'image/png');
			$this->response->body(base64_decode('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABEUlEQVR4Xo2RMWqFQBCGf3dtBEvBWOUUQtKnjgTSWFmIuYwH8ARp06RJZWMZrHMALSIISsAirO5LZnnJwuLD/WAYwfHDf8bBmbquv6WUAjswxvgwDG2apo8APqGBEvi+/zDP8wsuIIRA13VomuY9z/M7AF//8nM/4YBlWZBlWVxV1RuAQAsscF0X67piHEcURXFbluUrgCtrgeM4Kkbf92jbFkmS3ERRdK/k0OB0upwkjmP6C1We55GUGwK7KFQaQyClhA2cc3uB8Z6KItgKtJj2Q50xpmdNgRCCBgyh7uazKVAbtsIUbNsG3Q+hODRrtQO6995O9iMEQXCY2zzjn/46DMMn+YvFRdQ30zQ9A/j4AaRElOndE0NTAAAAAElFTkSuQmCC'));
			return FALSE;
		}

		// get selected page
		$page = Prime::$page->selected();

		if ( ! $page)
		{
			return $this->not_found();
		}

		// check if template was found
		if ( ! Kohana::find_file('views', $page->template))
		{
			throw new Kohana_Exception('Did not find template :template', array(':template' => $page->template));
		}

		// setup template
		$this->template = View::factory($page->template)
		->bind('region', $region);

		// set region instance
		$region = Prime_Region::instance();

		// set global variables
		View::set_global('page', $page);
		View::set_global('prime', Prime_Frontend::instance());

		// loop through regions
		foreach ($page->regions->get_all() as $_region)
		{
			// attach region
			$region->attach($_region);
		}

		// set response as template
		$this->response->body($this->template->render());
	}

	/**
	 * Standard not found page
	 */
	public function not_found()
	{
		Kohana::$log->add(Log::ERROR, 'Page not found [:url]', array(
			':url' => $this->request->uri()
		));

		// get error page by config
		if (Arr::get($this->website, 'error_page_id', FALSE))
		{
			// try some stuff
		}

		// just not found ...
		echo 'not found';
	}

} // End Frontend