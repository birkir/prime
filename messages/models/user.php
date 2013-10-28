<?php defined('SYSPATH') or die('No direct script access.');

return array(
    'email' => array(
        'unique' => 'This email address is already in use.',
    ),
    'password' => array(
        'not_empty' => 'You must provide a password.',
    ),
);