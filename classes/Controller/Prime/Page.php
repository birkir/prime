<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Page extends Controller_Prime_Template {

	/**
	 * Default page
	 *
	 * @return void
	 */
	public function action_index()
	{
		// Display edit page view
		$this->action_edit();
	}

	/**
	 * Render page tree
	 * 
	 * @return void
	 */
	public function action_tree()
	{
		// Setup tree view
		$this->view = View::factory('Prime/Page/Tree')
		->bind('nodes', $nodes)
		->set('request', $this->request)
		->set('open', $this->request->is_ajax() ? [] : json_decode(Arr::get($_COOKIE, 'tree-page', '{}'), TRUE));

		// Get available Page records 
		$nodes = ORM::factory('Prime_Page')
		->where('parent_id', 'IS', NULL);
	}

	/**
	 * Edit page with modules on right and page
	 * tree on left.
	 *
	 * @return void
	 */
	public function action_edit()
	{
		// Get page by query string
		$page = ORM::factory('Prime_Page', $this->request->param('id'))
		->uri();

		// Show iframe view
		$this->view = View::factory('Prime/Page/Edit')
		->set('url', ($page ? $page : '/').'?mode=design');
	}

	/**
	 * Create new page
	 *
	 * @return void
	 */
	public function action_create()
	{
		// Get parent page
		$parent = ORM::factory('Prime_Page', $this->request->param('id'));

		// Factory an page model
		$page = ORM::factory('Prime_Page');

		// Set model default values
		$page->parent_id = $parent->id;
		$page->slug_auto = 1;
		$page->noindex   = 0;
		$page->nofollow  = 0;
		$page->redirect  = 0;
		$page->protocol  = 'both';
		$page->method    = 'all';
		$page->ajax      = 1;
		$page->visible   = 1;
		$page->disabled  = 0;

		// Let fieldset handle POST method
		$this->fieldset($page);

		// Set form action
		$this->view->action = '/Prime/Page/Create/' . $this->request->param('id');
	}

	/**
	 * Setup page properties dialog and process
	 *
	 * @return void
	 */
	public function action_properties()
	{
		// get requested page model
		$page = ORM::factory('Prime_Page', $this->request->param('id'));

		// Let fieldset handle POST data
		$this->fieldset($page);

		// Set form action
		$this->view->action = '/Prime/Page/Properties/' . $page->id;
	}

	/**
	 * Setup fieldset view and bind needed parameters to it.
	 * Attempt to save ORM model on POST method.
	 *
	 * @param  ORM   $item   Page model to save
	 * @return void
	 */
	private function fieldset($page)
	{
		// Get templates and default selection
		$templates = Arr::merge(array(NULL => ' - '.__('Inherit from parent page').' - '), Prime::treeselect(Kohana::list_files('views/template'), 'views/template/'));

		// Get languages and default selection
		$languages = Arr::merge(array(NULL => ' - '.__('Inherit from parent page').' - '), Prime::$languages);

		// Setup view
		$this->view = View::factory('Prime/Page/Properties')
		->set('page', $page)
		->set('languages', $languages)
		->set('templates', $templates);

		if ($this->request->method() === HTTP_Request::POST)
		{
			// Store POST data array
			$post = $this->request->post();

			// Set inherit values to NULL
			$post['template'] = empty($post['template']) ? NULL : $post['template'];
			$post['language'] = empty($post['language']) ? NULL : $post['language'];

			try 
			{
				// Set POST data to model
				$page->values($post);

				// Try saving
				$page->save();

				// Create JSON Response
				$this->json = array(
					'status'  => TRUE,
					'data'    => Request::factory('Prime/Page/Tree')->execute()->body(),
					'message' => __('Page was saved.')
				);
			}
			catch (ORM_Validation_Exception $e)
			{
				// Flatten validation array
				$errors = Arr::flatten($e->errors('models'));

				// Update JSON Response
				$this->json['status'] = FALSE;
				$this->json['data'] = $errors;
				$this->json['message'] = __('Page was not saved.');
			}
		}
	}

	/**
	 * Publish the pagea and all of its regions
	 *
	 * @return void
	 */
	public function action_publish()
	{
		// Get page
		$page = ORM::factory('Prime_Page', $this->request->param('id'));

		foreach ($page->regions->find_all() as $region)
		{
			if ($region->published !== $region->revision)
			{
				// Publish region
				$region->publish();
			}
		}

		if ($page->published !== $page->revision)
		{
			// Publish page
			$page->publish();
		}

		$this->index_page($page->id);

		// Show tree
		$this->view = Request::factory('Prime/Page/Tree')->execute()->body();
	}

	/**
	 * Cancel draft changes
	 *
	 * @return void
	 */
	public function action_discard()
	{
		// Get page
		$page = ORM::factory('Prime_Page', $this->request->param('id'));

		foreach ($page->regions->find_all() as $region)
		{
			if ($region->published !== $region->revision)
			{
				$region->discard();
			}
		}

		if ($page->published !== $page->revision)
		{
			$page->discard();
		}

		$this->index_page($page->id);

		// Show tree
		$this->view = Request::factory('Prime/Page/Tree')->execute()->body();
	}

	public function index_page($page = NULL)
	{
		// Load Lucene Engine
		$lucene = Prime::lucene();

		foreach ($lucene->find('page:'.$page) as $hit)
		{
			// Delete the page
			$lucene->delete($hit->id);
		}

		// Get page body
		$body = Request::factory('/')->query(['pageid' => $page])->execute()->body();

		// Load document body html
		$doc = Zend_Search_Lucene_Document_Html::loadHTML($body);

		// Add page id as identifiable keyword
		$doc->addField(Zend_Search_Lucene_Field::Keyword('page', $page));

		// Add document to index
		$lucene->addDocument($doc);
	}

	/**
	 * Toggle page visibility on or off
	 *
	 * @return void
	 */
	public function action_visible()
	{
		// Extract page and toggle state
		list ($page, $visible) = explode(':', $this->request->param('id'));

		// Find page
		$page = ORM::factory('Prime_Page', $page);
		$page->visible = ($visible == 'true') ? 1 : 0;
		$page->save();

		// Show tree
		$this->view = Request::factory('Prime/Page/Tree')->execute()->body();
	}

	/**
	 * Delete page by parameter
	 *
	 * @return void
	 */
	public function action_delete()
	{
		// Find page and delete
		ORM::factory('Prime_Page', $this->request->param('id'))
		->delete();

		// Show tree
		$this->view = Request::factory('Prime/Page/Tree')->execute()->body();
	}

	/**
	 * Rename page
	 *
	 * @return void
	 */
	public function action_rename()
	{
		// Find page
		$page = ORM::factory('Prime_Page', $this->request->param('id'));
		$page->name = $this->request->post('name');
		$page->save();

		// Show tree
		$this->view = Request::factory('Prime/Page/Tree')->execute()->body();
	}

	/**
	 * Move page
	 *
	 * @return void
	 **/
	public function action_move()
	{
		// Extract source and destination page
		list ($page, $to) = explode(':', $this->request->param('id'));

		// Find page and update parent id
		$page = ORM::factory('Prime_Page', $page);
		$page->parent_id = $to;
		$page->save();

		// Show tree
		$this->view = Request::factory('Prime/Page/Tree')->execute()->body();
	}

	/**
	 * Move page above reference page
	 *
	 * @return void
	 */
	public function action_reorder()
	{
		// Extract source and reference page
		list($page, $reference) = explode(':', $this->request->param('id'));

		// Find page and re-position it (public and drafts)
		$page = ORM::factory('Prime_Page', $page)
		->position($reference)
		->position($reference, FALSE);
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
		else
		{
			// Always display tree view
			$this->template->left = Request::factory('Prime/Page/Tree')
			->execute();

			// Always display right panel view
			$this->template->right = View::factory('Prime/Page/Modules')
			->bind('modules', $modules);
		
			// Get all modules available
			$modules = ORM::factory('Prime_Module')
			->find_all();
		}

		// Call parent after
		return parent::after();
	}

}