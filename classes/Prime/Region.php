<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Region Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Region {

	/**
	 * @var array Contain all template region items
	 */
	private $items = array();

	/**
	 * @var boolean Sticky or not
	 */
	protected $_sticky = FALSE;

	/**
	 * Class constructor, singleton method
	 *
	 * @return self
	 */
	public function __construct()
	{
		return $this;
	}

	public function sticky()
	{
		$this->_sticky = TRUE;
	}

	/**
	 * Attach region to template region container
	 * 
	 * @param  Model_Prime_Region $item Region to attach
	 * @return self
	 */
	public function attach($item = NULL)
	{
		if ( ! isset($this->items[$item->name]))
		{
			// Create array instance
			$this->items[$item->name] = array();
		}

		// Attach module to region
		$this->items[$item->name][$item->id] = $item->module();

		return $this;
	}

	/**
	 * Overload get method and return new Item Loop View with
	 * all region items.
	 *
	 * @param  string $name Name of region to get
	 * @return View
	 */
	public function __get($name)
	{
		return View::factory('Prime/Region/Wrap')
		->set('items', isset($this->items[$name]) ? $this->items[$name] : array())
		->set('name', $name)
		->set('sticky', $this->_sticky === TRUE ? 1 : 0);
	}

} // End Prime Region