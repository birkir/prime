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
	 * Initialize Lucene Search Engine
	 *
	 * @return void
	 **/
	public function initialize()
	{
		// autoload Zend
		if ($path = Kohana::find_file('vendor', 'Zend/Loader'))
		{
			ini_set('include_path', ini_get('include_path').PATH_SEPARATOR.dirname(dirname($path)));
		}

		require_once Kohana::find_file('vendor/Zend/Loader', 'Autoloader');

		Zend_Loader_Autoloader::getInstance();

		// set correct analaysis analizer
		Zend_Search_Lucene_Analysis_Analyzer::setDefault(new Zend_Search_Lucene_Analysis_Analyzer_Common_Utf8Num_CaseInsensitive());

		$cache = APPPATH.'cache/lucene';

		try
		{
			$this->index = Zend_Search_Lucene::open($cache);
		}
		catch (Zend_Search_Lucene_Exception $e)
		{
			$this->index = Zend_Search_Lucene::create($cache);
		}
	}

	/**
	 * Render module contents
	 * 
	 * @return View
	 */
	public function render()
	{
		// Initialize Zend
		$this->initialize();

		$highlight = TRUE;

		// Build Search Query
		$query = Zend_Search_Lucene_Search_QueryParser::parse(Request::current()->query('q'));

		// Execute search
		$hits = $this->index->find($query);

		// Set found pages to array
		$results = [];

		foreach ($hits as $hit)
		{
			if (isset($results[$hit->page]))
				continue;

			$result = ORM::factory('Prime_Page', $hit->page)->as_array();
			$result['score'] = $hit->score;

			if ($highlight)
			{
				$response = Request::factory('/')
				->query(['pageid' => $result['id']])
				->execute()
				->body();

				$result['match'] = $query->htmlFragmentHighlightMatches($response);
			}

			// Append to found array
			$results[$hit->page] = $result;
		}

		echo Debug::vars($results);
	}

}