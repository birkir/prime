<?php defined('SYSPATH') or die('No direct script access.');

// Get Prime configuration
$prime = Kohana::$config->load('prime');

// Set cookie hash salt key
Cookie::$salt = (isset($prime->hashkey) ? $prime->hashkey : NULL).'cookie';
Cookie::$expiration = Date::WEEK;

// Initialize prime cms
Prime::init();

// Media file serving router
Route::set('Prime_Media', 'media(/<file>)', array('file' => '.+'))
	->defaults(array(
		'controller' => 'Media',
		'action'     => 'serve',
		'file'       => NULL
	));

// Prime Module routing
Route::set('Prime_Module', 'Prime/Module/(<controller>(/<action>(/<id>)))', array('id' => '.*'))
	->defaults(array(
		'directory'  => 'Prime/Module',
		'controller' => '',
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
	->filter(function ($route, $params, $request) {

		// Check for design mode
		Prime::$design_mode = Model_Prime::$_draft = ((Arr::get($_GET, 'mode') === 'design') AND Auth::instance()->logged_in('prime'));

		// Get mapped url
		$mapped = ORM::factory('Prime_Url', array('uri' => '/'.$params['query'].URL::query()));

		if ($mapped->loaded())
		{
			header('Location: ' . ( ! empty($mapped->redirect) ? $mapped->redirect : ORM::factory('Prime_Page', $mapped->prime_page_id)->uri()));
			exit;
		}

		// Get selected page
		$page = Prime::selected($request, $params['query']);

		if ( ! $page->loaded() OR ($page->disabled AND ! Prime::$design_mode))
		{
			return FALSE;
		}
	})
	->defaults(array(
		'directory'  => 'Prime',
		'controller' => 'Frontend',
		'action'     => 'process'
	));
