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
		// get uri
		$uri = $this->request->param('query');

		// get selected page
		$page = Prime::selected($this->request);

		// page loaded
		if ( ! $page->loaded())
		{
			$this->response->status(404);
			return $this->response->body('404 Not Found');
		}

		// check if template was found
		if ( ! Kohana::find_file('views', $page->template))
		{
			throw new Kohana_Exception('Did not find template :template', array(':template' => $page->template));
		}

		// setup template
		$this->template = View::factory($page->template)

		// bind regions
		->bind('region', $regions);

		// get page region class
		$regions = Prime::$region;

		// loop through regions
		foreach ($page->regions->order_by('position', 'ASC')->find_all() as $region)
		{
		 	$regions->attach($region);
		}

		// set global view parameters
		View::set_global('page', $page);
		View::set_global('prime', Prime_Frontend::instance());

		// respond template
		$this->response->body($this->template->render());
	}

} // End Prime Frontend