<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Auth Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Auth extends Kohana_Auth_ORM {

	public static function instance()
	{
		$config = Kohana::$config->load('auth');

	    Prime_Auth::$_instance = new Prime_Auth($config);
	 
	    return Prime_Auth::$_instance;
	}


	public function get_user($default = NULL)
	{
	    $user = $this->_session->get($this->_config['session_key'], $default);

	    if ($user === $default)
	    {
	        // check for "remembered" login
	        if (($user = $this->auto_login()) === FALSE)
	            return $default;
	    }
	 
	    return $user;
	}

	public function auto_login()
	{
	    if ($token = Cookie::get('authautologin'))
	    {
	        // Load the token and user
	        $token = ORM::factory('Prime_User_Token', array('token' => $token));
	 
	        if ($token->loaded() AND $token->user->loaded())
	        {
	            if ($token->user_agent === sha1(Request::$user_agent))
	            {
	                // Save the token to create a new unique token
	                $token->save();
	 
	                // Set the new token
	                Cookie::set('authautologin', $token->token, $token->expires - time());
	 
	                // Complete the login with the found data
	                $this->complete_login($token->user);
	 
	                // Automatic login was successful
	                return $token->user;
	            }
	 
	            // Token is invalid
	            $token->delete();
	        }
	    }
	 
	    return FALSE;
	}


	public function force_login($user, $mark_session_as_forced = FALSE)
	{
	    if ( ! is_object($user))
	    {
	        $username = $user;
	 
	        // Load the user
	        $user = ORM::factory('Prime_User');
	        $user->where($user->unique_key($username), '=', $username)->find();
	    }

	 	parent::force_login($user, $mark_session_as_forced);
	}


	public function logged_in($role = NULL)
	{
	    // Get the user from the session
	    $user = $this->get_user();
	 
	    if ( ! $user)
	        return FALSE;
	 
	    if ($user instanceof Model_Prime_User AND $user->loaded())
	    {
	        // If we don't have a roll no further checking is needed
	        if ( ! $role)
	            return TRUE;
	 
	        if (is_array($role))
	        {
	            // Get all the roles
	            $roles = ORM::factory('Prime_Role')
	                        ->where('name', 'IN', $role)
	                        ->find_all()
	                        ->as_array(NULL, 'id');
	 
	            // Make sure all the roles are valid ones
	            if (count($roles) !== count($role))
	                return FALSE;
	        }
	        else
	        {
	            if ( ! is_object($role))
	            {
	                // Load the role
	                $roles = ORM::factory('Prime_Role', array('name' => $role));
	 
	                if ( ! $roles->loaded())
	                    return FALSE;
	            }
	        }
	 
	        return $user->has('roles', $roles);
	    }
	}

	public function logout($destroy = FALSE, $logout_all = FALSE)
	{
	    // Set by force_login()
	    $this->_session->delete('auth_forced');
	 
	    if ($token = Cookie::get('authautologin'))
	    {
	        // Delete the autologin cookie to prevent re-login
	        Cookie::delete('authautologin');
	 
	        // Clear the autologin token from the database
	        $token = ORM::factory('Prime_User_Token', array('token' => $token));
	 
	        if ($token->loaded() AND $logout_all)
	        {
	            // Delete all user tokens. This isn't the most elegant solution but does the job
	            $tokens = ORM::factory('Prime_User_Token')->where('prime_user_id','=',$token->user_id)->find_all();
	             
	            foreach ($tokens as $_token)
	            {
	                $_token->delete();
	            }
	        }
	        elseif ($token->loaded())
	        {
	            $token->delete();
	        }
	    }
	 
	    return parent::logout($destroy);
	}

	public function password($user)
	{
	    if ( ! is_object($user))
	    {
	        $username = $user;
	 
	        // Load the user
	        $user = ORM::factory('Prime_User');
	        $user->where($user->unique_key($username), '=', $username)->find();
	    }
	 
	    return $user->password;
	}


	protected function _login($user, $password, $remember)
	{
	    if ( ! is_object($user))
	    {
	        $username = $user;

	        // Load the user
	        $user = ORM::factory('Prime_User');
	        $user->where($user->unique_key($username), '=', $username)->find();
	    }
	 
	    if (is_string($password))
	    {
	        // Create a hashed password
	        $password = $this->hash($password);
	    }
	 
	    // If the passwords match, perform a login
	    if ($user->has('prime_roles', ORM::factory('Prime_Role', array('name' => 'login'))) AND $user->password === $password)
	    {
	        if ($remember === TRUE)
	        {
	            // Token data
	            $data = array(
	                'prime_user_id'    => $user->pk(),
	                'expires'    => time() + $this->_config['lifetime'],
	                'user_agent' => sha1(Request::$user_agent),
	            );
	 
	            // Create a new autologin token
	            $token = ORM::factory('Prime_User_Token')
	                        ->values($data)
	                        ->create();
	 
	            // Set the autologin cookie
	            Cookie::set('authautologin', $token->token, $this->_config['lifetime']);
	        }
	 
	        // Finish the login
	        $this->complete_login($user);
	 
	        return TRUE;
	    }
	 
	    // Login failed
	    return FALSE;
	}
}