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
	 * Render files tree
	 * 
	 * @return void
	 */
	public function action_tree()
	{
		$this->auto_render = FALSE;

		// setup view
		$view = View::factory('Prime/File/Tree')
		->bind('nodes', $nodes)
		->bind('open', $open)
		->set('request', $this->request);

		$open = $this->request->is_initial() ? [] : json_decode(Arr::get($_COOKIE, 'tree-files', '{}'), TRUE);

		// get nodes
		$nodes = ORM::factory('Prime_File');

		$this->response->body($view);
	}

	public function action_index()
	{
		// show tree
		$this->template->left = Request::factory('Prime/File/Tree')
		->execute();
	}

	public function action_create()
	{
		$this->auto_render = FALSE;

		$file = ORM::factory('Prime_File');
		$file->parent_id = $this->request->param('id');
		$file->type = 0;
		$file->name = $this->request->post('name');
		$file->save();

		$view = Request::factory('Prime/File/Tree')->execute();

		$this->response->body($view);
	}

	public function action_remove_folder()
	{
		$this->auto_render = FALSE;

		$file = ORM::factory('Prime_File', $this->request->param('id'));
		$file->delete();

		$view = Request::factory('Prime/File/Tree')->execute();

		$this->response->body($view);
	}

	public function action_ckeditor()
	{
		// show tree
		$this->template->left = Request::factory('Prime/File/Tree')
		->execute();

		// some UI hacks here
		$this->template->left .= '<div id="ckbrowser" data-func="'.$this->request->query('CKEditorFuncNum').'"></div><style>.navbar-fullscreen { display: none !important; } .fullscreen { top: 0 !important; }</style>';
	}

	public function action_preview()
	{
		$this->auto_render = FALSE;

		$file = ORM::factory('Prime_File', $this->request->param('id'));

		if ( ! $file->loaded())
			throw HTTP_Exception::factory(404, 'File not found');

		// last updated
		$updated = strtotime($file->updated_at);

		// generate 256x256 sized thumbnails
		try 
		{
			$image = Image::factory(APPPATH.'cache/files/'.$file->filename);

			// resize the image
			if ($image->width > 256)
			{
				$image->resize(256, 256);
			}

			// setup response mime type
			$this->response->headers('content-type', $file->mime);

			$cache = APPPATH.'cache/files/'.$file->filename.'@256x256';

			if ( ! file_exists($cache) OR filemtime($cache) < $updated)
			{
				$image->save($cache);
			}

			// render image
			$view = file_get_contents($cache);
		}
		catch (Kohana_Exception $e)
		{
			$image = 'thumbnail-file-generic';

			$spreadsheets = [
				'application/vnd.ms-excel',
				'application/vnd.oasis.opendocument.spreadsheet'
			];

			$images = [
				'image/gif',
				'image/jpeg',
				'image/pjpeg',
				'image/png',
				'image/svg+xml',
				'image/tiff'
			];

			if (in_array($file->mime, $spreadsheets))
				$image = 'thumbnail-file-spreadsheet';

			if (in_array($file->mime, $images))
				$image = 'thumbnail-file-image';

			// setup response mime type
			// $this->response->headers('content-type', 'image/png');

			// get file
			$view = file_get_contents(Kohana::find_file('media', 'Prime/img/'.$image, 'png'));
		}

		$etag_sum = md5(base64_encode($view).'256x256');

		// Render as image and cache for 1 hour
		$this->response
		->headers('cache-control', 'max-age='.(Date::HOUR).', public, must-revalidate')
		->headers('expires', gmdate('D, d M Y H:i:s', time() + Date::HOUR).' GMT')
		->headers('last-modified', date('r', $updated))
		->headers('etag', $etag_sum);

		if ($this->request->headers('if-none-match') AND (string) $this->request->headers('if-none-match') === $etag_sum)
		{
			$this->response->status(304);
			$this->response->headers('content-length', 0);
		}
		else
		{
			$this->response->body($view);
		}
	}

	public function action_list()
	{
		$this->auto_render = FALSE;

		// get folder
		$folder = ORM::factory('Prime_File', $this->request->param('id'));

		// make sure its found and a folder type of result
		if ( ! $folder->loaded() OR intval($folder->type) !== 0)
		{
			throw HTTP_Exception::factory(404, 'Folder not found');
		}

		// find all items in folder
		$items = $folder->files
		->where('type', '=', 1)
		->order_by('updated_at', 'DESC')
		->find_all();

		// setup view
		$view = View::factory('Prime/File/List')
		->set('folder', $folder)
		->set('items', $items)
		->set('viewtype', Arr::get($_COOKIE, 'prime-viewmode', 'list'));

		$this->response->body($view);
	}

	public function action_upload()
	{
		$this->auto_render = FALSE;

		if ($this->request->method() === HTTP_Request::POST)
		{
			// set no-cache headers
			$this->response->headers('expires', 'Mon, 26 Jul 1997 05:00:00 GMT');
			$this->response->headers('last-modifier', gmdate('D, d M Y H:i:s'). ' GMT');
			$this->response->headers('cache-control', 'no-store, no-cache, must-revalidate');
			$this->response->headers('cache-control', 'post-check=0, pre-check=0');
			$this->response->headers('pragma', 'no-cache');

			// set max execution time
			@set_time_limit(5 * 60);

			// get filename
			$filename = isset($_REQUEST['name']) ? $_REQUEST['name'] : ( ! empty($_FILES) ? $_FILES['file']['name'] : uniqid('file_'));

			// set filepath
			$filepath = APPPATH.'cache/files/'.sha1($filename);

			// chunking might be enabled
			$chunk = Arr::get($_REQUEST, 'chunk', 0);
			$chunks = Arr::get($_REQUEST, 'chunks', 0);

			// Open temp file
			if ( ! $out = @fopen($filepath.'.part', $chunks ? 'ab' : 'wb'))
			{
				die('{"jsonrpc" : "2.0", "error" : {"code": 102, "message": "Failed to open output stream."}, "id" : "id"}');
			}

			if ( ! empty($_FILES))
			{
				if ($_FILES['file']['error'] || ! is_uploaded_file($_FILES['file']['tmp_name']))
				{
					die('{"jsonrpc" : "2.0", "error" : {"code": 103, "message": "Failed to move uploaded file."}, "id" : "id"}');
				}

				// Read binary input stream and append it to temp file
				if ( ! $in = @fopen($_FILES['file']['tmp_name'], 'rb'))
				{
					die('{"jsonrpc" : "2.0", "error" : {"code": 101, "message": "Failed to open input stream."}, "id" : "id"}');
				}
			}
			else
			{        
				if ( ! $in = @fopen('php://input', 'rb'))
				{
					die('{"jsonrpc" : "2.0", "error" : {"code": 101, "message": "Failed to open input stream."}, "id" : "id"}');
				}
			}

			while ($buff = fread($in, 4096))
			{
				fwrite($out, $buff);
			}

			@fclose($out);
			@fclose($in);

			// Check if file has been uploaded
			if ( ! $chunks || $chunk == $chunks - 1)
			{
				// Strip the temp .part suffix off 
				rename($filepath.'.part', $filepath);

				// Get fileinfo
				$fileinfo = pathinfo($filename);

				$item = ORM::factory('Prime_File');
				$item->parent_id = $this->request->param('id');
				$item->type = 1;
				$item->name = $filename;
				$item->ext  = $fileinfo['extension'];
				$item->mime = File::mime_by_ext($fileinfo['extension']);
				$item->size = filesize($filepath);

				// Parse image files
				if ($image = getimagesize($filepath))
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

				$item->filename = sha1($filename);
				$item->save();
			}

			return;
		}

		$view = View::factory('Prime/File/Upload');

		$this->response->body($view);
	}

	public function action_delete()
	{
		$files = explode(':', $this->request->param('id'));
		$view = NULL;

		foreach ($files as $file)
		{
			$item = ORM::factory('Prime_File', $file);
			$item->delete();
		}
	}

}