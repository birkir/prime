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
	 * @var array Actions allowed without authentication
	 */
	public $auto_actions = array('get');

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
	 * Generate and load file preview
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

	/**
	 * Get file contents
	 *
	 * @return void
	 */
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
	 * Dynamic Image Transformation
	 *
	 * @return void
	 */
	public function action_transform()
	{
		// Setup params
		$uri   = explode('/', $this->request->param('id'));
		$fits  = array('clip', 'crop', 'scale', 'fill');
		$crops = array('center', 'top', 'right', 'bottom', 'left', 'face');
		$dpis  = array('ldpi' => 0.75, 'mdpi' => 1, 'hdpi' => 1.5, 'xhdpi' => 2);
		$flips = array('h', 'v', 'hv');

		// Find file
		$file = ORM::factory('Prime_File', end($uri));

		// Get last updated time
		$updated = strtotime($file->updated_at);

		// Get filename
		$filename = APPPATH.'cache/files/'.$file->filename;

		if ( ! $file->loaded() OR ! file_exists($filename))
		{
			// Could not find file
			throw new Kohana_Exception('File not found.');
		}

		// Set default values
		$fit = 'clip';
		$dpi = 1;

		// Get cached filename
		$cached = APPPATH.'cache/files/transform-'.sha1($this->request->param('id').'/'.$file->filename).'.jpg';

		if ( ! file_exists($cached) OR (filemtime($cached) < $updated) OR isset($_GET['nocache']))
		{
			// Load image
			$image = Image::factory($filename);

			foreach ($uri as $i => $part)
			{
				if (isset($dpis[$part]))
				{
					// Set dpi flag
					$dpi = $dpis[$part];
				}

				if (preg_match('/[0-9]+x[0-9]+/', $part))
				{
					// Extract resize width and height
					$sizes  = explode('x', $part);

					// Max them out at 2000 pixels
					$resize = array(min(2000, intval($sizes[0])), min(2000, intval($sizes[1])));

					// Set dpi width and height
					$width = $resize[0] * $dpi;
					$height = $resize[1] * $dpi;

					if ($file->width > $width AND $file->height > $height)
					{
						// Resize image
						$image->resize($width, $height, (($fit === 'crop') ? Image::INVERSE : (($fit === 'scale') ? Image::NONE : Image::AUTO)));
					}
				}

				if ($part === 'face')
				{
					/*
					// Get face detection library
					require_once Kohana::find_file('vendor/FaceDetector', 'FaceDetector');

					// Create Face Detector and load data file
					$detector = new FaceDetector(Kohana::find_file('vendor/FaceDetector', 'detection', 'dat'));

					// Detect image
					$detector->faceDetect($filename);

					if ($face = $detector->getFace())
					{
						$face['x'] *= ($image->width / $file->width);
						$face['y'] *= ($image->height / $file->height);
						$face['w'] *= ($image->width / $file->width);

						$image->crop($face['w'], $face['w'], $face['x'], $face['y']);
					}
					*/
				}

				if (in_array($part, $crops))
				{
					// Set crop flag
					$crop = $part;

					if ($fit === 'crop' AND ($crop !== 'center' AND $crop !== 'face'))
					{
						// Set X and Y crop offset
						$x = (($crop === 'left') ? 0 : (($crop === 'right' ) ? TRUE : NULL));
						$y = (($crop === 'top' ) ? 0 : (($crop === 'bottom') ? TRUE : NULL));

						// Execute crop function
						$image->crop($resize[0] * $dpi, $resize[1] * $dpi, $x, $y);
					}
				}

				if (preg_match('/rotate\-?\+?[0-9]+/', $part))
				{
					// Rotate image by number of degrees
					$image->rotate(intval(str_replace('rotate', '', $part)));
				}

				if (in_array($part, $fits))
				{
					// Set fit flag
					$fit = $part;
				}

				if (in_array($part, $flips))
				{
					if ($part === 'h' OR $part === 'hv')
					{
						// Flip image horizontal
						$image->flip(Image::HORIZONTAL);
					}
					else if($part === 'v' OR $part === 'hv')
					{
						// Flip image vertical
						$image->flip(Image::VERTICAL);
					}
				}
			}

			// Save image to cache
			$image->save($cached, 100);
		}

		// Disable auto render
		$this->auto_render = FALSE;

		// Check for cache
		$this->check_cache(sha1($this->request->uri()).$updated);

		// Set Response body
		$this->response->body(file_get_contents($cached));

		// Set Response headers
		$this->response->headers('content-type', 'image/jpeg');
		$this->response->headers('last-modified', date('r', $updated));
		$this->response->headers('expires', gmdate('D, d M Y H:i:s', time() + (86400 * 14)));
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