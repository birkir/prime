<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset Insert
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Fieldset
 * @category Prime
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
		return array
		(
			'fieldset' => array
			(
				'name'  => 'Fieldset',
				'group' => 'General',
				'field' => 'Prime_Field_Fieldset'
			),
			'template' => array
			(
				'name'    => 'Template',
				'group'   => 'Layout',
				'field'   => 'Prime_Field_Template',
				'properties' => array(
					'scope' => 'module/fieldset/insert'
				),
				'default' => 'default'
			)
		);
	}

	/**
	 * Capture post from request
	 * 
	 * @param  ORM    $fieldset Fieldset object
	 * @return bool
	 */
	public function post($fieldset)
	{
		// get post from request
		$data = Request::current()->post();

		// check for correct action and id
		if ($data['action'] === 'fieldset-insert' AND $data['fieldset-id'] === $fieldset->id)
		{
			// setup result buffer
			$res = array();

			// loop though fields for processing
			foreach ($fieldset->fields->order_by('index', 'ASC')->find_all() as $field)
			{
				// if field exists
				if (isset($data['field'.$field->id]))
				{
					// push field data to result buffer
					$res[$field->name] = $data['field'.$field->id];
				}
			}

			// prepare item
			$item = array(
				'prime_module_fieldset_id' => $fieldset->id,
				'created' => date('Y-m-d H:i:s'),
				'updated' => date('Y-m-d H:i:s'),
				'data' => json_encode($res)
			);

			try
			{
				// save item for validation
				ORM::factory('Prime_Module_Fieldset_Item')
				->values($item)
				->save();
			}
			catch (Exception $e)
			{

			}
		}

		// did nothing by default
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
		if ( ! Kohana::find_file('views/module/fieldset/insert', $this->settings['template']))
		{
			$this->settings['template'] = 'default';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/fieldset/insert', $this->settings['template']))
		{
			// throw error
			Kohana::$log->add(Log::ERROR, 'Could not locate template for module [:template]', array(
				':template' => $this->settings['template']
			));

			return View::factory('Prime/Region/Error')
			->set('message', 'Could not locate template '.$this->settings['template']);
		}

		// setup view
		$view = View::factory('module/fieldset/insert/'.$this->settings['template'])
		->bind('fieldset', $fieldset)
		->bind('fields', $fields)
		->set('item', ORM::factory('Prime_Module_Fieldset_Item', Arr::get($_REQUEST, 'itemid')));

		// load fieldset item
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->settings['fieldset']);

		// post check
		$this->post($fieldset);

		// if fieldset was not loaded
		if ( ! $fieldset->loaded() OR $fieldset->type === 'category')
		{
			// return error view
			return View::factory('Prime/Region/Error')->set('message', 'Could not find fieldset.');
		}

		// get fields
		$fields = $fieldset->fields
		->order_by('group', 'ASC')
		->order_by('index', 'ASC')
		->find_all();

		// output view
		return $view;
	}

} // End Prime Module Fieldset Insert Class