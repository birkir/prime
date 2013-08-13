<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Role Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_Role extends Model_Auth_Role {

	// Relationships
	protected $_has_many = [
		'prime_users' => ['model' => 'Prime_User','through' => 'prime_roles_prime_users'],
	];

} // End Prime Role Model