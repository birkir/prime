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

	public function action_index()
	{
		$this->template->left = View::factory('Prime/Page/Tree')
		->set('items', ORM::factory('Prime_Page')->pages(TRUE))
		->set('path', $this->request->param('id'));

		$iframe = array(
			'src'         => 'http://prime-beta.forritun.org',
			'style'       => 'width: 100%; height: 100%;',
			'id'          => 'live',
			'frameborder' => 0,
			'class'       => 'scrollable'
		);

		$this->view = '<iframe'.HTML::attributes($iframe).'></iframe>';
	}

	public function action_create()
	{
		// display template
		$this->template = View::factory('Prime/Page/Create')
		->bind('item', $item);

		// find page
		$item = ORM::factory('Prime_Page', Arr::get($_GET, 'parent'));
	}

	public function action_delete()
	{
		$this->template = View::factory('Prime/Page/Delete')
		->bind('item', $item);

		$item = ORM::factory('Prime_Page', Arr::get($_GET, 'page_id'));
	}

	public function action_rename()
	{
		$this->auto_render = FALSE;

		$response = array(
			'status' => 'error'
		);

		$this->response->body(json_encode($response));
	}

	public function action_generate_alias()
	{
		$this->auto_render = FALSE;

		$alias = Arr::get($_GET, 'input');

		$alias = URL::title($alias, '-', TRUE);

		echo $alias;
	}

	public function action_settings()
	{
		$this->auto_render = FALSE;

		$view = View::factory('Prime/Page/Settings');

		$this->response->body($view);
	}

	public function action_properties()
	{
		$this->auto_render = FALSE;

		$view = View::factory('Prime/Page/Properties')
		->bind('item', $item);

		$item = ORM::factory('Prime_Page', $this->request->param('id'));

		$this->response->body($view);
	}

	public function action_rest()
	{
		// disable template rendering
		$this->auto_render = FALSE;

		// set response status
		$response = array(
			'status' => 'error'
		);

		// decode json data
		try
		{
			$data = json_decode($this->request->body(), TRUE);

			// switch methods
			switch ($this->request->method())
			{
				case HTTP_Request::POST:
					$model = ORM::factory('Prime_Page')
					->values($data, array('parent_id', 'name', 'template'));
					try
					{
						$model->save();

						$response = array(
							'status' => 'success',
							'record' => $model->as_array()
						);
					}
					catch (ORM_Validation_Exception $e)
					{
						$response['error'] = $e->errors('model');
					}
					break;
	
				case HTTP_Request::DELETE:
					$model = ORM::factory('Prime_Page', $this->request->param('id'));
					if ($model->loaded())
					{
						$model->deleted = 1;
						$model->save();
						$response['status'] = 'success';
					}
					break;
	
				case HTTP_Request::PUT:
					break;
	
				default:
					$items = ORM::factory('Prime_Page')->pages(TRUE, $this->request->param('id'));
					$response['items'] = array();
					$response['status'] = 'success';
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
						$response['items'][] = $_item;
					}
			}
		} catch (Exception $e) {}

		// return response
		return $this->response->body(json_encode($response));
	}

} // End Prime Page