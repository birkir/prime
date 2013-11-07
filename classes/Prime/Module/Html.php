<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Html
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Html
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Html extends Prime_Module {

	/**
	 * Extend attributes for output
	 *
	 * @param string $name
	 * @return array 
	 */
	public function attrs($name = NULL)
	{
		$attrs = parent::attrs($name);

		if ($name === 'content' AND $this->option('editor_type', 'plaintext') === 'wysiwyg')
		{
			$attrs['contenteditable'] = 'true';
		}

		return $attrs;
	}

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
					'field'   => 'Prime_Field_Text',
					'default' => '',
					'options' => [
						'hidden' => TRUE
					]
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
	 * Process $_POST list to acceptable JSON data and update Model
	 *
	 * @param array Parameters
	 * @return string
	 */
	public function save(array $params = NULL)
	{
		// never save content
		unset($params['content']);

		return parent::save($params);
	}

	/**
	 * Buttons to show in live mode
	 * 
	 * @return array
	 */
	public function actions()
	{
		return Arr::merge([
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'fa fa-pencil']).'></i>', [
				'onclick' => 'window.top.prime.page.module.html('.$this->_region->id.'); return false;'
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
		$view = self::load_view('module/html', self::option('template'))
		->set('content', self::option('content'));

		return $view;
	}

} // End Prime Module HTML