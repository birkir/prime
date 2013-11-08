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
		// Display latest files

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
			// Find reference file
			$file = ORM::factory('Prime_File', $this->request->query('file'));
			
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
	 * Preview file
	 *
	 * @return void
	 */
	public function action_preview()
	{
		// Disable auto render
		$this->auto_render = FALSE;

		// Find file
		$file = ORM::factory('Prime_File', $this->request->param('id'));

		if ( ! $file->loaded())
		{
			// Could not find file
			throw HTTP_Exception::factory(404, 'File not found.');
		}

		// Get file last updated time
		$updated = strtotime($file->updated_at);

		try 
		{
			// Set cached filename
			$cache = APPPATH.'cache/files/'.$file->filename.'@256x256';

			if ( ! file_exists($cache) OR filemtime($cache) < $updated OR isset($_GET['nocache']))
			{
				if ($file->mime === 'application/pdf') 
				{
					// Yes we can generate PDF previews
					$image = new Imagick(APPPATH.'cache/files/'.$file->filename.'[0]');
					$image->setResolution(300, 300);
					$image->setImageFormat('png');
					$width  = $image->getImageWidth();
					$height = $image->getImageHeight();
					$image->scaleImage($width < $height ? NULL : 256, $height < $width ? NULL : 256);
					$image->writeImage($cache);
				}
				else
				{
					// Find image in upload folder
					$image = Image::factory(APPPATH.'cache/files/'.$file->filename);

					if ($image->width > 256)
					{
						// Resize image to max width/height
						$image->resize(256, 256, Image::AUTO);
					}

					// Attempt to save to filepath
					$image->save($cache);
				}
			}

			// Setup response MIME-Type
			$this->response->headers('content-type', ($file->mime === 'application/pdf') ? 'image/png' : $file->mime);

			// Render image
			$body = file_get_contents($cache);
		}
		catch (Kohana_Exception $e)
		{
			// Default image
			$image = 'thumbnail-file-generic';

			// Spreadsheets mime list
			$spreadsheets = ['application/vnd.ms-excel', 'application/vnd.oasis.opendocument.spreadsheet'];

			// Image mime list
			$images = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml', 'image/tiff'];

			if (in_array($file->mime, $spreadsheets))
			{
				// Set spreadsheet image 
				$image = 'thumbnail-file-spreadsheet';
			}

			if (in_array($file->mime, $images))
			{
				// Set image image
				$image = 'thumbnail-file-image';
			}

			// Display file
			$body = file_get_contents(Kohana::find_file('media', 'Prime/img/'.$image, 'png'));

			// Set png mime type
			$this->response->headers('content-type', 'image/png');
		}

		// Check for cache
		$this->check_cache(sha1($this->request->uri()).$updated);

		// Set Response body
		$this->response->body($body);

		// Set Response headers
		$this->response->headers('last-modified', date('r', $updated));
		$this->response->headers('expires', gmdate('D, d M Y H:i:s', time() + (86400 * 14)));
	}

	public function action_get()
	{
		// Disable auto render
		$this->auto_render = FALSE;

		// Find file
		$file = ORM::factory('Prime_File', $this->request->param('id'));

		if ( ! $file->loaded())
		{
			// Could not find file
			throw HTTP_Exception::factory(404, 'File not found.');
		}

		// Add mime types
		$this->response->headers('content-type', $file->mime);

		// Set response body
		$this->response->body(file_get_contents(APPPATH.'cache/files/'.$file->filename));
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

			// Set filepath
			$filepath = APPPATH.'cache/files/'.sha1($filename);

			// Chunking might be enabled
			$chunk = Arr::get($_REQUEST, 'chunk', 0);
			$chunks = Arr::get($_REQUEST, 'chunks', 0);

			// Set error message
			$error = FALSE;

			if ( ! $out = @fopen($filepath.'.part', $chunks ? 'ab' : 'wb'))
			{
				$error = array('code' => 102, 'message' => 'Failed to open output stream.');
			}
			else if ( ! empty($_FILES) AND ($_FILES['file']['error'] OR ! is_uploaded_file($_FILES['file']['tmp_name'])))
			{
				$error = array('code' => 103, 'message' => 'Failed to move uploaded file.');
			}
			else if ( ! isset($_FILES['file']['tmp_name']) OR ! $in = @fopen($_FILES['file']['tmp_name'], 'rb'))
			{
				$error = array('code' => 101, 'message' => 'Failed to open input stream.');
			}
			else if ( ! $in = @fopen('php://input', 'rb'))
			{
				$error = array('code' => 101, 'message' => 'Failed to open input stream.');
			}

			if ($error !== FALSE)
			{
				// Setup JSON Response
				$response = array(
					'jsonrpc' => '2.0',
					'error'   => $error,
					'id'      => 'id'
				);

				// Response JSON encoded data
				$this->response->body(json_encode($response));
				return;
			}

			while ($buff = fread($in, 4096))
			{
				// Write input buffer to output buffer
				fwrite($out, $buff);
			}

			// Close buffers
			@fclose($out);
			@fclose($in);

			if ( ! $chunks || $chunk === $chunks - 1)
			{
				// Strip the temp .part suffix off 
				rename($filepath.'.part', $filepath);

				// Get fileinfo
				$fileinfo = pathinfo($filename);

				// Create file record
				$item = ORM::factory('Prime_File');
				$item->parent_id = $this->request->param('id');
				$item->type = 1;
				$item->name = $filename;
				$item->ext  = $fileinfo['extension'];
				$item->mime = File::mime_by_ext($fileinfo['extension']);
				$item->size = filesize($filepath);
				$item->filename = sha1($filename);

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