<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Log Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Log extends Controller_Prime_Template {

	/**
	 * @var array Labels mapping
	 */
	protected $labels = array(
		'EMERGENCY' => 'label-danger',
		'CRITICAL'  => 'label-danger',
		'ERROR'     => 'label-danger',
		'WARNING'   => 'label-warning',
		'NOTICE'    => 'label-success',
		'INFO'      => 'label-info',
		'DEBUG'     => 'label'
	);

	/**
	 * Display latest errors and tree
	 *
	 * @return void
	 */
	public function action_index()
	{
		$years = Kohana::list_files('logs', [APPPATH]);
		$items = [];
		$offset = intval(Arr::get($this->request->query(), 'offset', 0));
		$max = 0;
		$pos = 0;

		foreach (array_reverse($years) as $months)
		{
			foreach (array_reverse($months) as $days)
			{
				foreach (array_reverse($days) as $day)
				{
					if ($pos >= $offset) {
						$items = Arr::merge($items, self::parse($day));
					}

					$pos++;

					if ($pos > ($offset + $max)) break;
				}
				if ($pos > ($offset + $max)) break;
			}
			if ($pos > ($offset + $max)) break;
		}

		$this->view = View::factory('Prime/Log/List')
		->set('items', $items)
		->set('labels', $this->labels)
		->set('offset', $offset)
		->set('max', $max);
	}

	/**
	 * Parse log file to usable information
	 *
	 * @param string Filename
	 * @return array
	 */
	public static function parse($filename = NULL)
	{
		// if log file was not found
		if ( ! file_exists($filename))
		{
			// return no items
			return array();
		}

		// set paths
		$paths = array(
			MODPATH => 'MODPATH/',
			APPPATH => 'APPPATH/',
			SYSPATH => 'SYSPATH/'
		);

		// split to lines, skip first 2 lines
		$lines = array_slice(file($filename), 2);

		// items buffer
		$items = array();

		// last log item
		$last = 0;
		$i = 0;

		// loop through lines
		foreach ($lines as $line)
		{
			// trim line
			$line = UTF8::trim($line);

			// each log record
			if ($line[0] !== '#' AND stripos($line, '--- DEBUG') === FALSE)
			{
				// set item array
				$item = array(
					'raw' => $line
				);

				// start of line
				if (preg_match('/(.*) --- ([A-Z]*): ([^:]*):? ([^~]*)~? (.*)/', $line, $log))
				{
					$item['time'] = new DateTime();
					$item['time']->setTimestamp(strtotime($log[1]));
					$item['level'] = $log[2];
					$item['type'] = $log[3];
					$item['message'] = $log[4];
					$item['file'] = preg_replace('#(\d?) in (.*)#s', NULL, $log[5]);
					$item['strace'] = array();

					// replace file paths
					$item['file'] = str_replace(array_keys($paths), $paths, $item['file']);
					$item['message'] = str_replace(array_keys($paths), $paths, $item['message']);

					if (in_array($item['level'], array('INFO', 'WARNING', 'NOTICE', 'ERROR')))
					{
						$item['message'] = NULL;
					}
				}

				// push to items array
				$items[$i] = $item;

				// save last logged item for stack trace
				$last = $i;

				// increment
				$i++;
			}

			// when stack trace
			if ($line[0] === '#' OR stripos($line, 'DEBUG') !== FALSE)
			{
				// remove timestamp
				$line = preg_replace('#[0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9\:]{8}#s', NULL, $line);

				// remove debug title
				$line = str_replace(' --- DEBUG: ', NULL, $line);

				// push to trace stack
				$items[$last]['strace'][] = str_replace(array_keys($paths), $paths, preg_replace('/#\d /', '', $line));
			}
		}

		return $items;
	}


} // End Prime Log