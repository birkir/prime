<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Resource
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module/Resource
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Resource extends Prime_Module {

	/**
	 * Parameters to configure module
	 * 
	 * @return array
	 */
	public function params()
	{
		return array
		(
			'url' => array
			(
				'name'  => 'Url',
				'group' => 'General',
				'field' => 'Prime_Field_String'
			),
			'request_timeout' => array
			(
				'name'  => 'Request timeout',
				'group' => 'General',
				'field' => 'Prime_Field_String',
				'default' => 2000
			),
			'cache_lifetime' => array
			(
				'name'  => 'Cache lifetime',
				'group' => 'General',
				'field' => 'Prime_Field_String',
				'default' => 600
			),
			'username' => array
			(
				'name'    => 'Username',
				'group'   => 'General',
				'field'   => 'Prime_Field_String'
			),
			'password' => array
			(
				'name'    => 'Password',
				'group'   => 'General',
				'field'   => 'Prime_Field_String'
			),
			'template' => array
			(
				'name'    => 'Template',
				'group'   => 'Layout',
				'field'   => 'Prime_Field_Template',
				'properties' => array(
					'scope' => 'module/html'
				),
				'default' => 'default'
			)
		);
	}

	/**
	 * Make resource request
	 * 
	 * @return void
	 */
	public function request()
	{
		// scope settings
		$settings = $this->settings;

		// setup request with client caching
		$request = Request::factory($settings['url'], array(
			'header_callbacks' => array
			(
				'www-authenticate' => function (Request $request, Response $response, Request_Client $client)
            	{
            		if ($client->callback_depth() === 1)
            		{
            			$request->client()->options(CURLOPT_USERPWD, $client->callback_params('username').':'.$client->callback_params('password'));

            			return $request;
            		}

            		return FALSE;
            	}
			),
			'callback_params' => array
			(
				'username' => $settings['username'],
				'password' => $settings['password']
			)
		));

		// set maximum timeout
		$request->client()->options(CURLOPT_TIMEOUT_MS, $settings['request_timeout']);

		try
		{
			// execute the request
			$response = $request->execute();

			// request responded with json data
			if ($response->headers('content-type') === 'application/json')
			{
				// json encode the data
				return json_decode($response->body());
			}

			// request responded with xml data
			if ($response->headers('content-type') === 'application/xml')
			{
				return new SimpleXMLElement($response->body());
			}

			// possible csv ?
			if ($response->headers('content-type') === 'text/plain')
			{
				// variable
				$data = $response->body();
				$delimiter = ',';
				$last = 0;

				// get lines in document
				$lines = explode("\n", UTF8::trim($data));

				// detect delimiter
				foreach (array(';', '|', "\t") as $delimit)
				{
					// count occurances of delimiter
					$count = substr_count($lines[0], $delimit);
					if ($last > $count) $delimiter = $delimit;
				}

				// loop through lines
				foreach ($lines as $i => $line)
				{
					// delimit line
					$cols = explode($delimiter, UTF8::trim($line));

					// setup keys if first row
					if ($i === 0)
						$keys = $cols;						
					else
						if ( ! is_array($data))
							$data = array();
						else
							$data[] = array_combine($keys, $cols);
				}

				// return array
				return $data;
			}

			// cant do anything with the response
			return $response->body();
		}
		catch (Request_Exception $e)
		{
			// log error
			Kohana::$log->add(Log::EMERGENCY, 'Could not access resource '.$settings['url'], NULL, array('exception' => $e));

			// return error message
			return 'Could not access resource. '.$e->getMessage();
		}
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/resource', $this->settings['template']))
		{
			$this->settings['template'] = 'default';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/resource', $this->settings['template']))
		{
			// throw error
			Kohana::$log->add(Log::ERROR, 'Could not locate template for module [:template]', array(
				':template' => $this->settings['template']
			));

			return View::factory('Prime/Region/Error')
			->set('message', 'Could not locate template '.$this->settings['template']);
		}

		// setup view
		$view = View::factory('module/resource/'.$this->settings['template'])
		->bind('data', $data);

		// setup cache
		$cache = Cache::instance();

		if (($data = $cache->get(sha1(json_encode($this->settings)))) === NULL)
		{
			// make request
			$data = $this->request();

			// cache request response
			$cache->set(sha1(json_encode($this->settings)), $data, $this->settings['cache_lifetime']);
		}

		// output view
		return $view;
	}

	/**
	 * Save settings
	 *
	 * @return void
	 */
	public function save(array $params = array())
	{
		return parent::save($params);
	}

} // End Prime/Module/HTML