<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Region Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Region extends Controller {

	public function action_remove()
	{
		$this->template = View::factory('Prime/Region/Remove')
		->bind('item', $item);

		$item = ORM::factory('Prime_Region', $this->request->param('id'));

		if (Arr::get($_GET, 'confirm') === 'true')
		{
			$response = array(
				'status' => 'success'
			);

			$item->deleted = 1;
			$item->save();

			return $this->response->body(json_encode($response));
		}

		$this->response->body($this->template->render());
	}

	public function action_load()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		$module = call_user_func_array(array($region->module->controller, 'factory'), array($region));

		$this->response->body($module->render());
	}

	public function action_settings()
	{
		// get region
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		// setup template
		$this->template = View::factory('Prime/Region/Settings')
		->bind('items', $params)
		->set('region', $region);

		// check if module exists
		if ( ! class_exists($region->module->controller))
		{
			Kohana::$log->add(Log::ERROR, 'Class [:module] was not found', array(
				':module' => $region->module->controller
			));

			return $this->response->body('Module not loaded!');
		}

		// call module factory class
		$module = call_user_func_array(array($region->module->controller, 'factory'), array($region));

		if ($this->request->method() === HTTP_Request::POST)
		{
			$module->save($this->request->post());

			return $this->response->body(json_encode(array('status' => 'success')));
		}

		// get params
		$params = array();

		// group params
		foreach ($module->params() as $name => $param)
		{
			// build params array group
			if ( ! isset($params[$param['group']]))
			{
				$params[$param['group']] = array();
			}

			// setup properties
			$param['key'] = $name;
			$param['properties'] = isset($param['properties']) ? $param['properties'] : array();
			$param['settings'] = $module->settings;

			// setup field
			$param['field'] = call_user_func_array(array($param['field'], 'factory'), array($param));

			// attach to params array
			$params[$param['group']][$name] = $param;
		}

		// Parse view
		$this->response->body($this->template->render());
	}

	public function action_add()
	{
		$response = array(
			'status' => 'success'
		);

		$page = ORM::factory('Prime_Page', Arr::get($_GET, 'page'));
		$module = ORM::factory('Prime_Module', Arr::get($_GET, 'module'));
		$position = Arr::get($_GET, 'pos');

		$region = ORM::factory('Prime_Region');
		$region->prime_page_id = $page->id;
		$region->prime_module_id = $module->id;
		$region->name = Arr::get($_GET, 'region');
		$region->index = $position;
		$region->settings = "{}";
		$region->created = date('Y-m-d H:i:s');
		$region->save();

		$response['id'] = $region->id;

		$this->response->body(json_encode($response));
	}

}