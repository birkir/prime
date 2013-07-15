<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Page Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Field extends Controller_Prime_Template {

	/**
	 * @var boolean Auto render
	 */
	public $auto_render = FALSE;

	/**
	 * Lets get all of the fields...
	 **/
	private static function fields()
	{
		$fields = array();

		$files = Kohana::list_files('classes/Prime/Field');

		foreach ($files as $file => $path)
		{
			$file = substr($file, strlen('classes/'));
			$file = substr($file, 0, strlen($file) - 4);
			$file = str_replace('/', '_', $file);

			if (class_exists($file))
			{
				$field = call_user_func(array($file, 'factory'));
				$fields[$file] = $field->name;
			}
		}

		return $fields;
	}

	public function action_Detail()
	{
		$fields = ORM::factory('Prime_Field')
		->where('resource_id', '=', $this->request->param('id'))
		->where('resource_type', '=', $this->request->query('type'))
		->order_by('position', 'ASC')
		->find_all();

		$view = View::factory('Prime/Field/Editor/List')
		->set('fields', $fields)
		->set('resource_id', $this->request->param('id'));

		$this->response->body($view);
	}

	public function action_Create()
	{
		$view = View::factory('Prime/Field/Editor/Fieldset')
		->set('item', ORM::factory('Prime_Field'))
		->set('resource_id', $this->request->param('id'))
		->set('fields', self::fields());

		$this->response->body($view);
	}

	public function action_Edit()
	{
		$field = ORM::factory('Prime_Field', $this->request->param('id'));

		$view = View::factory('Prime/Field/Editor/Fieldset')
		->set('item', $field)
		->set('fields', self::fields());

		$this->response->body($view);
	}

	public function action_Reorder()
	{
		// node to move
		$item = ORM::factory('Prime_Field', $this->request->post('id'));

		// node to reference as above
		$ref = ORM::factory('Prime_Field', $this->request->post('ref'));

		// generate new position
		$new = $ref->loaded() ? $ref->position + ($item->position > $ref->position ? 1 : 0) : 0;

		// execute multi-query
		DB::update('prime_fields')
		->set(['position' => DB::expr('CASE `position` WHEN '.$item->position.' THEN '.$new.' ELSE `position` + SIGN('.($item->position - $new).') END')])
		->where('position', 'BETWEEN', DB::expr('LEAST('.$new.','.$item->position.') AND GREATEST('.$new.','.$item->position.')'))
		->where('resource_id', '=', $item->resource_id)
		->where('resource_type', '=', $item->resource_type)
		->execute();
	}

}