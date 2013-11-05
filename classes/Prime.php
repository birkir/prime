<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Contains low-level and most used methods in Prime:
 *
 * - Environment initialization
 * - Locating files within the cascading filesystem (overloaded)
 * - Most used functions in Prime CMS
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime {

	// Release version and codename
	const VERSION  = '3.3.0';
	const CODENAME = 'holymontain';

	// Delta environment (staging flag)
	const DELTA = TRUE;

	/**
	 * @var  boolean  Has [Prime::init] been called?
	 */
	protected static $_init = FALSE;

	/**
	 * @var  Config   Kohana Config object
	 */
	public static $config;

	/**
	 * @var  Prime_Region Template region container
	 */
	public static $region;

	/**
	 * @var  Prime_Page  Selected Page on Frontend
	 */
	public static $selected_page;

	/**
	 * @var  ORM Logged in User
	 */
	public static $user;

	/**
	 * @var  string    Overload uri for page
	 */
	public static $page_overload_uri = FALSE;      

	/**
	 * @var  boolean   Design mode on/off
	 */
	public static $design_mode;

	/**
	 * @var  boolean   Disable cache flag
	 */
	public static $nocache = FALSE;

	/**
	 * Singleton instance
	 */
	public static function init(array $settings = NULL)
	{
		if (Prime::$_init)
		{
			// Do not allow execution twice
			return;
		}

		// Load the prime configuration
		Prime::$config = Kohana::$config->load('prime');

		// Load region controller
		Prime::$region = new Prime_Region;

		// Check for design mode
		Prime::$design_mode = (bool) (Arr::get($_GET, 'mode', 'frontend') === 'design');

		// Prime is now initialized
		Prime::$_init = TRUE;
	}

	/**
	 * Get selected page from Request URI
	 *
	 * @param HTTP_Request The HTTP Request to use for detection
	 * @return Prime_Page Selected Page or NULL
	 */
	public static function selected(HTTP_Request $request)
	{
		if (intval($request->query('pageid')) > 0)
		{
			Prime::$selected_page = ORM::factory('Prime_Page', $request->query('pageid'));
		}
		else
		{
			Prime::$selected_page = ORM::factory('Prime_Page')
			->selected($request->param('query'));
		}

		return Prime::$selected_page;
	}

	/**
	 * Prepare list of files to array for combobox
	 * 
	 * @param  array recursive array of files
	 * @return array
	 */
	public static function treeselect($nodes, $mask = 'views/', $level = 1)
	{
		// list buffer
		$list = [];

		// loop through nodes
		foreach ($nodes as $node)
		{
			// process recursive
			if (is_array($node))
			{
				// combine to list
				$list = Arr::merge($list, Prime::treeselect($node, $mask, ++$level));
			}
			else
			{
				$node = str_replace(MODPATH.'prime/'.$mask, 'prime:', $node);
				$node = str_replace(MODPATH.'prime/'.$mask, NULL, $node);
				$node = str_replace([APPPATH, MODPATH, SYSPATH], NULL, $node);
				$node = substr($node, 0, strlen($mask)) === $mask ? substr($node, strlen($mask)) : $node;
				$node = substr($node, 0, strrpos($node, '.'));

				$list[str_replace('prime:', NULL, $node)] = $node;
			}
		}

		return $list;
	}

	/**
	 * Recursively finds all of the files in the specified directory at any location in the
	 * [Cascading Filesystem], and returns an array of all the files found, sorted alphabetically.
	 *
	 * @param string Directory name
	 * @param array  List of paths to search
	 * @return array
	 */
	public static function list_files($directory = NULL, array $paths = NULL)
	{
		if ($directory !== NULL)
		{
			// Add the directory separator
			$directory .= DIRECTORY_SEPARATOR;
		}

		if ($paths === NULL)
		{
			// Use the default paths
			$paths = Kohana::$_paths;
		}

		// Create an array for the files
		$found = array();

		foreach ($paths as $path)
		{
			if (is_dir($path.$directory))
			{
				// Create a new directory iterator
				$dir = new DirectoryIterator($path.$directory);

				foreach ($dir as $file)
				{
					// Get the file name
					$filename = $file->getFilename();

					if ($filename[0] === '.' OR $filename[strlen($filename)-1] === '~')
					{
						// Skip all hidden files and UNIX backup files
						continue;
					}

					// Relative filename is the array key
					$key = $directory.$filename;
	 
					if ($file->isDir())
					{
						if ($sub_dir = Kohana::list_files($key, $paths))
						{
							if (isset($found[$key]))
							{
								// Append the sub-directory list
								$found[$key] += $sub_dir;
							}
							else
							{
								// Create a new sub-directory list
								$found[$key] = $sub_dir;
							}
						}
						else
						{
							$found[$key] = [];
						}
					}
					else
					{
						if ( ! isset($found[$key]))
						{
							// Add new files to the list
							$found[$key] = realpath($file->getPathName());
						}
					}
				}
			}
		}

		// Sort the results alphabetically
		ksort($found);

		return $found;
	}

	public static function email($subject, $body, $from, $to)
	{
		// load Swift Mailer
		if ( ! class_exists('Swift_Mailer', FALSE))
		{
			require Kohana::find_file('vendor', 'swift/swift_required');
		}

		// setup transport
		$transport = Swift_SendmailTransport::newInstance('/usr/sbin/sendmail -bs');

		// setup swift mailer
		$mailer = Swift_Mailer::newInstance($transport);

		// create message
		$message = new Swift_Message($subject, $body, 'text/html', 'utf-8');

		// set recipents and sender
		$message->setFrom($from);
		$message->setTo($to);

		// return Swift Mailer
		return $mailer->send($message);
	}

	/**
	 * Cleans up the environment:
	 *
	 * - Destroy the Prime::$website and Prime::$page objects
	 * 
	 * @return void
	 */
	public static function deinit()
	{
		if (Prime::$_init)
		{
			// Destroy objects created by init
			Prime::$config = Prime::$region = NULL;

			// Prime is no longer initialized
			Prime::$_init = FALSE;
		}
	}

	/**
	 * Generates a version string based on the variables defined above.
	 * 
	 * @return string
	 */
	public static function version()
	{
		return 'Prime '.Prime::VERSION.' ('.Prime::CODENAME.')';
	}

} // End Prime