<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Html Controller
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
		// Get region
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ($region->loaded())
		{
			// Get region module
			$module = $region->module();
			$module->settings['content'] = $this->request->post('content');
			$module->save();

			if ( ! empty($region->prime_page_id))
			{
				// Bump the page revision
				ORM::factory('Prime_Page', $region->prime_page_id)->save();
			}
			else
			{
				ORM::factory('Prime_Region', $region->id)->publish();
			}
		}
	}

	/**
	 * Load CK or Ace Editor in a popup
	 *
	 * @return void
	 */
	public function action_editor()
	{
		// Get region
		$region = ORM::factory('Prime_Region', $this->request->param('id'));

		if ( ! $region->loaded())
		{
			// Could not find region
			throw new Kohana_Exception('Region not found.');
		}

		// Get region module
		$module = $region->module();

		// Load editor template
		$view = View::factory('Prime/Module/Html/Editor')
		->set('content', $module->settings['content'])
		->set('editor_type', $module->settings['editor_type']);

		// Render editor
		$this->response->body($view->render());
	}

}