<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Item
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Fieldset
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Fieldset_Item extends Prime_Module {

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
					'name'    => 'fieldset',
					'caption' => 'Fieldset',
					'field'   => 'Prime_Field_Fieldset',
					'default' => ''
				],
				[
					'name'    => 'return_page',
					'caption' => 'Return page',
					'field'   => 'Prime_Field_Page',
					'default' => ''
				],
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/fieldset/item'
					]
				]
			]
		];
	}

	/**
	 * Check url for internal module route
	 * 
	 * @return boolean
	 */
	public function route($uri = NULL)
	{
		// get fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', intval($this->settings['fieldset']));

		// get item
		$item = ORM::factory('Prime_Module_Fieldset_Item', intval($uri));

		// check if fieldset item is loaded and matches given fieldset
		if ($item->loaded())
			return TRUE;

		return FALSE;
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/fieldset/item/', $this->settings['template']))
		{
			$this->settings['template'] = 'standard';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/fieldset/item/', $this->settings['template']))
		{
			throw new Kohana_Exception('Could not find view [:view].', array(':view' => $this->settings['template']));
		}

		// Get fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->settings['fieldset']);

		// Make sure fieldset exists
		if ( ! $fieldset->loaded())
		{
			throw new Kohana_Exception('Could not find fieldset [:fieldset].', array(':fieldset' => $this->settings['fieldset']));
		}

		// setup view
		$view = View::factory('module/fieldset/item/'.$this->settings['template'])
		->bind('item', $item)
		->bind('page', $page)
		->set('fieldset', $fieldset)
		->set('fields', $fieldset->fields());

		// get item
		$item = ORM::factory('Prime_Module_Fieldset_Item', intval(Prime::$page_overload_uri));

		// get return page
		$page = ORM::factory('Prime_Page', intval($this->settings['return_page']))->uri();

		// return view
		return $view;
	}

} // End Module Fieldset Item