<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Log Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Log extends Controller_Prime_Core {

	public static $labels = array(
		'EMERGENCY' => 'label-important',
		'CRITICAL'  => 'label-important',
		'ERROR'     => 'label-important',
		'WARNING'   => 'label-warning',
		'NOTICE'    => 'label-success',
		'INFO'      => 'label-info',
		'DEBUG'     => 'label'
	);

	public function action_index()
	{
		return $this->action_view();
	}

	public function action_view()
	{
		$file = APPPATH.'logs/'.$this->request->param('id', date('Y/m/d')).'.php';

		$this->template->left = View::factory('Prime/Log/Dates')
		->set('available', self::available());

		$this->view = View::factory('Prime/Log/List')
		->set('items', self::parse($file))
		->set('labels', self::$labels);
	}

	public function action_details()
	{
		// disable auto render
		$this->auto_render = FALSE;

		$file = APPPATH.'logs/'.$this->request->param('id', date('Y/m/d')).'.php';

		$view = View::factory('Prime/Log/List')
		->set('items', self::parse($file))
		->set('labels', self::$labels);

		$this->response->body($view->render());
	}

	public static function available(array $files = array())
	{
		// list files
		if (empty($files))
		{
			// files array
			$files = Kohana::list_files('logs', array(APPPATH));
		}

		// items buffer
		$items = array();

		// loop through available files
		foreach ($files as $file => $subfiles)
		{
			// if subfiles is array
			if (is_array($subfiles))
			{
				// merge with buffer array
				$items += self::available($subfiles);
			}
			else
			{
				// append to buffer array
				$items[] = str_replace(array(APPPATH.'logs/', '.php'), NULL, $subfiles);
			}
		}

		// return items buffer
		return $items;
	}

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
					$item['time'] = strtotime($log[1]);
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