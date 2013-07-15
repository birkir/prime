<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Template
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Template extends Prime_Field {

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
				$node = str_replace('prime/views/'.$this->field['options']['directory'].'/', NULL, $node);
				$node = str_replace('views/'.$this->field['options']['directory'].'/', NULL, $node);
				$ori = $this->field['options']['directory'].'/'.$node;
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
	public function as_input($form = 'form_', $item)
	{
		$templates = $this->tree(Kohana::list_files('views/'.$this->field['options']['directory']));

		// setup view
		$view = View::factory('Prime/Field/Template')
		->set('field', $this->field)
		->set('form', $form)
		->set('value', $this->value($item))
		->set('templates', $templates);

		return $view;
	}

} // End Field Template