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
	 * @var  Prime_Website  website object
	 */
	public static $website;

	/**
	 * @var  Prime_Page     page object
	 */
	public static $page;

	/**
	 * @var  Prime_Frontend frontend object
	 */
	public static $frontend;

	/**
	 * @var  Prime_Auth     auth object
	 */
	public static $auth;

	/**
	 * @var  Config         config object
	 */
	public static $config;

	/**
	 * @var  boolean  Has [Prime::init] been called?
	 */
	protected static $_init = FALSE;

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

		// Prime is now initialized
		Prime::$_init = TRUE;

		// Determine if views directory exists
		if ( ! is_dir(APPPATH.'views'))
		{
			try
			{
				// Create the views directory
				mkdir(APPPATH.'views', 0755, TRUE);

				// Set permissions (must be manually set to fix umask issues)
				chmod(APPPATH.'views', 0755);
			}
			catch(Exception $e)
			{
				throw new Kohana_Exception('Could not create views directory :dir',
					array(':dir' => Debug::path(APPPATH.'views')));
			}
		}

		// Determine if views directory is writable
		if ( ! is_writable(APPPATH.'views'))
		{
			throw new Kohana_Exception('Directory :dir must be writable',
				array(':dir' => Debug::path(APPPATH.'views')));
		} 

		// Load the website object if one doesn't already exist
		if ( ! Prime::$website instanceof Prime_Website)
		{
			Prime::$website = Prime_Website::instance();
		}

		// Load the page object if one doesn't already exist
		if ( ! Prime::$page instanceof Prime_Page)
		{
			Prime::$page = Prime_Page::instance();
		}

		// Load the frontend object if one doesn't already exist
		if ( ! Prime::$frontend instanceof Prime_Frontend)
		{
			Prime::$frontend = Prime_Frontend::instance();
		}

		// Load the prime configuration
		Prime::$config = Kohana::$config->load('prime');
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
			Prime::$website = Prime::$page = Prime::$config = NULL;

			// Prime is no longer initialized
			Prime::$_init = FALSE;
		}
	}

	/**
	 * List files in target directory and return jstree structure.
	 * 
	 * @param  string $directory Directory to list
	 * @return array
	 */
	public static function lstree($directory = NULL, $base = NULL)
	{
		$path = APPPATH;

		if ($directory !== NULL)
		{
			// Add the directory separator
			$directory .= DIRECTORY_SEPARATOR;
		}

		if ($base === NULL)
		{
			$base = $directory;
		}

		// Create an array for the files
		$found = array();

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

				$_found = array(
					'data' => array(
						'title' => $file->getBasename(),
						'attr' => array(
							'href' => substr($key, strlen($base))
						),
						'icon' => ($file->isFile() ? 'icon-file' : 'icon-folder-close')
					),
					'attr' => array(
						'data-type' => 'file',
						'data-id'   => substr($key, strlen($base)),
						'id' => sha1(substr($key, strlen($base))),
					)
				);

				// if dir
				if ($file->isDir())
				{
					$_found['attr']['data-type'] = 'folder';

					if ($sub_dir = self::lstree($key, $base))
					{
						$_found['children'] = $sub_dir;
					}
				}

				$found[] = $_found;
			}
		}

		// Sort the results alphabetically
		ksort($found);

		return $found;
	}

	/**
	 * Clean paths and replace their shorter equivalents.
	 * 
	 * @param  string $message Message to replace
	 * @return string
	 */
	public static function clean($message = NULL)
	{
		$paths = array(
			APPPATH,
			MODPATH,
			SYSPATH,
			DOCROOT
		);

		$fixes = array(
			'APPPATH'.DIRECTORY_SEPARATOR,
			'MODPATH'.DIRECTORY_SEPARATOR,
			'SYSPATH'.DIRECTORY_SEPARATOR,
			'DOCROOT'.DIRECTORY_SEPARATOR
		);

		// replace
		$message = str_replace($paths, $fixes, $message);

		// return message
		return $message;
	}

	/**
	 * Send an email
	 * 
	 * @param  string $to      Email addresses
	 * @param  string $subject Message subject
	 * @param  string $content Message body
	 * @return boolean
	 */
	public static function email($to = NULL, $subject = NULL, $content = NULL)
	{
		$headers = array(
			'MIME-Version: 1.0',
			'Content-type: text/html; charset=utf-8',
			'To: '. $to,
			'From: Prime CMS <prime@prime.com>'
		);

		$html = '<html><head><title>'.$subject.'</title><body>'.$content.'</body></html>';

		return mail($to, $subject, $html, implode("\r\n", $headers)."\r\n");
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