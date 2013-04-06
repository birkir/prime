<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset List
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Fieldset
 * @category Prime
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
		return array
		(
			'fieldset' => array
			(
				'name'  => 'Fieldset',
				'group' => 'General',
				'field' => 'Prime_Field_Fieldset'
			),
			'limit' => array
			(
				'name'  => 'Limit',
				'group' => 'General',
				'field' => 'Prime_Field_String'
			),
			'offset' => array
			(
				'name'  => 'Offset',
				'group' => 'General',
				'field' => 'Prime_Field_String'
			),
			'filter' => array
			(
				'name'  => 'Filter',
				'group' => 'General',
				'field' => 'Prime_Field_String'
			),
			'order' => array
			(
				'name'  => 'Order by',
				'group' => 'General',
				'field' => 'Prime_Field_String'
			),
			'template' => array
			(
				'name'    => 'Template',
				'group'   => 'Layout',
				'field'   => 'Prime_Field_Template',
				'properties' => array(
					'scope' => 'module/html'
				),
				'default' => 'default'
			)
		);
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/fieldset/list', $this->settings['template']))
		{
			$this->settings['template'] = 'default';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/fieldset/list', $this->settings['template']))
		{
			// throw error
			Kohana::$log->add(Log::ERROR, 'Could not locate template for module [:template]', array(
				':template' => $this->settings['template']
			));

			return View::factory('Prime/Region/Error')
			->set('message', 'Could not locate template '.$this->settings['template']);
		}

		// setup view
		$view = View::factory('module/fieldset/list/'.$this->settings['template'])
		->bind('items', $items)
		->bind('fields', $fields)
		->bind('fieldset', $fieldset);

		// load fieldset item
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->settings['fieldset']);

		// if fieldset was not loaded
		if ( ! $fieldset->loaded() OR $fieldset->type === 'category')
		{
			// return error view
			return View::factory('Prime/Region/Error')->set('message', 'Could not find fieldset.');
		}

		// get fields
		$fields =  $fieldset->fields->order_by('index', 'ASC')->find_all(); 

		// arrat for items
		$items = array();

		// loop through items
		foreach ($fieldset->items->find_all() as $i => $item)
		{
			// get item data as array
			$data = json_decode($item->data, TRUE);

			// loop through fields
			foreach ($fields as $field)
			{
				$items[$i][$field->name] = $data[$field->name];
			}
		}

		// output view
		return $view;
	}

} // End Prime Module Fieldset List Class