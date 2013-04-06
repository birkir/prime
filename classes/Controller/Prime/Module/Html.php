<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Html Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Html
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Module_Html extends Controller {

	public function action_save()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));
		$settings = json_decode($region->settings);
		$settings->content = Arr::get($_POST, 'content');
		$region->settings = json_encode($settings);
		$region->save();
		$response = array('status' => 'success');
		$this->response->body(json_encode($response));
	}

	public function action_edit()
	{
		$view = View::factory('Prime/Module/Html/Editor');

		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		// check if module exists
		if ( ! class_exists($region->module->controller))
			throw new Kohana_Exception('Class :module not found.', array(':module' => $region->module->controller));

		// call module factory class
		$module = call_user_func_array(array($region->module->controller, 'factory'), array($region));

		$view->content = isset($module->settings['content']) ? $module->settings['content'] : NULL;

		$view->id = $region->id;

		$view->editor = isset($module->settings['editor_type']) ? $module->settings['editor_type'] : 'wysiwyg';

		$this->response->body($view->render());
	}

} // End HTML Module