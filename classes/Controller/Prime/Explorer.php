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
	 * Default action displays the tree on left and
	 * upload target dropzone in view.
	 *
	 * @return void
	 */
	public function action_index()
	{
		// setup view
		$this->template->left = View::factory('Prime/Explorer/Tree')
		->bind('files', $files)
		->set('open', json_decode(Arr::get($_COOKIE, 'tree-explorer', '{}'), TRUE));

		// get list of files in application directory
		$files = Kohana::list_files(NULL, [APPPATH]);

		// no cache or logs please
		unset($files['cache']);
		unset($files['logs']);
	}

	/**
	 * Edit action will choose which type of editor will be used.
	 *
	 * @return void
	 */
	public function action_file()
	{
		$this->auto_render = FALSE;

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

	public function ace(array $file)
	{
		$view = View::factory('Prime/Explorer/Ace/Ace')
		->bind('content', $content);

		$content = file_get_contents($file['file']);

		$this->response->body($view);
	}

	public function photo()
	{

	}

} // End Explorer