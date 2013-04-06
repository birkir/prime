<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Prime Template Controller
 *
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @package Prime
 * @category Controller
 * @copyright (c) 2013 SOLID Productions
 */
class Controller_Prime_Template extends Controller_Prime_Core {

	public function action_index()
	{
		$this->template->left = View::factory('Prime/Template/Tree');
	}

	public function action_edit()
	{
		$this->template->left = View::factory('Prime/Template/Tree')
		->set('path', $this->request->param('id'));
	}

	public function action_tree()
	{
		// disable auto render
		$this->auto_render = FALSE;

		$tree = Prime::ls('views');

		$response = array(
			'status' => 'success',
			'items' => $tree
		);

		$this->response->body(json_encode($response));
	}

	public function action_editor()
	{
		$this->auto_render = FALSE;

		$file = $this->request->param('id');
		$filename = realpath(APPPATH.'views/'.$file);

		$item = array(
			'name' => $file,
			'filename' => pathinfo($filename, PATHINFO_BASENAME),
			'data' => file_get_contents($filename),
			'ext'  => strtolower(pathinfo($filename, PATHINFO_EXTENSION)),
		);
		$item['mode'] = $item['ext'];

		$view = View::factory('Prime/Misc/Ace')
		->set('item', $item)
		->set('themes', Prime::ace_themes())
		->set('modes', Prime::ace_modes())
		->set('theme', Arr::get($_COOKIE, 'ace/theme', 'chrome'))
		->set('savemethod', 'app.template.save(\''.Arr::get($item, 'name').'\', editor.getValue());');

		$this->response->body($view->render());
	}

	public function action_create()
	{
		$this->auto_render = FALSE;

		$response = array(
			'status' => 'error',
			'message' => 'Could not create '.Arr::get($_POST, 'type', 'file').'. Check permissions.'
		);

		$path = APPPATH.'views/'.Arr::get($_POST, 'parent').'/'.Arr::get($_POST, 'name');

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

		$path = APPPATH.'views/'.$this->request->param('id');

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

		$file = APPPATH.'views/'.$this->request->param('id');

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
			$fh = fopen(APPPATH.'views/'.$file, 'w');
			fwrite($fh, $this->request->body());
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
}