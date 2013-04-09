<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Embed
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Embed
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Embed extends Prime_Module {

	/**
	 * Parameters to configure module
	 * 
	 * @return array
	 */
	public function params()
	{
		return array
		(
			'url' => array
			(
				'name'        => 'Url',
				'group'       => 'General',
				'field'       => 'Prime_Field_String',
				'default'     => '',
				'placeholder' => 'ex. google.com/?q=:search'
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
		// check if view exists
		if ( ! Kohana::find_file('views/module/embed', 'default'))
		{
			// throw some errors
			throw new Kohana_Exception('Could not find view :view', array(':view' => 'default'));
		}

		// setup view
		$view = View::factory('module/embed/default')
		->bind('attributes', $attributes);

		// get query string
		$url = Arr::get($this->settings, 'url', NULL);

		// replace :keys with query string equivant
		foreach (Request::current()->query() as $key => $value)
		{
			$url = str_replace($url, ':'.$key, $value);
		}

		// remove all short keys
		$url = preg_replace('/\:[a-z]{1,64}/i', '', $url);

		// setup iframe attributes
		$attributes = array(
			'url'         => $url,
			'frameborder' => '0',
			'style'       => 'width: 100%; min-height: 200px; border: 0;'
		);

		// dump view
		return $view;
	}

} // End Prime Module Embed Class