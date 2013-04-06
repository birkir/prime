<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Fieldset Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Fieldset extends Prime_Field {

	/**
	 * Field name definition
	 * @var string
	 */
	public $name = 'Fieldset';

	/**
	 * Generate flat tree
	 * @param  ORM
	 * @return array
	 */
	public static function tree($fieldset = NULL, $level = 1)
	{
		// setup orm
		$items = ORM::factory('Prime_Module_Fieldset')
		->where('parent_id', ($fieldset === NULL ? 'IS' : '='), $fieldset)
		->where('deleted', '=', 0)
		->order_by('type', 'DESC')
		->order_by('name', 'ASC')
		->find_all()
		->as_array();

		$ret = array();

		foreach ($items as $i => $item)
		{
			$node = $item->as_array();

			$node['level'] = $level;

			$node['tree'] = str_repeat('│', $level - 1);

			if ($i === count($items) - 1 AND count($items) > 1)
			{
				$node['tree'] .= '└';
			}
			else
			{
				$node['tree'] .= '├';
			}

			if ($node['type'] === 'category')
			{
				$node['tree'] .= '**';
			}

			$children = self::tree($item->id, $level + 1);

			if ($node['type'] === 'fieldset' OR $node['type'] === 'category' AND count($children) > 0)
			{
				$ret[] = $node;
			}

			$ret = Arr::merge($ret, $children);
		}

		return $ret;
	}

	public static function select()
	{
		// items buffer
		$items = array();

		// get page tree
		$tree = self::tree();

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
		$view = View::factory('Prime/Field/Fieldset')
		->set('name', $this->field['key'])
		->set('caption', $this->field['name'])
		->set('value', $this->value())
		->set('items', self::select());

		return $view;
	}

} // End Field Fieldset Class