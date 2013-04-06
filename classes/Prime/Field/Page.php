<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Page Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Page extends Prime_Field {

	/**
	 * Field name definition
	 * @var string
	 */
	public $name = 'Page';

	/**
	 * Generate flat tree
	 * @param  ORM
	 * @return array
	 */
	public static function tree($page = NULL, $level = 1)
	{
		// setup orm
		$items = ORM::factory('Prime_Page')
		->where('parent_id', ($page === NULL ? 'IS' : '='), $page)
		->where('deleted', '=', 0)
		->order_by('index', 'ASC')
		->find_all()
		->as_array();

		$ret = array();

		foreach ($items as $i => $item)
		{
			$node = $item->as_array();

			$node['level'] = $level;

			$node['tree'] = str_repeat('│', $level);

			if ($i === count($items) - 1)
			{
				$node['tree'] .= '└';
			}
			else
			{
				$node['tree'] .= '├';
			}

			$ret[] = $node;

			$ret = Arr::merge($ret, self::tree($item->id, $level + 1));
		}

		return $ret;
	}

	public static function select()
	{
		// items buffer
		$items = array();

		// get page tree
		$tree = self::tree();

		$items[0] = '┌ Website';

		// loop through nodes
		foreach ($tree as $i => $node)
		{
			// push node to items buffer
			$items[$node['id']] = $node['tree'].' '.$node['name'];
		}

		// return items buffer
		return $items;
	}

	/**
	 * Fieldset render method
	 * 
	 * @return View
	 */
	public function render()
	{
		// setup view
		$view = View::factory('Prime/Field/Page')
		->set('name', $this->field['key'])
		->set('caption', $this->field['name'])
		->set('value', $this->value())
		->set('pages', self::select());

		return $view;
	}

} // End Field Page Class