<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Class
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Prime
 * @copyright (c) 2013 SOLID Productions
 */
class Prime {

	public static function ext_to_mode($ext = NULL)
	{
		$exts = array(
			'js'  => 'javascript',
			'py'  => 'python',
			'cpp' => 'c_cpp',
			'md'  => 'markdown',
			'm'   => 'objectivec',
		);

		return isset($exts[$ext]) ? $exts[$ext] : $ext;
	}

	public static function ace_modes()
	{
		return array(
			'Common' => array(
				'php' => 'PHP',
				'html' => 'HTML',
				'css' => 'CSS',
				'javascript' => 'JavaScript',
				'coffee' => 'CoffeeScript',
				'less' => 'LESS',
				'sass' => 'SASS',
				'python' => 'Python',
				'text' => 'Text',
			),
			'Others' => array(
				'abap' => 'ABAP',
				'asciidoc' => 'AsciiDoc',
				'c9search' => 'C9Search',
				'coldfusion' => 'ColdFusion',
				'csharp' => 'C#',
				'curly' => 'Curly',
				'dart' => 'Dart',
				'diff' => 'Diff',
				'dot' => 'Dot',
				'ftl' => 'FreeMarker',
				'glsl' => 'Glsl',
				'golang' => 'Go',
				'groovy' => 'Groovy',
				'haxe' => 'haXe',
				'haml' => 'HAML',
				'c_cpp' => 'C/C++',
				'clojure' => 'Clojure',
				'jade' => 'Jade',
				'java' => 'Java',
				'jsp' => 'JSP',
				'json' => 'JSON',
				'jsx' => 'JSX',
				'latex' => 'LaTeX',
				'lisp' => 'Lisp',
				'scheme' => 'Scheme',
				'liquid' => 'Liquid',
				'livescript' => 'LiveScript',
				'logiql' => 'LogiQL',
				'lua' => 'Lua',
				'luapage' => 'LuaPage',
				'lucene' => 'Lucene',
				'lsl' => 'LSL',
				'makefile' => 'Makefile',
				'markdown' => 'Markdown',
				'objectivec' => 'Objective-C',
				'ocaml' => 'OCaml',
				'pascal' => 'Pascal',
				'perl' => 'Perl',
				'pgsql' => 'pgSQL',
				'powershell' => 'Powershell',
				'r' => 'R',
				'rdoc' => 'RDoc',
				'rhtml' => 'RHTML',
				'ruby' => 'Ruby',
				'scad' => 'OpenSCAD',
				'scala' => 'Scala',
				'scss' => 'SCSS',
				'sh' => 'SH',
				'sql' => 'SQL',
				'stylus' => 'Stylus',
				'svg' => 'SVG',
				'tcl' => 'Tcl',
				'tex' => 'Tex',
				'textile' => 'Textile',
				'tm_snippet' => 'tmSnippet',
				'toml' => 'toml',
				'typescript' => 'Typescript',
				'vbscript' => 'VBScript',
				'xml' => 'XML',
				'xquery' => 'XQuery',
				'yaml' => 'YAML'
			)
		);
	}

	public static function ace_themes()
	{
		return array(
			'Bright' => array(
				'chrome' => 'Chrome',
				'clouds' => 'Clouds',
				'crimson_editor' => 'Crimson Editor',
				'dawn' => 'Dawn',
				'dreamweaver' => 'Dreamweaver',
				'eclipse' => 'Eclipse',
				'github' => 'GitHub',
				'solarized_light' => 'Solarized Light',
				'textmate' => 'TextMate',
				'tomorrow' => 'Tomorrow',
				'xcode' => 'XCode',
			),
			'Dark' => array(
				'ambiance' => 'Ambiance',
				'chaos' => 'Chaos',
				'clouds_midnight' => 'Clouds Midnight',
				'cobalt' => 'Cobalt',
				'idle_fingers' => 'idleFingers',
				'kr_theme' => 'krTheme',
				'merbivore' => 'Merbivore',
				'merbivore_soft' => 'Merbivore Soft',
				'mono_industrial' => 'Mono Industrial',
				'monokai' => 'Monokai',
				'pastel_on_dark' => 'Pastel on dark',
				'solarized_dark' => 'Solarized Dark',
				'twilight' => 'Twilight',
				'tomorrow_night' => 'Tomorrow Night',
				'tomorrow_night_blue' => 'Tomorrow Night Blue',
				'tomorrow_night_bright' => 'Tomorrow Night Bright',
				'tomorrow_night_eighties' => 'Tomorrow Night 80s',
				'vibrant_ink' => 'Vibrant Ink',
			)
		);
	}

	public static function website()
	{
		$settings = array();

		foreach (ORM::factory('Prime_Website')->find_all() as $item)
		{
			$settings[$item->key] = $item->value;
		}

		return $settings;
	}

	public static function selected_page($website = NULL)
	{
		if ($website === NULL)
		{
			$website = Prime::website();
		}

		// get current request
		$request = Request::current();

		// get uri
		$uri = $request->param('query');

		// if default page
		if ($qp = Arr::get($request->query(), 'page'))
		{
			$page = ORM::factory('Prime_page', $qp);
		}
		else if (empty($uri))
		{
			$page = ORM::factory('Prime_Page', Arr::get($website, 'default_page_id', 1));
		}
		else
		{
			// split query
			$uri = explode('/', $uri);

			// loop through uri
			foreach ($uri as $alias)
			{
				// build page orm
				$page = ORM::factory('Prime_Page')
				->where('alias', '=', $alias)
				->where('parent_id', ! isset($page) ? 'IS' : '=', ! isset($page) ? NULL : $page->id)
				->find();

				// check if not loaded
				if ( ! $page->loaded())
				{
					return FALSE;
				}
			}
		}

		return $page;
	}

	/**
	 * List files and folders for tree generation
	 */
	public static function ls($directory = NULL)
	{
		$path = APPPATH;

	    if ($directory !== NULL)
	    {
	        // Add the directory separator
	        $directory .= DIRECTORY_SEPARATOR;
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
                			'href' => substr($key, strlen('views/'))
                		),
                		'icon' => ($file->isFile() ? 'icon-file' : 'icon-folder-close')
                	),
                	'attr' => array(
                		'data-type' => 'file',
                		'id' => sha1(substr($key, strlen('views/'))),
                	)
	            );

	            // if dir
	            if ($file->isDir())
	            {
	                $_found['attr']['data-type'] = 'folder';

	                if ($sub_dir = self::ls($key))
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

} // End Prime