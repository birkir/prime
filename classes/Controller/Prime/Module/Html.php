<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Html
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Module_Html extends Controller_Prime_Template {

	/**
	 * @var bool Disable auto render
	 */
	public $auto_render = FALSE;

	/**
	 * Save contents from CKEditor
	 *
	 * @return void
	 */
	public function action_save()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ($region->loaded())
		{
			$module = $region->module();
			$module->settings['content'] = $this->request->post('content');
			$module->save();
		}
	}

	/**
	*
	 * @return void
	 */
	public function action_editor()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));
		if ( ! $region->loaded()) return;

		$module = $region->module();

		$view = View::factory('Prime/Module/Html/Editor')
		->set('content', $module->settings['content'])
		->set('editor_type', $module->settings['editor_type']);

		$this->response->body($view->render());
	}

} // End Prime Module Html Controller