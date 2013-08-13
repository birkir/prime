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
	 * A user has many tokens and roles
	 *
	 * @var array Relationhips
	 */
	protected $_has_many = [
		'prime_user_tokens' => array('model' => 'Prime_User_Token'),
		'prime_roles'       => array('model' => 'Prime_Role', 'through' => 'prime_roles_prime_users'),
	];

	public function rules()
	{
	    return [
	        'password' => [
	            ['not_empty'],
	        ],
	        'email' => [
	            ['not_empty'],
	            ['email'],
	            [[$this, 'unique'], ['email', ':value']],
	        ],
	    ];
	}

} // End Prime User Model