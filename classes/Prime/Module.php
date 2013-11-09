<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module {

	/**
	 * @var ORM Region container
	 */
	public $_region;

	/**
	 * @var object Merged settings with default values
	 */
	public $settings;

	/**
	 * Factory
	 *
	 * @return Prime_Module
	 */
	public static function factory($region)
	{
		// get called class name
		$class_name = get_called_class();

		// return new instance of class
		return new $class_name($region);
	}

	/**
	 * Module constructor
	 * 
	 * @param ORM $region
	 * @return self
	 */
	public function __construct($region)
	{
		// set region global
		$this->_region = $region;

		// get defaults
		$this->settings = [];

		// add params to settings array
		foreach ($this->params() as $group)
		{
			foreach ($group as $name => $param)
			{
				$this->settings[$param['name']] = isset($param['default']) ? $param['default'] : NULL;
			}
		}

		// decode settings json
		try
		{
			$this->settings = Arr::merge($this->settings, json_decode($region->settings, TRUE));
		}
		catch (Exception $e)
		{
			Kohana::$log->add(Log::ERROR, 'Could not decode settings for region item [:region].', array(
				':region' => $region->id
			));
		}

		// singleton
		return $this;
	}

	/**
	 * Generate attributes for view render
	 *
	 * @param  string $name
	 * @return array
	 */
	public function attrs($name = NULL)
	{
		switch ($name)
		{
			case 'dropzone_a':
				return ['class' => 'prime-drop prime-drop-above', 'style' => 'display: none;'];
			case 'dropzone_b':
				return ['class' => 'prime-drop prime-drop-below', 'style' => 'display: none;'];
			case 'actions':
				return ['class' => 'prime-region-actions', 'style' => 'display: none;'];
			case 'content':
				return ['class' => 'prime-region-item-content'];
		};

		return [];
	}

	/**
	 * Check url for internal module route
	 * 
	 * @return boolean
	 */
	public function route($uri = NULL)
	{
		return FALSE;
	}

	/**
	 * Actions to show in live mode, modules should extend this function.
	 * 
	 * @return array
	 */
	public function actions()
	{
		return [
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'fa fa-wrench']).'></i>', [
				'onclick' => 'window.top.prime.page.region.settings('.$this->_region->id.'); return false;'
			]),
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'fa fa-move']).'></i>', [
				'onclick' => 'return false;',
				'class' => 'move-handle'
			]),
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'fa fa-trash-o']).'></i>', [
				'onclick' => 'window.top.prime.page.region.remove('.$this->_region->id.'); return false;'
			])
		];
	}

	/**
	 * Defaults to no params
	 *
	 * @return array
	 */
	public function params()
	{
		return array();
	}

	/**
	 * Get module settings option
	 *
	 * @param string Option name
	 * @param mixed  Default
	 * @return mixed
	 */
	public function option($option, $default = NULL)
	{
		// find option in settings
		return Arr::get($this->settings, $option, $default);
	}

	/**
	 * Find and load a module view in specific directory
	 *
	 * @param string Directory path
	 * @param string Template
	 * @param string Fallback
	 * @return View
	 */
	public function load_view($directory = NULL, $template = NULL, $fallback = 'standard')
	{
		// set default template if template not found.
		if ( ! Kohana::find_file('views/'.$directory, $template))
		{
			if ( ! Kohana::find_file('views/'.$directory, 'standard'))
			{
				throw new Kohana_Exception('Could not find view [:view] or [:fallback]', array(
					':view'     => $template,
					':fallback' => $fallback
				));
			}

			$template = $fallback;
		}

		// return template
		return View::factory($directory.'/'.$template);
	}

	/**
	 * Process $_POST list to acceptable JSON data and update Model
	 *
	 * @param array Parameters
	 * @return string
	 */
	public function save(array $params = NULL)
	{
		if ($params)
		{
			// loop through module params
			foreach ($this->params() as $group => $fields)
			{
				foreach ($fields as $field)
				{
					if (isset($params[$field['name']]))
					{
						// call field
						$class = call_user_func_array(array($field['field'], 'factory'), array($field));

						// process its save state
						$this->settings[$field['name']] = $class->save($params[$field['name']]);
					}
				}
			}
		}

		// update settings item
		$this->_region->settings = json_encode($this->settings);

		// save region
		$this->_region->save();
	}

	public function output_for_web()
	{
		$output = NULL;

		try {
			$output = $this->render();
		}
		catch (Kohana_Exception $e)
		{
			$output = '<pre>'.__('Error loading module').':'.$e->getMessage().'</pre>';
		}

		return $output;
	}

} // End Prime Module