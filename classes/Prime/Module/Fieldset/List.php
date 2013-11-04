<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Fieldset List
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Fieldset
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Fieldset_List extends Prime_Module {

	/**
	 * Parameters to configure module
	 * 
	 * @return array
	 */
	public function params()
	{
		return [
			'General' => [
				[
					'name'    => 'fieldset',
					'caption' => 'Fieldset',
					'field'   => 'Prime_Field_Fieldset',
					'default' => ''
				],
				[
					'name'    => 'detail_page',
					'caption' => 'Detail page',
					'field'   => 'Prime_Field_Page',
					'default' => ''
				],
				[
					'name'    => 'order_by',
					'caption' => 'Order by',
					'field'   => 'Prime_Field_String',
					'default' => '',
					'options' => [
						'placeholder' => 'eg. name ASC'
					]
				]
			],
			'Paging' => [
				[
					'name'    => 'paging_template',
					'caption' => 'Paging template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/paging'
					]
				],
				[
					'name'    => 'items_per_page',
					'caption' => 'Items per page',
					'field'   => 'Prime_Field_String',
					'default' => '0',
					'options' => [
						'type' => 'number'
					]
				],
				[
					'name'    => 'offset',
					'caption' => 'Item offset',
					'field'   => 'Prime_Field_String',
					'default' => '0',
					'options' => [
						'type' => 'number'
					]
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/fieldset/list'
					]
				]
			]
		];
	}

	/**
	 * Buttons to show in live mode
	 * 
	 * @return array
	 */
	public function actions()
	{
		return Arr::merge([
			HTML::anchor('#', '<i'.HTML::attributes(['class' => 'fa fa-plus']).'></i>', [
				'onclick' => 'window.top.Prime.Page.EditContent('.$this->_region->id.'); return false;'
			])
		], parent::actions());
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// set default template if template not found.
		if ( ! Kohana::find_file('views/module/fieldset/list/', $this->settings['template']))
		{
			$this->settings['template'] = 'standard';
		}

		// check if view exists
		if ( ! Kohana::find_file('views/module/fieldset/list/', $this->settings['template']))
			throw new Kohana_Exception('Could not find view [:view].', array(':view' => $this->settings['template']));

		// Get fieldset
		$fieldset = ORM::factory('Prime_Module_Fieldset', $this->settings['fieldset']);

		// Make sure fieldset exists
		if ( ! $fieldset->loaded())
			throw new Kohana_Exception('Could not find fieldset [:fieldset].', array(':fieldset' => $this->settings['fieldset']));

		// setup view
		$view = View::factory('module/fieldset/list/'.$this->settings['template'])
		->bind('items', $items)
		->bind('page', $page)
		->bind('pagination', $pagination)
		->set('fields', $fieldset->fields());

		// get return page
		$page = ORM::factory('Prime_Page', intval($this->settings['detail_page']))->uri();

		// set items
		$items = $fieldset->items;

		// paging flag
		$paging = ( ! empty($this->settings['items_per_page']) AND intval($this->settings['items_per_page']) > 0);

		// get total items before order by
		$total_items = $paging ? $items->count_all() : 0;

		// order results by key
		if ( ! empty($this->settings['order_by']))
		{
			$order_dir = stripos($this->settings['order_by'], 'DESC') === FALSE ? 'ASC' : 'DESC';
			$order_key = trim(str_replace([' asc', ' desc'], NULL, strtolower($this->settings['order_by'])));

			$items = $items
			->data_to_columns([$order_key])
			->order_by('data_'.$order_key, $order_dir);
		}

		if ($paging)
		{
			// get current page
			$current_page = Arr::get($_GET, 'page', 1);

			// check if view exists
			if ( ! Kohana::find_file('views/module/paging/', $this->settings['paging_template']))
			{
				throw new Kohana_Exception('Could not find view [:view].', array(':view' => $this->settings['paging_template']));
			}

			// setup view
			$paging = View::factory('module/paging/'.$this->settings['paging_template']);

			// setup pagination object
			$paging->total_items        = (int) max(0, $total_items);
			$paging->items_per_page     = (int) intval($this->settings['items_per_page']);
			$paging->total_pages        = (int) ceil($paging->total_items / $paging->items_per_page);
			$paging->current_page       = (int) min(max(1, $current_page), max(1, $paging->total_pages));
			$paging->current_first_item = (int) min((($paging->current_page - 1) * $paging->items_per_page) + 1, $paging->total_items);
			$paging->current_last_item  = (int) min($paging->current_first_item + $paging->items_per_page - 1, $paging->total_items);
			$paging->previous_page      = ($paging->current_page > 1) ? $paging->current_page - 1 : FALSE;
			$paging->next_page          = ($paging->current_page < $paging->total_pages) ? $paging->current_page + 1 : FALSE;
			$paging->first_page         = ($paging->current_page === 1) ? FALSE : 1;
			$paging->last_page          = ($paging->current_page >= $paging->total_pages) ? FALSE : $paging->total_pages;
			$paging->offset             = (int) (($paging->current_page - 1) * $paging->items_per_page) + intval($this->settings['offset']);
			$paging->uri                = NULL; // Request::current();

			// setup items
			$items = $items
			->offset($paging->offset)
			->limit($paging->items_per_page);

			// attach pagination to view
			$view->pagination = $paging;
		}

		// run query
		$items = $items->find_all();

		// return view
		return $view;
	}

} // End Prime Module HTML