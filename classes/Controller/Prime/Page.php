<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Page extends Controller_Prime_Core {

	/**
	 * Default landing page
	 * 
	 * @return void
	 */
	public function action_index()
	{
		// set left tree with pages and path
		$this->template->left = View::factory('Prime/Page/Tree')
		->set('items', ORM::factory('Prime_Page')->pages(TRUE))
		->set('path', $this->request->param('id'));

		// set iframe attributes
		$attributes = array(
			'src'         => 'http://prime-beta.forritun.org',
			'style'       => 'width: 100%; height: 100%;',
			'id'          => 'live',
			'frameborder' => 0,
			'class'       => 'scrollable'
		);

		// output html
		$this->view = '<iframe'.HTML::attributes($attributes).'></iframe>';
	}

	/**
	 * Create new page
	 * 
	 * @return void
	 */
	public function action_create()
	{
		// disable auto render
		$this->auto_render = FALSE;

		// get parent page (if any)
		$parent = ORM::factory('Prime_Page', Arr::get($_GET, 'parent'));

		// setup view
		$view = View::factory('Prime/Page/Create')
		->bind('item', $item);

		// create template field
		$view->templates = Prime_Field_Template::factory(array(
			'key' => 'template',
			'name' => 'Template',
			'value' => $parent->loaded() ? $parent->template : NULL,
			'properties' => array(
				'scope' => 'template',
				'edit'  => FALSE
			)
		))->render();

		// find page
		$item = ORM::factory('Prime_Page', Arr::get($_GET, 'parent'));

		// render view
		$this->response->body($view->render());
	}

	/**
	 * Delete page
	 * 
	 * @return void
	 */
	public function action_delete()
	{
		$this->template = View::factory('Prime/Page/Delete')
		->bind('item', $item);

		$item = ORM::factory('Prime_Page', Arr::get($_GET, 'page_id'));
	}

	/**
	 * Rename page
	 * 
	 * @return awesome
	 */
	public function action_rename()
	{
		$this->auto_render = FALSE;

		$response = array(
			'status' => 'error'
		);

		$this->response->body(json_encode($response));
	}

	/**
	 * Move page
	 * 
	 * @return void
	 */
	public function action_move()
	{
		$this->auto_render = FALSE;

		$response = array(
			'status' => 'success'
		);

		// get page
		$page = ORM::factory('Prime_Page', $this->request->param('id'));
		$ref = ORM::factory('Prime_Page', Arr::get($_POST, 'reference'));
		$pos = Arr::get($_POST, 'position');

		// check if page is loaded
		if ($page->loaded())
		{
			// set correct parent id
			$page->parent_id = in_array($pos, array('inside', 'first', 'last')) ? $ref->id : $ref->parent_id;

			// when position is first
			if ($pos === 'first')
			{
				// set top index
				$page->index = 0;

				// set index and update the rest
				DB::update('prime_pages')
				->set(array('index' => DB::expr('`index` + 1')))
				->where('parent_id', '=', $page->parent_id)
				->where('deleted', '=', 0)
				->execute();
			}

			// when position is last or inside
			if ($pos === 'last' OR $pos === 'inside')
			{
				// get last node's index + 1
				$page->index = DB::select('index')
				->from('prime_pages')
				->where('parent_id', '=', $page->parent_id)
				->where('deleted', '=', 0)
				->order_by('index', 'DESC')
				->limit(1)
				->execute()
				->get('index') + 1;
			}

			// when position is after
			if ($pos === 'after')
			{
				// add 1 to reference index
				$page->index = $ref->index + 1;

				// update the rest
				DB::update('prime_pages')
				->set(array('index' => DB::expr('`index` + 1')))
				->where('index', '>', $ref->index)
				->where('parent_id', '=', $page->parent_id)
				->where('deleted', '=', 0)
				->execute();
			}

			// when position is before
			if ($pos === 'before')
			{
				// set page index to ref index
				$page->index = $ref->index;

				// update before
				DB::update('prime_pages')
				->set(array('index' => DB::expr('`index` + 1')))
				->where('index', '>=', $ref->index)
				->where('parent_id', '=', $page->parent_id)
				->where('deleted', '=', 0)
				->execute();
			}

			// save page
			$page->save();
		}

		// output response
		$this->response->body(json_encode($response));
	}

	public function action_settings()
	{
		$this->auto_render = FALSE;

		$view = View::factory('Prime/Page/Settings');

		$this->response->body($view);
	}

	/**
	 * Page properties
	 * 
	 * @return void
	 */
	public function action_properties()
	{
		// disable auto render
		$this->auto_render = FALSE;

		// setup properties view
		$view = View::factory('Prime/Page/Properties')
		->bind('item', $item);

		// find page
		$item = ORM::factory('Prime_Page', $this->request->param('id'));

		// create template field
		$view->templates = Prime_Field_Template::factory(array(
			'key' => 'template',
			'name' => 'Template',
			'value' => $item->template,
			'properties' => array(
				'scope' => 'template',
				'edit'  => FALSE
			)
		))->render();

		// on request method post
		if ($this->request->method() === Request::POST)
		{
			$name = $item->name;

			try
			{
				// set item values
				$item->values($this->request->post(), array(
					'name',
					'title',
					'template',
					'alias',
					'auto_alias',
					'forward',
					'forward_url'
				));

				// when name is not original and we have auto_alias enabled
				if ($name !== $item->name AND $item->auto_alias)
				{
					// re-generate page alias
					$item->alias = Prime::$page->alias($item->name, $item->parent_id);
				}

				// save item
				$item->save();

				// message
				$msg = array('alias' => $item->alias, 'name' => $item->name);
			}
			catch (ORM_Validation_Exception $e)
			{
				// message
				$msg = $e->errors();
			}

			$view = json_encode(array(
				'status' => 'success',
				'message' => $msg
			));
		}

		// render view
		$this->response->body($view);
	}

	public function action_rest()
	{
		// disable template rendering
		$this->auto_render = FALSE;

		$this->resp = array(
			'status' => 'error'
		);

		// decode json data
		try
		{
			$this->data = json_decode($this->request->body(), TRUE);

			// switch methods
			switch ($this->request->method())
			{
				case HTTP_Request::POST:
					$this->post();
					break;
	
				case HTTP_Request::DELETE:
					$this->delete();
					break;
	
				case HTTP_Request::PUT:
					$this->put();
					break;
	
				default:
					$this->get();
			}

		}
		catch (Exception $e)
		{

		}

		// return response
		return $this->response->body(json_encode($this->resp));
	}


	private function post()
	{
		// setup model
		$model = ORM::factory('Prime_Page')

		// set model values
		->values($this->data, array(
			'parent_id',
			'name',
			'template'
		));

		try
		{
			// generate automatic alias
			$model->alias = Prime::$page->alias($model->name, $model->parent_id);
			$model->auto_alias = 1;

			// set correct template
			$model->template = $model->template;

			// save model
			$model->save();

			// create response
			$this->resp = array(
				'status' => 'success',
				'record' => $model->as_array()
			);
		}
		catch (ORM_Validation_Exception $e)
		{
			$this->resp['error'] = $e->errors('model');
		}
	}

	private function delete()
	{
		$model = ORM::factory('Prime_Page', $this->request->param('id'));

		if ($model->loaded())
		{
			$model->deleted = 1;
			$model->save();
			$this->resp['status'] = 'success';
		}
	}

	private function put()
	{

	}

	private function get()
	{
		$items = ORM::factory('Prime_Page')->pages(TRUE, $this->request->param('id'));
		$this->resp['items'] = array();
		$this->resp['status'] = 'success';
		foreach ($items as $item)
		{
			$_item= array(
				'data' => array('title' => $item->name, 'attr' => array('href' => '/?page_id='.$item->id)),
				'attr' => array('data-id' => $item->id, 'id' => 'page_id_'.$item->id, 'data-alias' => $item->alias)
			);
			$childs = ORM::factory('Prime_Page')->pages(TRUE, $item->id);
			if (count($childs) > 0)
			{
				$_item['state'] = 'closed';
				$_item['children'] = array();
			}
			$this->resp['items'][] = $_item;
		}
	}

} // End Prime Page