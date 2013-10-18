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
	 * @return void
	 */
	public function action_EditContent()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ($region->loaded())
		{
			$module = $region->module();

			if ($module->settings['content'] !== $this->request->post('content'))
			{
				$module->settings['content'] = $this->request->post('content');

				$module->save();
			}
		}
	}

	/**
	 * @return void
	 */
	public function action_GetContent()
	{
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ($region->loaded()) {
			$this->response->body($region->module()->settings['content']);
		}
	}

} // End Prime Module Html Controller