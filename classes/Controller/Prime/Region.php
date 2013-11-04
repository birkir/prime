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
		$post = $this->request->post();

		// create new region
		$region = ORM::factory('Prime_Region');
		$region->prime_page_id = Arr::get($post, 'page');
		$region->prime_module_id = Arr::get($post, 'module');
		$region->name = Arr::get($post, 'region');
		$region->settings = '{}';
		$region->position = 0;

		// reference region
		$reference = ORM::factory('Prime_Region', Arr::get($post, 'reference'));

		// check if reference region was loaded
		if ($reference->loaded())
		{
			// generate new position
			$region->position = $reference->position + (Arr::get($post, 'position', 'below') === 'above' ? 0 : 1);

			// bump all rows below position
			DB::update('prime_regions')
			->set(['position' => DB::expr('`position` + 1')])
			->where('position', '>=', $region->position)
			->where('prime_page_id', '=', $region->prime_page_id)
			->where('name', '=', $region->name)
			->where('deleted', '=', 0)
			->execute();
		}

		// save region
		$region->save();

		// execute display request
		$output = Request::factory('Prime/Region/Display/'.$region->id)->execute();

		// display region
		$this->response->body('<div'.HTML::attributes(['class' => 'prime-region-item', 'data-id' => $region->id]).'>'.$output.'</div>');
	}

	/**
	 * Move region above reference region
	 *
	 * @return void
	 */
	public function action_reorder()
	{
		// get parameters
		$post = $this->request->post();

		// node to move
		$region = ORM::factory('Prime_Region', Arr::get($post, 'region'));

		// node to reference as above
		$reference = ORM::factory('Prime_Region', Arr::get($post, 'reference'));

		if ( ! $reference->loaded())
			return;

		// generate new position
		$new = $reference->position + (Arr::get($post, 'position', 'below') === 'above' ? 0 : 1);

		if ($region->name === $reference->name)
		{
			// execute multi-query
			DB::update('prime_regions')
			->set(['position' => DB::expr('CASE `position` WHEN '.$region->position.' THEN '.$new.' ELSE `position` + SIGN('.($region->position - $new).') END')])
			->where('position', 'BETWEEN', DB::expr('LEAST('.$new.','.$region->position.') AND GREATEST('.$new.','.$region->position.')'))
			->where('prime_page_id', '=', $region->prime_page_id)
			->where('name', '=', $region->name)
			->where('deleted', '=', 0)
			->execute();
		}
		else
		{
			// bump all rows below position
			DB::update('prime_regions')
			->set(['position' => DB::expr('`position` + 1')])
			->where('position', '>=', $new)
			->where('prime_page_id', '=', $region->prime_page_id)
			->where('name', '=', $region->name)
			->where('deleted', '=', 0)
			->execute();

			// save region
			$region->position = $new;
			$region->save();
		}
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
			// proxy to frontpage
			$response = Request::factory('')
			->query('region', $region->id)
			->query('mode', 'design')
			->execute();

			// set requested response body
			$this->response->body(gzdecode($response->body()));
		}
	}

}