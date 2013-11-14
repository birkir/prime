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
	 * Default page
	 *
	 * @return void
	 */
	public function action_index()
	{
		// Redirect to Pages
		HTTP::redirect('Prime/Page');
	}

	/**
	 * Add Region to Page
	 *
	 * @return void
	 */
	public function action_add()
	{
		// Extract region and reference ids
		list($id, $reference, $name, $page) = explode(':', $this->request->param('id'));

		// Create Region model
		$region = ORM::factory('Prime_Region');

		// Set model values
		$region->prime_page_id   = $page;
		$region->prime_module_id = $id;
		$region->name            = $name;
		$region->settings        = '{}';

		// Save Region
		$region->save();

		// Set Region position
		$region->position($reference);

		// Get Region display Response
		$output = Request::factory('Prime/Region/Display/'.$region->id)->execute();

		// Set region view as Response body
		$this->response->body('<div'.HTML::attributes(['class' => 'prime-region-item', 'data-id' => $region->id]).'>'.$output.'</div>');
	}

	/**
	 * Move Region above Reference Region
	 *
	 * @return void
	 */
	public function action_move()
	{
		// Extract region and reference ids
		list($id, $reference, $name, $page) = explode(':', $this->request->param('id'));

		// Load region record
		$region = ORM::factory('Prime_Region', intval($id));

		// Set model values
		$region->prime_page_id = $page;
		$region->name = $name;

		// Update region position
		$region->save();

		// Execute movement query
		$region->position($reference);

	}

	/**
	 * Remove Region
	 *
	 * @return void
	 */
	public function action_remove()
	{
		// Find and delete Region
		$region = ORM::factory('Prime_Region', $this->request->param('id'))->delete();
	}

	/**
	 * Display settings popup for Region
	 *
	 * @return void
	 */
	public function action_settings()
	{
		// Find region
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ( ! $region->loaded())
		{
			// We did not find region
			throw HTTP_Exception::factory(404, 'Region was not found.');
		}

		// Get region module
		$module = $region->module();

		// Get module fields
		$fields = $module->params();

		// Setup region modal view
		$view = View::factory('Prime/Region/Settings')
		->set('fields', $fields)
		->set('region', $region)
		->set('data', $module->settings);

		if ($this->request->method() === HTTP_Request::POST)
		{
			// Save module with POST data
			$module->save($this->request->post());

			// Bump the page revision
			ORM::factory('Prime_Page', $region->prime_page_id)->save();

			// Re-render region
			$view = Request::factory('Prime/Region/Display/'.$region->id)->execute();
		}

		// Set view as Response body
		$this->response->body($view);
	}

	/**
	 * Display region by ID in query string
	 *
	 * @return void
	 */
	public function action_display()
	{
		// Find region
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ($region->loaded())
		{
			// Request frontpage with region id
			$response = Request::factory('')
			->query('region', $region->id)
			->query('mode', 'design')
			->execute();

			// Set proxied html as Response body
			$this->response->body($response->body());
		}
	}

}