<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Multiview
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Multiview
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_MultiView extends Prime_Module {

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
					'name'    => 'type',
					'caption' => 'Type',
					'field'   => 'Prime_Field_Choose',
					'default' => 'columns',
					'options' => [
						'items' => [
							'columns'   => 'Columns',
							'tabs'      => 'Tabs',
							'accordion' => 'Accordion'
						]
					]
				],
				[
					'name'    => 'views',
					'caption' => 'View names',
					'field'   => 'Prime_Field_String',
					'default' => 'span6, span6',
					'options' => [
						'placeholder' => 'ex. tab1, tab2'
					]
				],
				[
					'name'    => 'classes',
					'caption' => 'Extra classes',
					'field'   => 'Prime_Field_String',
					'default' => '',
					'options' => [
						'placeholder' => 'ex. row-fluid, tabs-left'
					]
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/multiview'
					]
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
		// check if view exists
		if ( ! Kohana::find_file('views/module/multiview', $this->settings['template']))
		{
			// throw some errors
			throw new Kohana_Exception('Could not find view :view', array(':view' => $this->settings['template']));
		}

		// setup view
		$view = View::factory('module/multiview/'.$this->settings['template'])
		->bind('items', $items)
		->set('options', $this->settings)
		->set('region', $this->_region->id);

		// split view names
		$views = explode(',', $this->settings['views']);

		// get page region class
		$regions = new Prime_Region;

		// create items array
		$items = [];

		foreach ($views as $i => $v)
		{
			$item = [
				'name'   => UTF8::trim($v),
				'id'     => $i,
				'region' => implode('_', [$this->_region->name, $this->_region->id, $i]),
			];

			$_regions = ORM::factory('Prime_Region')
			->where('name', '=', $item['region'])
			->find_all();

			foreach ($_regions as $region)
			{
				$regions->attach($region);
			}

			$item['view'] = $regions->{$item['region']};

			$items[] = $item;
		}

		// dump juice
		return $view;
	}

} // End Prime Module Multiview Class