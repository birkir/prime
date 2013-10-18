<?php defined('SYSPATH') or die('No direct script access.');
/**
 * User Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_User extends Model_Auth_User {

	/**
	 * A user has many tokens and roles
	 *
	 * @var array Relationhips
	 */
	protected $_has_many = [
		'user_tokens' => ['model' => 'User_Token'],
		'roles'       => ['model' => 'Role', 'through' => 'roles_users'],
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

} // End User Model