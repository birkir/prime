<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Html
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Html
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Html extends Prime_Module {

	public static function factory($region)
	{
		return new Prime_Module_Html($region);
	}

	/**
	 * Parameters to configure module
	 * 
	 * @return array
	 */
	public function params()
	{
		return array
		(
			'name' => array
			(
				'name'  => 'Name',
				'group' => 'General',
				'field' => 'Prime_Field_String'
			),
			'content' => array
			(
				'name'  => 'Content',
				'group' => 'General',
				'field' => 'Prime_Field_String'
			),
			'editor_type' => array
			(
				'name'    => 'Editor type',
				'group'   => 'General',
				'field'   => 'Prime_Field_Choose',
				'properties' => array(
					'options' => array(
						'wysiwyg' => 'WYSIWYG',
						'plaintext' => 'Plain text'
					)
				),
				'default' => 'wysiwyg'
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
	 * Buttons to show in live mode
	 * 
	 * @return array
	 */
	public function live()
	{
		return Arr::merge(array
		(
			array
			(
				'name'   => __('Edit content'),
				'action' => 'prime.scope.module.html.edit('.$this->_region->id.');',
				'icon'   => 'pencil'
			)
		), parent::live());
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/html', $this->settings['template']))
		{
			$this->settings['template'] = 'default';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/html', $this->settings['template']))
		{
			// throw some errors
			throw new Kohana_Exception('Could not find view :view', array(':view' => $this->settings['template']));
		}

		// setup view
		$view = View::factory('module/html/'.$this->settings['template'])
		->bind('content', $content);

		// get content
		$content = Arr::get($this->settings, 'content', NULL);

		return $view;
	}

	/**
	 * Save settings
	 *
	 * @return void
	 */
	public function save(array $params = array())
	{
		return parent::save($params);
	}

} // End Prime/Module/HTML