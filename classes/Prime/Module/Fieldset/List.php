<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset List
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Fieldset
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Fieldset_List extends Prime_Module {

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
					'default' => '',
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/fieldset/list'
					]
				]
			]
		];
	}

	/**
	 * Buttons to show in live mode
	 * 
	 * @return array
	 */
	public function actions()
	{
		return Arr::merge([
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'icon-plus']).'></i>', [
				'onclick' => 'window.top.Prime.Page.EditContent('.$this->_region->id.'); return false;'
			])
		], parent::actions());
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/fieldset/list/', $this->settings['template']))
		{
			$this->settings['template'] = 'default';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/fieldset/list/', $this->settings['template']))
			throw new Kohana_Exception('Could not find view [:view].', array(':view' => $this->settings['template']));

		// Get fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->settings['fieldset']);

		// Make sure fieldset exists
		if ( ! $fieldset->loaded())
			throw new Kohana_Exception('Could not find fieldset [:fieldset].', array(':fieldset' => $this->settings['fieldset']));

		// setup view
		$view = View::factory('module/fieldset/list/'.$this->settings['template'])
		->set('items', $fieldset->items->find_all())
		->set('fields', $fieldset->fields());

		return $view;
	}

} // End Prime Module HTML