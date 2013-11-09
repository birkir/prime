<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Template
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Template extends Prime_Field {

	/**
	 * @var string Template to show field as input
	 */
	protected $_input_view = 'Prime/Field/Template';

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
				$ori = $node;
				$node = UTF8::ucfirst(Inflector::humanize($node));
				$ret[$ori] = $node;
			}
		}

		return $ret;
	}

	public function save($str = NULL)
	{
		$str = str_replace($this->field['options']['directory'].'/', NULL, $str);

		return $str;
	}

	/**
	 * Overload as input method
	 *
	 * @param  ORM   Field object
	 * @param  array Error list
	 * @return View
	 */
	public function input($item, $errors = [])
	{
		// get parent view
		$view = parent::input($item, $errors);

		// set view templates list
		$view->templates = $this->tree(Kohana::list_files('views/'.Arr::get($view->options, 'directory', NULL)));

		// return view
		return $view;
	}


} // End Field Template