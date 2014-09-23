<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime File Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_File extends Controller_Prime_Template {

	/**
	 * @var array JSON Response array
	 */
	protected $json = NULL;

	/**
	 * Default page
	 *
	 * @return void
	 */
	public function action_index()
	{
		if ($this->request->query('CKEditorFuncNum'))
		{
			// CKEditor callback
			$this->template->bottom = '<div'.HTML::attributes(array('id' => 'ckbrowser', 'data-func' => $this->request->query('CKEditorFuncNum'))).'></div>';

			// Hide header
			$this->template->bottom .= '<style>.navbar-fullscreen{display:none !important;}.fullscreen{top:0 !important;}</style>';
		}
	}

	/**
	 * Render files tree
	 * 
	 * @return void
	 */
	public function action_tree()
	{
		// Setup tree view
		$this->view = View::factory('Prime/File/Tree')
		->bind('nodes', $nodes)
		->set('request', $this->request)
		->set('open', $this->request->is_initial() ? [] : json_decode(Arr::get($_COOKIE, 'tree-files', '{}'), TRUE));

		// Get available File folders
		$nodes = ORM::factory('Prime_File');
	}

	/**
	 * List files in folder
	 *
	 * @return void
	 */
	public function action_list()
	{
		// Set folder to list files
		$id = $this->request->param('id');

		if (isset($_GET['file']))
		{
			$_file = pathinfo($this->request->query('file'));

			// Find reference file
			$file = ORM::factory('Prime_File')
			->where('filename', '=', $_file['filename'])
			->find();
			
			// Set folder id
			$id = $file->parent_id;
		}

		// Get file model
		$folder = ORM::factory('Prime_File', $id);

		if ( ! $folder->loaded() OR intval($folder->type) !== 0)
		{
			// Could not find file model
			throw HTTP_Exception::factory(404, 'Folder not found');
		}

		// Find all items in folder
		$items = $folder->files
		->where('type', '=', 1)
		->order_by('updated_at', 'DESC')
		->find_all();

		// Setup view
		$this->view = View::factory('Prime/File/List')
		->set('folder', $folder)
		->set('items', $items)
		->set('viewtype', Arr::get($_COOKIE, 'prime-viewmode', 'list'));
	}

	/**
	 * List files in folder
	 *
	 * @return void
	 */
	public function action_select_list()
	{
		// Set folder to list files
		$id = $this->request->param('id');

		// Get file model
		$folder = ORM::factory('Prime_File', $id);

		// Find all items in folder
		$items = $folder->files
		->where('type', '=', 1)
		->order_by('name', 'ASC')
		->find_all();

		// setup view
		$this->view = View::factory('Prime/File/SelectList')
		->set('files', $items);

		// Disable auto render
		$this->auto_render = FALSE;

		// Response body
		$this->response->body($this->view);
	}

	/**
	 * Handle upload files
	 *
	 * @return void
	 */
	public function action_upload()
	{
		// Setup upload view
		$this->view = View::factory('Prime/File/Upload');

		// Setup storage
		$storage = Storage::factory();

		if ($this->request->method() === HTTP_Request::POST)
		{
			// Disable auto render
			$this->auto_render = FALSE;

			// Disable all cache
			$this->response->headers('expires', 'Mon, 26 Jul 1997 05:00:00 GMT');
			$this->response->headers('last-modifier', gmdate('D, d M Y H:i:s'). ' GMT');
			$this->response->headers('cache-control', 'no-store, no-cache, must-revalidate');
			$this->response->headers('cache-control', 'post-check=0, pre-check=0');
			$this->response->headers('pragma', 'no-cache');

			// Set max execution time
			@set_time_limit(5 * 60);

			// Get filename
			$filename = isset($_REQUEST['name']) ? $_REQUEST['name'] : ( ! empty($_FILES) ? $_FILES['file']['name'] : uniqid('file_'));

			// Set directory
			$directory = APPPATH.'cache/files';

			if ( ! is_dir($directory))
			{
				try
				{
					// Create the cache directory
					mkdir($directory, 0755, TRUE);
					
					// Set permissions (must be manually set to fix umask issues)
					chmod($directory, 0755);
				}
				catch (Exception $e)
				{
					throw new Kohana_Exception('Could not create cache directory :dir',
						array(':dir' => Debug::path($directory)));
				}
			}

			// Set filepath
			$filepath = $directory.DIRECTORY_SEPARATOR.sha1($filename);

			// Chunking might be enabled
			$chunk = Arr::get($_REQUEST, 'chunk', 0);
			$chunks = Arr::get($_REQUEST, 'chunks', 0);

			// Set error message
			$error = FALSE;

			try
			{
				if ( ! Upload::save($_FILES['file'], sha1($filename).'.part', $directory))
				{
					// Set output handler
					$output = fopen($filepath.'.part', $chunks ? 'ab' : 'wb');

					// Set input handler
					fwrite($output, $this->request->body());

					// Close output handler
					fclose($output);
				}
			}
			catch (ErrorException $e)
			{
				// Setup JSON Response
				$response = array(
					'jsonrpc' => '2.0',
					'error'   => $e->getMessage(),
					'id'      => 'id'
				);

				// Response JSON encoded data
				$this->response->body(json_encode($response));
				return;
			}

			if ( ! $chunks OR ($chunk === $chunks - 1))
			{
				// Strip the temp .part suffix off 
				rename($filepath.'.part', $filepath);

				// Get fileinfo
				$fileinfo = pathinfo($filename);

				// Create hashed filename for reference
				$hashname = sha1_file($filepath);

				// Store the file
				$storage->set($hashname.'.'.$fileinfo['extension'], file_get_contents($filepath));

				// Create file record
				$item = ORM::factory('Prime_File');
				$item->parent_id = $this->request->param('id');
				$item->type = 1;
				$item->name = $filename;
				$item->ext  = $fileinfo['extension'];
				$item->mime = File::mime_by_ext($fileinfo['extension']);
				$item->size = filesize($filepath);
				$item->filename = $hashname;

				// Parse image files
				if ($image = @getimagesize($filepath))
				{
					$item->width  = $image[0];
					$item->height = $image[1];
					$item->mime   = Arr::get($image, 'mime', 'text/plain');
					$item->bits = Arr::get($image, 'bits', NULL);

					switch (Arr::get($image, 'channels', FALSE))
					{
						case 3: $item->channels = 'RGB'; break;
						case 4: $item->channels = 'CMYK'; break;
					}

					$storage->set($hashname.'thumb.'.$fileinfo['extension'], Image::factory($filepath)->resize(256, 256)->render(NULL, 85));
					$storage->set($hashname.'preview.'.$fileinfo['extension'], Image::factory($filepath)->resize(1024, 768)->render(NULL, 100));
				}

				// Save record
				$item->save();
			}

			exit;
		}
	}

	/**
	 * Delete file or files
	 *
	 * @return void
	 */
	public function action_delete()
	{
		//  Extract file ids
		$files = explode(':', $this->request->param('id'));

		foreach ($files as $file)
		{
			// Find file
			$item = ORM::factory('Prime_File', $file)
			->delete();
		}
	}

	/**
	 * Create new folder
	 *
	 * @return void
	 */
	public function action_folder_create()
	{
		// Create new file record
		$file = ORM::factory('Prime_File');

		// Set POST values to model
		$file->parent_id = $this->request->param('id');
		$file->type = 0;
		$file->name = $this->request->post('name');
		$file->save();

		// Set tree view
		$this->view = Request::factory('Prime/File/Tree')
		->execute()
		->body();
	}

	/**
	 * Delete folder
	 *
	 * @return void
	 */
	public function action_folder_delete()
	{
		// Find file record
		$file = ORM::factory('Prime_File', $this->request->param('id'))
		->delete();

		// Set tree view
		$this->view = Request::factory('Prime/File/Tree')
		->execute()
		->body();
	}

	/**
	 * Rename folder
	 *
	 * @return void
	 */
	public function action_folder_rename()
	{
		try 
		{
			// Find Folder and rename
			$role = ORM::factory('Prime_File', $this->request->param('id'))
			->values($this->request->post())
			->save();
		}
		catch (ORM_Validation_Exception $e)
		{
			// Update JSON Response
			$this->json = array(
				'status'  => FALSE,
				'message' => UTF8::ucfirst(implode(',', $e->errors('model')))
			);
		}

		// Set tree view
		$this->view = Request::factory('Prime/File/Tree')
		->execute()
		->body();
	}

	/**
	 * Overload after controller execution method
	 *
	 * @return parent
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
			// Always display tree view
			$this->template->left = Request::factory('Prime/File/Tree')
			->execute();
		}

		// Call parent after
		return parent::after();
	}

}