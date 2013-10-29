<?php defined('SYSPATH') or die('No direct script access.');

// Get Prime configuration
$prime = Kohana::$config->load('prime');

// Set cookie hash salt key
Cookie::$salt = (isset($prime->hashkey) ? $prime->hashkey : NULL).'cookie';
Cookie::$expiration = Date::WEEK;

// Initialize prime cms
Prime::init();

// Prime module routing
Route::set('Prime_Module', 'Prime/Module/(<controller>(/<action>(/<id>)))', array('id' => '.*'))
	->defaults(array(
		'directory'  => 'Prime/Module',
		'controller' => 'Dashboard',
		'action'     => 'index',
	));

// Prime routing
Route::set('Prime', 'Prime(/<controller>(/<action>(/<id>)))', array('id' => '.*'))
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
