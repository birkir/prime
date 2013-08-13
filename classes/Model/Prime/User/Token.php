<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime User Token Model
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Model
 * @copyright (c) 2013 SOLID Productions
 */
class Model_Prime_User_Token extends Model_Auth_User_Token {

	// Relationships
	protected $_belongs_to = [
		'prime_user' => ['model' => 'Prime_User'],
	];

	public function create(Validation $validation = NULL)
	{
		$this->token = $this->create_token();

		echo Debug::vars($this);

		return parent::create($validation);
	}


	protected function create_token()
	{
		do
		{
			$token = sha1(uniqid(Text::random('alnum', 32), TRUE));
		}
		while (ORM::factory('Prime_User_Token', array('token' => $token))->loaded());

		return $token;
	}

} // End Prime User Token Model