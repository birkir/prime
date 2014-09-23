<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field File
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_File extends Prime_Field {

	/**
	 * @var string Template to show field as input
	 */
	protected $_input_view = 'Prime/Field/File';

	/**
	 * Field fields
	 *
	 * @return void
	 */
	public function params()
	{
		return array(
			array(
				'name'    => 'allowed',
				'caption' => 'Allowed file types',
				'field'   => 'Prime_Field_String',
				'default' => '*.*'
			),
			array(
				'name'    => 'max_size',
				'caption' => 'Max file size',
				'field'   => 'Prime_Field_String',
				'default' => 10240,
				'options' => array(
					'suffix' => 'KiB'
				)
			),
			array(
				'name'    => 'folder',
				'caption' => 'Target folder',
				'field'   => 'Prime_Field_String',
				'default' => 'Uploaded'
			),
			array(
				'name'    => 'multiple',
				'caption' => 'Multiple',
				'field'   => 'Prime_Field_Boolean',
				'default' => FALSE
			)
		);
	}

	/**
	 * Process field for saving (and validating)
	 *
	 * @return string
	 */
	public function save($str = NULL)
	{
		/*
		// Get field name
		$name = Arr::get($this->field, 'name');

		if (isset($_FILES[$name]) AND Arr::get($this->field['options'], 'multiple', FALSE))
		{
			$filenames = [];
			$files = [];

			foreach ($_FILES[$name] as $key => $all)
			{
				foreach ($all as $i => $val)
				{
					$files[$i][$key] = $val;
				}
			}

			foreach ($files as $file)
			{
				if ($filename = Upload::save($file, NULL, APPPATH.'cache/uploads'))
				{
					$filenames[] = $filename;
				}
			}

			return $filenames;
		}

		if (isset($_FILES[$name]) AND $filename = Upload::save($_FILES[$name], NULL, APPPATH.'cache/uploads'))
		{
			// Get filename
			return $filename;
		}

		return NULL;
		*/

		return $str;
	}

	/**
	 * Display clean filename with anchor to image
	 *
	 * @param  string $item String to display
	 * @return string
	 */ 
	public function text($item)
	{
		$item = $this->value($item);

		if (Arr::get($this->field['options'], 'multiple'))
		{
			return count($item).' '.Inflector::singular('files', count($item));
		}
		else
		{
			// Get filepath
			$filepath = str_replace(APPPATH, NULL, $item);

			// Get filename
			$filename = substr($filepath, strrpos($filepath, '/') + 1);

			// Clean up uniqid
			$filename = substr($filename, 13);

			// Replace underscores with spaces
			$filename = str_replace('_', ' ', $filename);

			return HTML::anchor('application/'.$filepath, $filename, array('target' => '_blank'));
		}
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
		// Get parent view
		$view = parent::input($item, $errors);

		// return view
		return $view;
	}

}