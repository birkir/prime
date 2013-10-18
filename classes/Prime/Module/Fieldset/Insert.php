<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Insert
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Fieldset
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Fieldset_Insert extends Prime_Module {

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
					'field'   => 'Prime_Field_String',
					'default' => '',
				],
				[
					'name'    => 'submit_url',
					'caption' => 'URL after submit',
					'field'   => 'Prime_Field_String',
					'default' => ''
				],
				[
					'name'    => 'enable_editing',
					'caption' => 'Enable editing',
					'field'   => 'Prime_Field_Boolean',
					'default' => FALSE
				],
				[
					'name'    => 'enable_partial',
					'caption' => 'Enable partial editing',
					'field'   => 'Prime_Field_Boolean',
					'default' => FALSE
				],
				[
					'name'    => 'owner_editable',
					'caption' => 'Only owner can edit',
					'field'   => 'Prime_Field_Boolean',
					'default' => TRUE
				]
			],
			'E-Mail' => [
				[
					'name'    => 'email_from_address',
					'caption' => 'From Address',
					'field'   => 'Prime_Field_String',
					'default' => ''
				],
				[
					'name'    => 'email_to_address',
					'caption' => 'To Address',
					'field'   => 'Prime_Field_String',
					'default' => ''
				],
				[
					'name'    => 'email_subject',
					'caption' => 'Subject',
					'field'   => 'Prime_Field_String',
					'default' => ''
				],
				[
					'name'    => 'email_template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'default',
					'options' => ['directory' => 'module/fieldset/email']
				],
				[
					'name'    => 'enable_email',
					'caption' => 'Send E-Mail',
					'field'   => 'Prime_Field_Boolean',
					'default' => FALSE
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'default',
					'options' => ['directory' => 'module/fieldset/insert']
				]
			]
		];
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/fieldset/insert/', $this->settings['template']))
		{
			$this->settings['template'] = 'default';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/fieldset/insert/', $this->settings['template']))
		{
			// throw some errors
			throw new Kohana_Exception('Could not find view :view', array(':view' => $this->settings['template']));
		}

		// Get fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->settings['fieldset']);

		// Make sure fieldset exists
		if ( ! $fieldset->loaded())
			throw new Kohana_Exception('Could not find fieldset :fieldset', array(':fieldset' => $this->settings['fieldset']));

		// setup view
		$view = View::factory('module/fieldset/insert/'.$this->settings['template'])
		->set('fieldset', $fieldset)
		->set('item', ORM::factory('Prime_Module_Fieldset_Item'))
		->set('fields', $fieldset->fields());

		return $view;
	}

} // End Prime Module HTML