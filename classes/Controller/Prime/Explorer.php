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

	/**
	 * @var array JSON Response
	 */
	public $json = NULL;

	/**
	 * Default action displays the tree on left and
	 * upload target dropzone in view.
	 *
	 * @return void
	 */
	public function action_tree()
	{
		// Setup view
		$this->view = View::factory('Prime/Explorer/Tree')
		->bind('files', $files)
		->set('open', json_decode(Arr::get($_COOKIE, 'tree-explorer', '{}'), TRUE));

		// Get list of files in application directory
		$files = Prime::list_files(NULL, [APPPATH]);

		// Get Default views from Prime module
		$files['views']['children'] = Arr::merge(Prime::list_files('views', [MODPATH.'prime/']), $files['views']['children']);

		// Dont want Prime UI views
		unset($files['views']['children']['views/Prime']);

		// Unset some unwanted files
		unset($files['cache']);
		unset($files['logs']);
		unset($files['vendor']);
		unset($files['install.prime']);
	}

	/**
	 * Default page
	 *
	 * @return void
	 */
	public function action_index() {}

	/**
	 * Edit action will choose which type of editor will be used.
	 *
	 * @return void
	 */
	public function action_file()
	{
		// Get file
		$file = $this->request->param('id');

		// Export file info
		$fileinfo = pathinfo($file);

		$fileinfo['file'] = Kohana::find_file($fileinfo['dirname'], $fileinfo['filename'], $fileinfo['extension'], FALSE);

		if ( ! is_array($fileinfo['file']))
		{
			$fileinfo['file'] = array($fileinfo['file']);
		}

		$fileinfo['file'] = end($fileinfo['file']);

		if ( ! file_exists($fileinfo['file']))
		{
			// Could not find file
			throw new HTTP_Exception('Could not find file');
		}

		// Show ace editor
		$this->ace($fileinfo);
	}

	/**
	 * Save file contents
	 *
	 * @return void
	 */
	public function action_save()
	{
		// Set JSON Response
		$this->json = [
			'status'  => FALSE,
			'message' => __('Unknown error')
		];

		// Get file
		$file = $this->request->param('id');

		// Get absolute path
		$file = APPPATH.$file;
		$dir  = pathinfo($file, PATHINFO_DIRNAME);

		if ( ! file_exists($dir))
		{
			mkdir($dir, 0755, TRUE);
			chmod($dir, 0755);
		}


		if (is_dir($dir))
		{
			// Open file handler
			$fh = fopen($file, 'w');

			// Write request body contents to file
			fwrite($fh, $this->request->body());

			// Close file handler
			fclose($fh);

			// Set JSON Response status
			$this->json['status'] = TRUE;
			$this->json['message'] = __('File was saved.');
		}
		else
		{
			// Set JSON Response status
			$this->json['message'] = __('Permission denied.');
		}
	}

	/**
	 * Show ace editor
	 *
	 * @return void
	 */
	public function ace(array $file)
	{
		// Setup view
		$this->view = View::factory('Prime/Explorer/Ace/Ace')
		->bind('content', $content)
		->bind('filename', $filename)
		->bind('mode', $mode)
		->bind('theme', $theme)
		->bind('emmet', $emmet)
		->bind('primefile', $primefile)
		->set('id', $this->request->param('id'))
		->set('modes', Prime::$config->modes)
		->set('themes', Prime::$config->themes);

		// Set theme and handpick github if none is set
		$theme = Arr::get($_COOKIE, 'ace-theme', 'github');

		// Set emmet flag
		$emmet = (bool) Arr::get($_COOKIE, 'ace-emmet', TRUE);

		// Convert extension to correct mode
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

		// Set filename
		$filename = $file['basename'];

		// Check if prime file
		$primefile = (substr($file['file'], 0, strlen(MODPATH)) === MODPATH);

		// Set content
		$content = file_get_contents($file['file']);
	}

	/**
	 * Create file or folder
	 *
	 * @return void
	 */
	public function action_create()
	{
		$this->json = array(
			'status'  => FALSE,
			'data'    => NULL,
			'message' => __('Check folder permissions.')
		);

		if ($this->request->method() === HTTP_Request::POST)
		{
			// Get Request POST
			$post = $this->request->post();

			// Get name
			$name = Arr::get($post, 'name');

			// Get type
			$type = Arr::get($post, 'type', 'file');

			// Get parent folder
			$parent = APPPATH.Arr::get($post, 'parent', NULL);

			if ( ! file_exists($parent))
			{
				mkdir($parent, 0755, TRUE);
				chmod($parent, 0755);
			}

			if ( ! is_dir($parent) OR ! is_writable($parent) OR empty($name))
				return;

			if ($type === 'folder') 
			{
				// Create the folder
				mkdir($parent.'/'.$name, 0755, TRUE);
			}
			else
			{
				// Touch the file
				touch ($parent.'/'.$name);
			}

			// Set permissions (must be manually set to fix umask issues)
			chmod($parent.'/'.$name, 0755);

			$this->json['status'] = TRUE;
			$this->json['message'] = __(ucfirst($type).' has been created.');
			$this->json['data'] = Request::factory('Prime/Explorer/Tree')->execute()->body();
		}
	}

	/**
	 * Rename file or folder
	 *
	 * @return void
	 */
	public function action_rename()
	{
		$this->view = 'error';

		// Get new name
		$name = $this->request->post('name');

		// Get filename
		$file = APPPATH.$this->request->param('id');

		if ( ! file_exists($file) OR empty($name) OR strpos($name, '/') !== FALSE OR $name[0] === '.')
		{
			$this->view = Debug::vars(strpos($name, '/'));
			return;
		}

		// Get file pathinfo
		$info = pathinfo($file);

		// Do the rename
		rename($file, $info['dirname'].DIRECTORY_SEPARATOR.$name);

		$this->view = Request::factory('Prime/Explorer/Tree')->execute()->body();
	}

	/**
	 * Delete file or folder
	 *
	 * @return void
	 */
	public function action_delete()
	{
		$this->json = array(
			'status'  => FALSE,
			'data'    => NULL,
			'message' => __('Check folder permissions.')
		);

		// Get file path
		$file = APPPATH.$this->request->param('id');
		$dir = is_dir($file);

		if ( ! file_exists($file)) return;

		try
		{
			$status = $dir ? rmdir($file) : unlink($file);

			$this->json['status'] = $status;
			$this->json['message'] = __(($dir ? 'Folder' : 'File').' has been deleted.');
			$this->json['data'] = Request::factory('Prime/Explorer/Tree')->execute()->body();
		}
		catch (ErrorException $e)
		{
			$this->json['message'] = str_replace(APPPATH, NULL, $e->getMessage());
		}
	}

	/**
	 * Overload after controller execution method
	 *
	 * @return parent::after
	 */
	public function after()
	{
		// Check for asyncronous request
		if ($this->request->is_ajax() OR ! $this->request->is_initial())
		{
			// Disable auto render
			$this->auto_render = FALSE;

			// Render the view
			return $this->response->body(isset($this->json) ? json_encode($this->json) : $this->view);
		}
		else
		{
			// Always set tree
			$this->template->left = Request::factory('Prime/Explorer/Tree')
			->execute();
		}

		return parent::after();
	}

}