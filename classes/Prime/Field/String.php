<?php defined('SYSPATH') or die('No direct script access.');
/**
 * ### String Field
 * Field input with text input in one line (<input/>)
 *
 * Parameter | Options                          | Default value
 * ----------| ---------------------------------| -------------
 * type      | string (text,url,date,etc.)      | text
 * hidden    | boolean                          | false
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_String extends Prime_Field {

	/**
	 * @var string Template to show field as input
	 */
	protected $_input_view = 'Prime/Field/String';

	/**
	 * Field fields
	 *
	 * @return void
	 */
	public function params()
	{
		return array(
			array(
				'name'    => 'type',
				'caption' => 'Type',
				'field'   => 'Prime_Field_Choose',
				'default' => 'text',
				'options' => array(
					'items' => array(
						'text'     => 'Text',
						'number'   => 'Number',
						'datetime' => 'Datetime',
						'date'     => 'Date',
						'time'     => 'Time',
						'color'    => 'Color',
						'email'    => 'Email',
						'url'      => 'URL',
						'tel'      => 'Tel'
					)
				)
			)
		);
	}
}