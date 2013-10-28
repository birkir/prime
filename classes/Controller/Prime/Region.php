<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Region Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Region extends Controller_Prime_Template {

	/**
	 * @var bool Disable auto render
	 */
	public $auto_render = FALSE;

	/**
	 * Default page redirects to pages controller
	 *
	 * @return void
	 */
	public function action_index()
	{
		HTTP::redirect('Prime/Page');
	}

	/**
	 * Add region to page
	 *
	 * @return void
	 */
	public function action_add()
	{
		// get parameters
		$params = $this->request->post();

		// create new region
		$region = ORM::factory('Prime_Region');
		$region->values($params);

		// reference region
		$reference = ORM::factory('Prime_Region', Arr::get($params, '_ref'));

		// check if reference region was loaded
		if ($reference->loaded())
		{
			// fit position
			$pos = (Arr::get($params, '_pos') === 'above' ? 0 : $reference->position);

			// update reference region
			DB::update('prime_regions')
			->set(['position' => DB::expr('`position` + 1')])
			->where('position', '>'.($pos === 0  ? '=' : NULL), $pos)
			->where('prime_page_id', '=', $reference->prime_page_id)
			->where('name', '=', $reference->name)
			->execute();

			// update position
			$region->position = $pos;
		}

		// save region
		$region->save();

		// display region
		$this->response->body(Request::factory('Prime/Region/Display/'.$region->id)->execute());
	}

	/**
	 * Remove given region
	 *
	 * @return void
	 */
	public function action_remove()
	{
		// find region
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		// delete
		$region->delete();
	}

	/**
	 * Display settings for region
	 *
	 * @return void
	 */
	public function action_settings()
	{
		// find region
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		// make sure it was found
		if ( ! $region->loaded())
			throw HTTP_Exception::factory(404, 'Not found');

		// get region module
		$module = $region->module();

		// get module fields
		$fields = $module->params();

		// setup view
		$view = View::factory('Prime/Region/Settings')
		->set('fields', $fields)
		->set('region', $region)
		->set('data', $module->settings);

		// handle form post
		if ($this->request->method() === HTTP_Request::POST)
		{
			// save parameters
			$module->save($this->request->post());

			// update region
			$view = Request::factory('Prime/Region/Display/'.$region->id)->execute();
		}

		// output view
		$this->response->body($view);
	}

	/**
	 * Display region by id
	 *
	 * @return void
	 */
	public function action_display()
	{
		// find region
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		// check if region is loaded
		if ($region->loaded())
		{
			// load its page id
			$page = ORM::factory('Prime_Page', $region->prime_page_id);

			// set selected page
			Prime::$selected_page = $page;

			// get things needed for region
			View::set_global('page', $page);
			View::set_global('prime', Prime_Frontend::instance());

			// setup view for region item
			$view = View::factory('Prime/Page/Region/Item')
			->set('item', $region->module());

			// setup DOM
			$re = '<div class="prime-region-item" data-id="'.$region->id.'">'
				. $view
				. '<div class="prime-drop" data-position="below" style="display: none;">drop below</div>'
				. '</div>';

			$this->response->body($re);
		}
	}

}