<?php defined('SYSPATH') or die('No direct script access.');

return array(
    'driver'       => 'ORM',
    'hash_method'  => 'sha256',
    'hash_key'     => 'ChangeMe',
    'lifetime'     => 1209600,
    'session_type' => Session::$default,
    'session_key'  => 'auth_user'
);