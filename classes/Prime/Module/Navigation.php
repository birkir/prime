<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Navigation
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Navigation
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Navigation extends Prime_Module {

	/**
	 * Parameters to configure module
	 * 
	 * @return array
	 */
	public function params()
	{
		return [
			'General' => [
				[
					'name'    => 'expanded',
					'caption' => 'Expanded',
					'field'   => 'Prime_Field_Boolean',
					'default' => TRUE
				],
				'from_level' => [
					'name'    => 'From level',
					'field'   => 'Prime_Field_String',
					'default' => 0
				],
				'to_level' => [
					'name'    => 'To level',
					'field'   => 'Prime_Field_String',
					'default' => 10
				],
				'root_page' => [
					'name'    => 'Root page',
					'field'   => 'Prime_Field_Page',
					'default' => NULL
				],
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/navigation'
					]
				]
			]
		];
	}

	public static function actives($page)
	{
		$ret = array($page->id);

		while ($page->loaded() AND intval($page->parent_id) !== 0)
		{
			$page = ORM::factory('Prime_Page')
			->where('id', '=', $page->parent_id)
			->where('deleted', '=', 0)
			->find();

			$ret[] = $page->id;
		}

		return $ret;
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// setup view
		$view = View::factory('module/navigation/'.$this->settings['template'])
		->set('items', ORM::factory('Prime_Page'))
		->set('actives', self::actives(Prime::$selected_page))
		->set('settings', $this->settings);

		return $view;
	}

} // End Prime Module Navigation