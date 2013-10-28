<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Explorer Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Explorer extends Controller_Prime_Template {

	public $json = NULL;

	protected $_themes = [
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
		'ambiance' => 'Ambiance',
		'chaos' => 'Chaos',
		'clouds_midnight' => 'Clouds Midnight',
		'cobalt' => 'Cobalt',
		'facebook' => 'Facebook',
		'idle_fingers' => 'idleFingers',
		'kr_theme' => 'krTheme',
		'merbivore' => 'Merbivore',
		'merbivore_soft' => 'Merbivore Soft',
		'mono_industrial' => 'Mono Industrial',
		'monokai' => 'Monokai',
		'pastel_on_dark' => 'Pastel on dark',
		'solarized_dark' => 'Solarized Dark',
		'terminal' => 'Terminal',
		'tomorrow_night' => 'Tomorrow Night',
		'tomorrow_night_blue' => 'Tomorrow Night Blue',
		'tomorrow_night_bright' => 'Tomorrow Night Bright',
		'tomorrow_night_eighties' => 'Tomorrow Night 80s',
		'twilight' => 'Twilight',
		'vibrant_ink' => 'Vibrant Ink'
	];

	protected $_modes = [
		'abap' => 'ABAP',
		'ada' => 'ADA',
		'actionscript' => 'ActionScript',
		'asciidoc' => 'AsciiDoc',
		'assembly_x86' => 'Assembly_x86',
		'autohotkey' => 'AutoHotKey',
		'batchfile' => 'BatchFile',
		'c9search' => 'C9Search',
		'c_cpp' => 'C/C++',
		'clojure' => 'Clojure',
		'cobol' => 'Cobol',
		'coffee' => 'CoffeeScript',
		'coldfusion' => 'ColdFusion',
		'csharp' => 'C#',
		'css' => 'CSS',
		'curly' => 'Curly',
		'd' => 'D',
		'dart' => 'Dart',
		'diff' => 'Diff',
		'dot' => 'Dot',
		'erlang' => 'Erlang',
		'ejs' => 'EJS',
		'forth' => 'Forth',
		'ftl' => 'FreeMarker',
		'glsl' => 'Glsl',
		'golang' => 'Go',
		'groovy' => 'Groovy',
		'haml' => 'HAML',
		'haskell' => 'Haskell',
		'haxe' => 'haXe',
		'html' => 'HTML',
		'ini' => 'Ini',
		'jade' => 'Jade',
		'java' => 'Java',
		'javascript' => 'JavaScript',
		'json' => 'JSON',
		'jsoniq' => 'JSONiq',
		'jsp' => 'JSP',
		'jsx' => 'JSX',
		'julia' => 'Julia',
		'latex' => 'LaTeX',
		'less' => 'LESS',
		'liquid' => 'Liquid',
		'lisp' => 'Lisp',
		'livescript' => 'LiveScript',
		'logiql' => 'LogiQL',
		'lsl' => 'LSL',
		'lua' => 'Lua',
		'luapage' => 'LuaPage',
		'lucene' => 'Lucene',
		'makefile' => 'Makefile',
		'matlab' => 'MATLAB',
		'markdown' => 'Markdown',
		'mysql' => 'MySQL',
		'mushcode' => 'MUSHCode',
		'objectivec' => 'Objective',
		'ocaml' => 'OCaml',
		'pascal' => 'Pascal',
		'perl' => 'Perl',
		'pgsql' => 'pgSQL',
		'php' => 'PHP',
		'powershell' => 'Powershell',
		'prolog' => 'Prolog',
		'properties' => 'Properties',
		'python' => 'Python',
		'r' => 'R',
		'rdoc' => 'RDoc',
		'rhtml' => 'RHTML',
		'ruby' => 'Ruby',
		'rust' => 'Rust',
		'sass' => 'SASS',
		'scad' => 'SCAD',
		'scala' => 'Scala',
		'scheme' => 'Scheme',
		'scss' => 'SCSS',
		'sh' => 'SH',
		'snippets' => 'snippets',
		'sql' => 'SQL',
		'stylus' => 'Stylus',
		'svg' => 'SVG',
		'tcl' => 'Tcl',
		'tex' => 'Tex',
		'text' => 'Text',
		'textile' => 'Textile',
		'toml' => 'Toml',
		'twig' => 'Twig',
		'typescript' => 'Typescript',
		'vbscript' => 'VBScript',
		'velocity' => 'Velocity',
		'xml' => 'XML',
		'xquery' => 'XQuery',
		'yaml' => 'YAML'
	];

	/**
	 * Default action displays the tree on left and
	 * upload target dropzone in view.
	 *
	 * @return void
	 */
	public function action_tree()
	{
		// setup view
		$this->view = View::factory('Prime/Explorer/Tree')
		->bind('files', $files)
		->set('open', json_decode(Arr::get($_COOKIE, 'tree-explorer', '{}'), TRUE));

		// get list of files in application directory
		$files = Prime::list_files(NULL, [APPPATH]);

		// no cache or logs please
		unset($files['cache']);
		unset($files['logs']);
		unset($files['config']);
	}

	public function action_index()
	{
		$this->view = 'Please select file';
	}

	/**
	 * Edit action will choose which type of editor will be used.
	 *
	 * @return void
	 */
	public function action_file()
	{
		// get file
		$file = $this->request->param('id');

		// just sanity check
		if ( ! file_exists(APPPATH.$file))
			throw new HTTP_Exception('Could not find file');

		// export file info
		$fileinfo = pathinfo($file);

		// attach absolutepath
		$fileinfo['file'] = APPPATH.$file;

		// lets ace this
		$this->ace($fileinfo);
	}

	/**
	 * Save file contents
	 *
	 * @return void
	 */
	public function action_save()
	{
		$this->json = [
			'status' => FALSE,
			'data'   => __('Unknown error')
		];

		// get file
		$file = $this->request->param('id');

		// sanity check
		if ( ! file_exists(APPPATH.$file))
			throw new HTTP_Exception('Could not find file');

		// absolute path
		$file = APPPATH.$file;

		// is file is writable
		if (is_writable($file))
		{
			// open file handler
			$fh = fopen($file, 'w');

			// write request body contents to file
			fwrite($fh, $this->request->body());

			// close file handler
			fclose($fh);

			// set status
			$this->json['status'] = TRUE;
		}
		else
		{
			$this->json['data'] = __('Permission denied.');
		}
	}

	public function ace(array $file)
	{
		$this->view = View::factory('Prime/Explorer/Ace/Ace')
		->bind('content', $content)
		->bind('filename', $filename)
		->bind('mode', $mode)
		->bind('theme', $theme)
		->bind('emmet', $emmet)
		->set('id', $this->request->param('id'))
		->set('modes', $this->_modes)
		->set('themes', $this->_themes);

		// set theme and handpick github if none is set
		$theme = Arr::get($_COOKIE, 'ace-theme', 'github');

		// set emmet flag
		$emmet = (bool) Arr::get($_COOKIE, 'ace-emmet', TRUE);

		// convert extension to correct mode
		switch ($file['extension'])
		{
			case 'js': $mode = 'javascript'; break;
			case 'as': $mode = 'actionscript'; break;
			case 'cpp': case 'cc': case 'c': case 'h': $mode = 'c_cpp'; break;
			case 'clj': $mode = 'clojure'; break;
			case 'cs': $mode = 'csharp'; break;
			case 'py': $mode = 'python'; break;
			case 'md': $mode = 'markdown'; break;
			case 'ts': $mode = 'typescript'; break;
			case 'vbs': $mode = 'vbscript'; break;
			default: $mode = $file['extension'];
		}

		// set filename
		$filename = $file['basename'];

		// set content
		$content = file_get_contents($file['file']);
	}

	public function photo()
	{

	}

	/**
	 * Overload after controller execution method
	 *
	 * @return parent::after
	 */
	public function after()
	{
		// check for asyncronous request
		if ($this->request->is_ajax() OR ! $this->request->is_initial())
		{
			// disable auto render
			$this->auto_render = FALSE;

			// render the view
			return $this->response->body(isset($this->json) ? json_encode($this->json) : $this->view->render());
		}
		else
		{
			// always set tree
			$this->template->left = Request::factory('Prime/Explorer/Tree')
			->execute();
		}

		return parent::after();
	}

} // End Explorer