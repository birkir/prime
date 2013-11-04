<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Datasource
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Datasource
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Datasource extends Prime_Module {

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
					'name'    => 'url',
					'caption' => 'Datasource URL',
					'field'   => 'Prime_Field_String',
					'default' => '',
					'options' => [
						'type' => 'url'
					]
				],
				[
					'name'    => 'type',
					'caption' => 'Datasource type',
					'field'   => 'Prime_Field_Choose',
					'default' => 'json',
					'options' => [
						'items' => [
							'plain'   => 'Plain text',
							'json'    => 'JSON',
							'xml'     => 'XML',
							'csv'     => 'CSV'
						]
					]
				],
				[
					'name'    => 'cache_timeout',
					'caption' => 'Cache timeout',
					'field'   => 'Prime_Field_String',
					'default' => '10',
					'options' => [
						'type' => 'number'
					]
				],
				[
					'name'    => 'request_timeout',
					'caption' => 'Request timeout',
					'field'   => 'Prime_Field_String',
					'default' => '5000',
					'options' => [
						'type' => 'number'
					]
				]
			],
			'Authentication' => [
				[
					'name'    => 'auth_type',
					'caption' => 'Authentication type',
					'field'   => 'Prime_Field_Choose',
					'default' => 'no_auth',
					'options' => [
						'items' => [
							'no_auth' => 'No authentication',
							'http'    => 'HTTP Authentication',
							'oauth'   => 'OAuth 2.0'
						]
					]
				],
				[
					'name'    => 'auth_username',
					'caption' => 'Username / Client ID',
					'field'   => 'Prime_Field_String',
					'default' => ''
				],
				[
					'name'    => 'auth_password',
					'caption' => 'Password / Secret Key',
					'field'   => 'Prime_Field_String',
					'default' => ''
				],
				[
					'name'    => 'auth_config',
					'caption' => 'Auth config',
					'field'   => 'Prime_Field_Text',
					'default' => ''
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/datasource'
					]
				]
			]
		];
	}

	public function render()
	{
		$cfg = $this->settings;

		if (empty($cfg['url']))
			throw new Kohana_Exception('No url defined');

		if ( ! $response = Kohana::cache('module.datasource:'.$cfg['url'], NULL, (intval($cfg['cache_timeout']) * 60)) OR ! Prime::$nocache)
		{
			$response = Request::factory(Arr::get($cfg, 'url'))
			->execute()
			->body();

			Kohana::cache('module.datasource:'.$cfg['url'], $response);
		}

		if ($cfg['type'] === 'json')
		{
			$data = json_decode($response, TRUE);
		}

		if ($cfg['type'] === 'xml')
		{
			$data = new SimpleXMLElement($response);
		}

		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/datasource', $this->settings['template']))
		{
			$this->settings['template'] = 'standard';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/datasource', $this->settings['template']))
		{
			// throw some errors
			throw new Kohana_Exception('Could not find view :view', array(':view' => $this->settings['template']));
		}

		// setup view
		$view = View::factory('module/datasource/'.$this->settings['template'])
		->set('data', $data);

		return $view;
	}

}