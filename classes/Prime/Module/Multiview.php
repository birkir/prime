<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Multiview
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Multiview
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Multiview extends Prime_Module {

	/**
	 * Parameters to configure module
	 * 
	 * @return array
	 */
	public function params()
	{
		return array
		(
			'views' => array
			(
				'name'        => 'View names',
				'group'       => 'General',
				'field'       => 'Prime_Field_String',
				'default'     => 'span6, span6',
				'placeholder' => 'ex. tab1,tab2'
			),
			'classes' => array
			(
				'name'        => 'Extra classes',
				'group'       => 'General',
				'field'       => 'Prime_Field_String',
				'placeholder' => 'ex. row-fluid, tabs-left'
			),
			'template' => array
			(
				'name'    => 'Template',
				'group'   => 'Layout',
				'field'   => 'Prime_Field_Template',
				'properties' => array(
					'scope' => 'module/multiview'
				),
				'default' => 'grid'
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
		if ( ! Kohana::find_file('views/module/multiview', $this->settings['template']))
		{
			$this->settings['template'] = 'grid';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/multiview', $this->settings['template']))
		{
			// throw some errors
			throw new Kohana_Exception('Could not find view :view', array(':view' => $this->settings['template']));
		}

		// setup view
		$view = View::factory('module/multiview/'.$this->settings['template'])
		->bind('items', $items)
		->set('classes', $this->settings['classes'])
		->set('region', $this->_region->id);

		// split view names
		$views = explode(',', $this->settings['views']);

		$region = Prime_Region::instance();

		$items = array();

		foreach ($views as $i => $_view)
		{
			$tmp = array();

			$tmp['name'] = UTF8::trim($_view);
			$tmp['id'] = $i;
			$tmp['region'] = implode('_', array($this->_region->name, $this->_region->id, $tmp['id']));
			$tmp['unique'] = sha1($tmp['region'].$tmp['id']);

			$regions = ORM::factory('Prime_Region')
			->where('name', '=', $tmp['region'])
			->where('prime_region.deleted', '=', 0)
			->order_by('index', 'ASC')
			->find_all();

			foreach ($regions as $_region)
			{
				$region->attach($_region);
			}

			$tmp['view'] = $region->{$tmp['region']};

			$items[] = $tmp;
		}

		// dump juice
		return $view;
	}

} // End Prime Module Multiview Class