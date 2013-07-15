<?php defined('SYSPATH') or die('No direct script access.');

// Cookie setup
Cookie::$salt = 'Salt me';
Cookie::$expiration = Date::WEEK;

// Required modules
$required = array(
	'media'     => MODPATH.'media',
	'prime'     => MODPATH.'prime',
	'auth'      => MODPATH.'auth',
	'cache'     => MODPATH.'cache',
	'database'  => MODPATH.'database',
	'image'     => MODPATH.'image',
	'orm'       => MODPATH.'orm'
);

// Lazy-load modules
Kohana::modules($required);

// Initialize Prime
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
		'controller' => 'Dashboard',
		'action'     => 'index',
	));

// Web routing
Route::set('Prime_Web', '<query>', array('query' => '.*'))
	->defaults(array(
		'directory'  => 'Prime',
		'controller' => 'Frontend',
		'action'     => 'process'
	));
