<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Template Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Template extends Prime_Field {

	/**
	 * Field name definition
	 * @var string
	 */
	public $name = 'Template';

	/**
	 * List templates by scope
	 * 
	 * @param  string $scope Scope to find
	 * @return array
	 */
	public function tree($nodes, $level = 1)
	{
		$ret = array();

		foreach ($nodes as $i => $node)
		{
			if (is_array($node))
			{
				$ret = Arr::merge($ret, self::tree($node, $level + 1));
			}
			else
			{
				$node = str_replace(array(APPPATH, MODPATH, SYSPATH, '.php'), NULL, $node);
				$node = str_replace('prime/views/'.$this->field['properties']['scope'].'/', NULL, $node);
				$node = str_replace('views/'.$this->field['properties']['scope'].'/', NULL, $node);
				$ori = $this->field['properties']['scope'].'/'.$node;
				$node = UTF8::ucfirst(Inflector::humanize($node));
				$ret[$ori] = $node;
			}
		}

		return $ret;
	}

	/**
	 * Fieldset render method
	 *
	 * @return View
	 */
	public function render()
	{
		$templates = $this->tree(Kohana::list_files('views/'.$this->field['properties']['scope']));

		// setup view
		$view = View::factory('Prime/Field/Template')
		->set('field', $this->field)
		->set('name', $this->field['key'])
		->set('caption', $this->field['name'])
		->set('value', $this->value())
		->set('templates', $templates);

		return $view;
	}

} // End Field Template Class