<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Url Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Url extends Controller_Prime_Template {

	/**
	 * List urls being mapped to other place
	 *
	 * @return void
	 */
	public function action_index()
	{
		// Setup view
		$view = View::factory('Prime/Url/List')
		->bind('items', $items);

		// Get urls
		$items = ORM::factory('Prime_Url')
		->order_by('uri', 'ASC')
		->find_all();

		// Set view
		$this->view = $view;
	}

	/**
	 * Create URL Mapping item
	 *
	 * @return void
	 */
	public function action_create()
	{
		// Factory an user account ORM
		$item = ORM::factory('Prime_Url');

		// Let fieldset function handle the rest
		$this->fieldset($item);

		// Set form submit action
		$this->view->action = 'Prime/Url/Create';
	}

	/**
	 * Edit URL Mapping item
	 *
	 * @return void
	 */
	public function action_edit()
	{
		// Get url ORM record
		$item = ORM::factory('Prime_Url', $this->request->param('id'));

		// Make sure the url mapping was found
		if ( ! $item->loaded())
		{
			throw HTTP_Exception::factory(404, 'URL Mapping not found.');
		}

		// Let fieldset function handle the rest
		$this->fieldset($item);

		// Set form submit action
		$this->view->action = 'Prime/Url/Edit/'.$item->id;
	}

	/**
	 * Setup fieldset view and bind needed parameters to it.
	 * Attempt to save ORM model on POST method.
	 *
	 * @param  ORM   $item   Url ORM to save
	 * @return void
	 */
	private function fieldset(ORM $item = NULL)
	{
		// Setup view
		$this->view = View::factory('Prime/Url/Fieldset')

		// Bind parameters
		->bind('item', $item);

		// Process POST data
		if ($this->request->method() === HTTP_Request::POST)
		{
			// Store POST data array
			$post = $this->request->post();

			// Create JSON Response
			$this->json = array(
				'status'  => FALSE,
				'data'    => NULL,
				'message' => NULL
			);

			try
			{
				// Append values to Model and save
				$item->values($post, array('uri', 'redirect', 'prime_page_id'))->save();

				// Update JSON Response
				$this->json = array(
					'status'  => TRUE,
					'data'    => $item->as_array(),
					'message' => __('URL Mapping was saved.')
				);
			}
			catch (ORM_Validation_Exception $e)
			{
				// Flatten validation array
				$errors = Arr::flatten($e->errors('models'));

				// Update JSON Response
				$this->json['status'] = FALSE;
				$this->json['data'] = $errors;
				$this->json['message'] = __('URL Mapping was not saved.');
			}
		}
	}

	/**
	 * Find URL Mappings and delete them.
	 *
	 * @return void
	 */
	public function action_delete()
	{
		// Get ids from param
		$ids = explode(':', $this->request->param('id'));

		foreach ($ids as $id)
		{
			// Locate Url mapping and delete
			$url = ORM::factory('Prime_Url', $this->request->param('id'))->delete();
		}
	}

	public function action_export()
	{

	}

	/**
	 * Overload after controller execution method
	 *
	 * @return parent
	 */
	public function after()
	{
		// Check for asyncronous request
		if ($this->request->is_ajax() OR ! $this->request->is_initial())
		{
			// Disable auto render
			$this->auto_render = FALSE;

			// Render the view
			return $this->response->body(isset($this->json) ? json_encode($this->json) : $this->view);
		}

		// Call parent after
		return parent::after();
	}
}