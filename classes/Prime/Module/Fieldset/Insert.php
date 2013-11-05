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
					'field'   => 'Prime_Field_Fieldset',
					'default' => '',
				],
				[
					'name'    => 'submit_page',
					'caption' => 'Page after submit',
					'field'   => 'Prime_Field_Page',
					'default' => ''
				],
				[
					'name'    => 'enable_editing',
					'caption' => 'Enable editing',
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
	 * Check url for internal module route
	 * 
	 * @return boolean
	 */
	public function route($uri = NULL)
	{
		if ( ! Arr::get($this->settings, 'enable_editing', FALSE))
			return FALSE;

		if (intval($uri) > 0)
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
		// scope settings
		$cfg = $this->settings;

		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/fieldset/insert/', $cfg['template']))
		{
			$cfg['template'] = 'default';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/fieldset/insert/', $cfg['template']))
		{
			// throw some errors
			throw new Kohana_Exception('Could not find view :view', array(':view' => $cfg['template']));
		}

		// Get fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $cfg['fieldset']);

		$item = ORM::factory('Prime_Module_Fieldset_Item');

		$errors = $post = [];

		$item_id = intval(Prime::$page_overload_uri);

		// Enable editing of items
		// -----------------------
		if (Arr::get($cfg, 'enable_editing', FALSE) AND $item_id > 0)
		{
			// find fieldset item
			$edit = ORM::factory('Prime_Module_Fieldset_Item')
			->where('id', '=', $item_id)
			->find();

			// make sure its in this fieldset
			if ($edit->prime_module_fieldset_id === $fieldset->id)
			{
				// assign default values
				$post = $edit->data;
			}
		}

		// Process post values
		// -------------------
		if (Request::current()->method() === HTTP_Request::POST)
		{
			$post = Request::current()->post();

			// make sure we are posting to correct fieldset
			if ($fieldset->id === Arr::get($post, 'fieldset_id', 0))
			{
				$data = [];

				// loop through fieldset fields
				foreach ($fieldset->fields() as $field)
				{
					$data[$field->name] = $field->field->prepare_value(Arr::get($post, $field->name, NULL));
				}

				// setup validation
				$validation = Validation::factory($data);

				// loop through fields (again)
				foreach ($fieldset->fields() as $field)
				{
					if ((bool) $field->required)
					{
						$validation->rule($field->name, 'not_empty');
					}
				}

				if ($validation->check())
				{
					// set item data
					$item->prime_module_fieldset_id = $fieldset->id;
					$item->data = json_encode($data);
					$item->save();

					// send mail if set
					if (Arr::get($cfg, 'enable_email', FALSE))
					{
						$email_template = Arr::get($cfg, 'email_template', 'default');

						if ( ! Kohana::find_file('views/module/fieldset/email', $email_template))
						{
							throw new Kohana_Exception('Could not find email view :view', array(':view' => $email_template));
						}

						$message = View::factory('module/fieldset/email/'.$email_template)
						->set('fieldset', $fieldset)
						->set('item', $data)
						->set('fields', $fieldset->fields());

						// send the email
						Prime::email(Arr::get($cfg, 'email_subject', 'No title'), $message, Arr::get($cfg, 'email_from_address'), Arr::get($cfg, 'email_to_address'));
					}

					// redirect if set
					if ( ! empty($cfg['submit_page']))
					{
						if ($page = ORM::factory('Prime_Page', $cfg['submit_page']))
						{
							header('Location: '.$page->uri());
						}
					}
				}
				else
				{
					$errors = $validation->errors('fieldset');
				}
			}
		}

		// Make sure fieldset exists
		if ( ! $fieldset->loaded())
			throw new Kohana_Exception('Could not find fieldset :fieldset', array(':fieldset' => $cfg['fieldset']));

		// setup view
		$view = View::factory('module/fieldset/insert/'.$cfg['template'])
		->set('fieldset', $fieldset)
		->set('item', $post)
		->set('errors', $errors)
		->set('fields', $fieldset->fields());

		return $view;
	}

} // End Prime Module HTML