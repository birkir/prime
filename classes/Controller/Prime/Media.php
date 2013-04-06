<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Media Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Media extends Controller_Prime_Core {

	public function action_index()
	{
		$this->template->left = View::factory('Prime/Media/Tree');

		$this->view = '';
	}

	public function action_edit()
	{
		$this->template->left = View::factory('Prime/Media/Tree')
		->set('path', $this->request->param('id'));
	}

	public function action_editor()
	{
		$this->auto_render = FALSE;

		// get requested file
		$file = $this->request->param('id');

		// get real path
		$filename = realpath(APPPATH.'media/'.$file);

		// setup item
		$item = array(
			'name' => $file,
			'filename' => pathinfo($filename, PATHINFO_BASENAME),
			'data' => file_get_contents($filename),
			'ext'  => strtolower(pathinfo($filename, PATHINFO_EXTENSION)),
		);

		// get mime type
		$mime = File::mime_by_ext($item['ext']);

		// editable extensions
		$editable = array('less', 'coffee', 'txt', 'js', 'php', 'java', 'cpp', 'sass');

		// text editor
		if (substr($mime, 0, 4) === 'text' OR in_array($item['ext'], $editable))
		{
			$view = View::factory('Prime/Misc/Ace')
			->set('item', $item)
			->set('themes', Prime::ace_themes())
			->set('modes', Prime::ace_modes())
			->set('theme', Arr::get($_COOKIE, 'ace/theme', 'chrome'))
			->set('savemethod', 'app.media.save(\''.Arr::get($item, 'name').'\', editor.getValue());');
		}

		// image viewer
		else if (substr($mime, 0, 5) === 'image')
		{
			$view = View::factory('Prime/Media/Image')
			->set('item', $item);
		}

		// binary viewer
		else 
		{
			$view = View::factory('Prime/Media/Binary')
			->set('item', $item);
		}

		$this->response->body($view->render());
	}

	public function action_compile()
	{
		// auto render false
		$this->auto_render = FALSE;

		// setup response
		$response = array(
			'status'  => 'error',
			'message' => 'Parser not found.'
		);

		// set data for parsing
		$data = utf8_decode($this->request->body());

		// choose parser
		switch($this->request->param('id'))
		{
			case "less":

				// create less instance
				$less = new lessc;

				// set import directories
				$less->setImportDir(array(
					APPPATH,
					APPPATH.'media',
					APPPATH.'media/less',
					APPPATH.'media/css'
				));

				try
				{
					$response['result'] = $less->compile($data);
					$response['status'] = 'success';
				}
				catch (Exception $e)
				{
					$response['message'] = $e->getMessage();
				}

			break;

			case "coffee":

				// create coffeescript instance
				CoffeeScript\Init::load();

				// parse contents
				try
				{
					$response['result'] = CoffeeScript\Compiler::compile($data, array('filename' => 'buffer.coffee', 'header' => FALSE, 'bare' => TRUE));
					$response['status'] = 'success';
				}
				catch (Exception $e)
				{
					$response['message'] = $e->getMessage();
				}

			break;
		}

		// response
		$this->response->body(json_encode($response));
	}

	public function action_create()
	{
		$this->auto_render = FALSE;

		$response = array(
			'status' => 'error',
			'message' => 'Could not create '.Arr::get($_POST, 'type', 'file').'. Check permissions.'
		);

		$path = APPPATH.'media/'.Arr::get($_POST, 'parent').'/'.Arr::get($_POST, 'name');

		if (Arr::get($_POST, 'type') === 'folder')
		{
			if (mkdir($path, 0777, TRUE)) {
				chmod($path, 0777);
				$response['status'] = 'success';
				$response['message'] = Arr::get($_POST, 'parent').'/'.Arr::get($_POST, 'name');
			}
		}
		else
		{
			if (touch($path)) {
				chmod($path, 0777);
				$response['status'] = 'success';
				$response['message'] = Arr::get($_POST, 'parent').'/'.Arr::get($_POST, 'name');
			}
		}

		$this->response->body(json_encode($response));
	}

	public function action_rename()
	{
		$this->auto_render = FALSE;

		$response = array(
			'status' => 'error',
			'message' => 'Could not rename. Check permissions.'
		);

		$path = APPPATH.'media/'.$this->request->param('id');

		$dir = pathinfo($path, PATHINFO_DIRNAME);

		if (rename($path, $dir.'/'.$_POST['name'])) {
			$response['status'] = 'success';
			$response['message'] = str_replace(APPATH, NULL, $dir.'/'.$_POST['name']);
		}

		$this->response->body(json_encode($response));
	}

	public function action_remove()
	{
		$this->auto_render = FALSE;

		$response = array(
			'status' => 'error',
			'message' => 'Could not remove '.Arr::get($_POST, 'name').'. Check permissions.'
		);

		$file = APPPATH.'media/'.$this->request->param('id');

		if ( ! is_dir($file)) {
			if (unlink($file)) {
				$response['status'] = 'success';
			}
		} else {
			try {
				rmdir($file);
				$response['status'] = 'success';
			} catch (ErrorException $e) {}
		}

		$this->response->body(json_encode($response));
	}

	public function action_save()
	{
		$this->auto_render = FALSE;

		$file = $this->request->param('id');

		$response = array(
			'status' => 'error'
		);

		try
		{
			$fh = fopen(APPPATH.'media/'.$file, 'w');
			fwrite($fh, utf8_decode($this->request->body()));
			fclose($fh);
			$response['status'] = 'success';
			$response['message'] = '<strong>Saved</strong> Your file has been saved.';
		}
		catch (ErrorException $e)
		{
			$response['message'] = '<strong>Could not save file</strong> Check permissions.';
		}

		$this->response->body(json_encode($response));
	}

	public function action_tree()
	{
		// disable auto render
		$this->auto_render = FALSE;

		$tree = array(
			'data' => array(
				'title' => 'media',
				'attr' => array(
					'href' => '#'
				),
				'icon' => 'icon-folder-close'
			),
			'state' => 'open',
			'attr' => array(
				'data-type' => 'folder',
				'id' => sha1('media'),
			),
			'children' => Prime::ls('media')
		);

		$response = array(
			'status' => 'success',
			'items' => $tree
		);

		$this->response->body(json_encode($response));
	}

	public function action_upload()
	{
		// disable auto render
		$this->auto_render = FALSE;

		// when accepting upload data
		if ($this->request->method() === HTTP_Request::POST)
		{
			// set return headers for nocache
			$this->response->headers(array(
				'Expires'       => 'Mon, 26 Jul 1997 05:00:00 GMT',
				'Last-Modified' => gmdate("D, d M Y H:i:s") . ' GMT',
				'Cache-Control' => 'no-store, no-cache, must-revalidate',
				'Cache-Control' => 'post-check=0, pre-check=0',
				'Pragma'        => 'no-cache'
			));

			// no removal of spaces
			Upload::$remove_spaces = FALSE;

			// build json response 
			$response = array(
				'jsonrpc' => '2.0',
				'id' => 'id',
				'request' => $_REQUEST
			);

			// collect upload information
			$upload = array(
				'target' => APPPATH.'media'.DIRECTORY_SEPARATOR.$this->request->param('id'),
				'name'   => Arr::get($_REQUEST, 'name', NULL),
				'offset' => Arr::get($_REQUEST, 'offset',  0),
				'total'  => Arr::get($_REQUEST, 'total',   0),
				'file'   => $_FILES['file'],
				'it'     => 1
			);

			// extract file path info
			$upload['path'] = pathinfo($upload['target'].DIRECTORY_SEPARATOR.$upload['name']);

			// rename file if exists
			while (file_exists($upload['target'].DIRECTORY_SEPARATOR.$upload['name']))
			{
				$upload['name'] = $upload['path']['filename'].' - Copy'.($upload['it'] === 1 ? NULL : ' ('.$upload['it'].')').'.'.$upload['path']['extension'];
				$upload['it']++;
			}

			// check if file was chunked
			if ($upload['total'] > 0)
			{
				// extract file path info
				$upload['path'] = pathinfo($upload['target'].DIRECTORY_SEPARATOR.$upload['name']);

				// total number of pieces
				$path = $upload['target'].DIRECTORY_SEPARATOR.$upload['path']['filename'];

				// set start piece
				$upload['piece'] = '001';

				// increment while exists
				while (file_exists($path.'.'.$upload['piece']))
				{
					// create new piece increment
					$upload['piece'] = str_pad(intval($upload['piece']) + 1, 3, '0', STR_PAD_LEFT);
				}

				// move uploaded file
				Upload::save($upload['file'], $upload['path']['filename'].'.'.$upload['piece'], $upload['target']);

				// if last chunck
				if (($upload['offset'] + $upload['file']['size']) >= $upload['total'])
				{
					// join chunck pieces
					File::join($path);

					// loop through chunks
					for ($i = 1; $i <= intval($upload['piece']); $i++)
					{
						// remove them
						@unlink($path.'.'.str_pad($i, 3, '0', STR_PAD_LEFT));
					}

					// rename with extension
					rename($path, $upload['target'].DIRECTORY_SEPARATOR.$upload['name']);

					// chmod to 0777 for disk access
					chmod($upload['target'].DIRECTORY_SEPARATOR.$upload['name'], 0777);
				}
			}
			else
			{
				// just save as plain file
				Upload::save($upload['file'], $upload['name'], $upload['target'], 0777);
			}

			// return the response body setter
			return $this->response->body(json_encode($response));
		}

		$view = View::factory('Prime/Misc/Upload')
		->set('path', $this->request->param('id'));

		$this->response->body($view->render());
	}

} // End Prime Media Controller