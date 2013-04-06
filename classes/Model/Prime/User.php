<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime User Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_User extends Model_Auth_User {

	/**
	 * Has many relationships
	 * @var array
	 */
	protected $_has_many = array(
		'prime_user_tokens' => array('model' => 'Prime_User_Token'),
		'prime_roles'       => array('model' => 'Prime_Role', 'through' => 'prime_roles_users'),
	);

} // End Prime User Model