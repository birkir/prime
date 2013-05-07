<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Website Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Website {

	public static function instance()
	{
		return new Prime_Website;
	}

	public function __construct()
	{
		return $this;
	}

	public function settings()
	{
		$settings = array();

		foreach (ORM::factory('Prime_Website')->find_all() as $item)
		{
			$settings[$item->key] = $item->value;
		}

		return $settings;
	}
}