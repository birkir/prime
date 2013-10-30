<?php defined('SYSPATH') or die('No direct script access.');

// Get Prime configuration
$prime = Kohana::$config->load('prime');

// Set cookie hash salt key
Cookie::$salt = (isset($prime->hashkey) ? $prime->hashkey : NULL).'cookie';
Cookie::$expiration = Date::WEEK;

// Initialize prime cms
Prime::init();

// Media file serving router
Route::set('media', 'media(/<file>)', array('file' => '.+'))
	->defaults(array(
		'controller' => 'Media',
		'action'     => 'serve',
		'file'       => NULL
	));

// Prime Module routing
Route::set('Prime_Module', '<prime>/<module>/(<controller>(/<action>(/<id>)))', array('id' => '.*'))
	->filter(function ($route, $params, $request) {

		// allow both lowercase and uppercase
		if (strtolower($params['prime']) === 'prime' AND strtolower($params['module']) !== 'module')
			return FALSE;

		return TRUE;
	})
	->defaults(array(
		'directory'  => 'Prime/Module',
		'controller' => '',
		'action'     => 'index',
	));

// Prime routing
Route::set('Prime', '<prime>(/<controller>(/<action>(/<id>)))', array('id' => '.*'))
	->filter(function ($route, $params, $request) {

		// allow both lowercase and uppercase
		if (strtolower($params['prime']) !== 'prime')
			return FALSE;

		return TRUE;
	})
	->defaults(array(
		'directory'  => 'Prime',
		'controller' => 'Page',
		'action'     => 'index',
	));

// Web routing
Route::set('Prime_Web', '<query>', array('query' => '.*'))
	->defaults(array(
		'directory'  => 'Prime',
		'controller' => 'Frontend',
		'action'     => 'process'
	));
