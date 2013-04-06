<?php defined('SYSPATH') or die('No direct script access.');

return array
(
	'file'  => array
	(
		'driver'             => 'file',
		'cache_dir'          => APPPATH.'cache/kohana',
		'default_expire'     => 3600,
	)
);