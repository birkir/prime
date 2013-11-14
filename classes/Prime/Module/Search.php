<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Module Search
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime/Module
 * @category Search
 * @copyright (c) 2013 SOLID Productions
 */
class Prime_Module_Search extends Prime_Module {

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
					'name'    => 'orderby',
					'caption' => 'Order by',
					'field'   => 'Prime_Field_Choose',
					'default' => 'score',
					'options' => [
						'items' => [
							'score' => 'Score',
							'title' => 'Title',
							'page'  => 'Page'
						]
					]
				],
				[
					'name'    => 'querystring',
					'caption' => 'Query key',
					'field'   => 'Prime_Field_String',
					'default' => 'q'
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
					'name'    => 'paging_query',
					'caption' => 'Query key',
					'field'   => 'Prime_Field_String',
					'default' => 'page'
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
				],
				[
					'name'    => 'paging_enabled',
					'caption' => 'Enable paging',
					'field'   => 'Prime_Field_Boolean',
					'default' => FALSE
				]
			],
			'Layout' => [
				[
					'name'    => 'template',
					'caption' => 'Template',
					'field'   => 'Prime_Field_Template',
					'default' => 'standard',
					'options' => [
						'directory' => 'module/search'
					]
				]
			]
		];
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// Get query string
		$querystring = Request::current()->query($this->option('querystring'));

		$lucene = Prime::lucene();

		// Build Search Query
		$query = Zend_Search_Lucene_Search_QueryParser::parse($querystring);

		// Set Zend Sorter
		$sorter = $this->option('orderby', 'score');

		// Execute search
		$hits = $lucene->find($query, $sorter, ($sorter === 'score') ? SORT_NUMERIC : SORT_STRING, SORT_DESC);

		// Setup view
		$view = self::load_view('module/search', self::option('template'))
		->bind('results', $results)
		->bind('pagination', $paging)
		->set('count', count($hits))
		->set('query', $querystring);

		// Set current offset
		$offset = 0;

		// Set total records to display
		$display = count($hits);

		if ((bool) $this->option('paging_enabled'))
		{
			// Get current page
			$current_page = Arr::get($_GET, $this->option('paging_query'), 1);

			// Setup paging view
			$paging = self::load_view('module/paging', self::option('paging_template'));

			// setup pagination object
			$paging->total_items        = (int) max(0, $display);
			$paging->items_per_page     = (int) intval($this->option('items_per_page'));
			$paging->total_pages        = (int) ($paging->items_per_page === 0) ? 0 : ceil($paging->total_items / $paging->items_per_page);
			$paging->current_page       = (int) min(max(1, $current_page), max(1, $paging->total_pages));
			$paging->current_first_item = (int) min((($paging->current_page - 1) * $paging->items_per_page) + 1, $paging->total_items);
			$paging->current_last_item  = (int) min($paging->current_first_item + $paging->items_per_page - 1, $paging->total_items);
			$paging->previous_page      = ($paging->current_page > 1) ? $paging->current_page - 1 : FALSE;
			$paging->next_page          = ($paging->current_page < $paging->total_pages) ? $paging->current_page + 1 : FALSE;
			$paging->first_page         = ($paging->current_page === 1) ? FALSE : 1;
			$paging->last_page          = ($paging->current_page >= $paging->total_pages) ? FALSE : $paging->total_pages;
			$paging->offset             = (int) (($paging->current_page - 1) * $paging->items_per_page) + intval($this->option('offset'));

			// setup items
			$offset = $paging->offset;
			$display = min($paging->total_items, $paging->offset + $paging->items_per_page);
		}

		// Set found pages to array
		$results = [];

		for ($i = $offset; $i < $display; $i++)
		{
			$hit = $hits[$i];

			if (isset($results[$hit->page]))
				continue;

			// Get page
			$result = ORM::factory('Prime_Page', $hit->page);

			if ( ! $result->loaded())
				continue;

			// Set lucene document
			$result->lucene($hit->getDocument(), $hit->score);

			// Append to found array
			$results[$hit->page] = $result;
		}

		// setup view
		return $view;
	}

}