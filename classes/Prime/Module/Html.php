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

	/**
	 * @var Boolean WYSIWYG
	 */
	public $wysiwyg = TRUE;

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
					'name'    => 'content',
					'caption' => 'Content',
					'field'   => 'Prime_Field_String',
					'default' => '',
				],
				[
					'name'    => 'editor_type',
					'caption' => 'Editor type',
					'field'   => 'Prime_Field_Choose',
					'default' => 'wysiwyg',
					'options' => [
						'items' => [
							'wysiwyg' => 'WYSIWYG',
							'plaintext' => 'Plain text'
						]
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
						'directory' => 'module/html'
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
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'icon-pencil']).'></i>', [
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

} // End Prime Module HTML