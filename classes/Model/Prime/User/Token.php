<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page User Token
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_User_Token extends Model_Auth_User_Token {

	/**
	 * Belongs to relationship
	 * @var array
	 */
	protected $_belongs_to = array(
		'user' => array(
			'model'       => 'Prime_User',
			'foreign_key' => 'prime_user_id'
		)
	);

	/**
	 * Create token method
	 * @return ORM
	 */
	protected function create_token()
	{
		do
		{
			// create unique token while not exist
			$token = sha1(uniqid(Text::random('alnum', 32), TRUE));
		}
		while (ORM::factory('Prime_User_Token', array('token' => $token))->loaded());

		// return token
		return $token;
	}

} // End Prime Page User Token