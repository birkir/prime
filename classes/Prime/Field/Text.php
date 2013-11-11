<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Field Text
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Fields
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Field_Text extends Prime_Field {

	protected $_input_view = 'Prime/Field/Text';

	/**
	 * Field fields
	 *
	 * @return void
	 */
	public function params()
	{
		return array(
			array(
				'name'        => 'type',
				'caption'     => 'Type',
				'field'       => 'Prime_Field_Choose',
				'default'     => 'plaintext',
				'options'     => array(
					'items' => array(
						'plaintext' => 'Plain text',
						'wysiwyg'   => 'WYSIWYG'
					)
				)
			),
			array(
				'name'        => 'rows',
				'caption'     => 'Rows',
				'field'       => 'Prime_Field_String',
				'default'     => 3,
				'options'     => array(
					'type' => 'number'
				)
			)
		);
	}

}