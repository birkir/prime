<?php

class Controller_Prime_Explorer extends Controller_Prime_Template {

	public function action_index()
	{
		$this->template->left = View::factory('Prime/Explorer/Tree')
		->bind('files', $files);

		$files = Kohana::list_files(NULL, [APPPATH]);

		// no cache and logs
		unset($files['cache']);
		unset($files['logs']);
	}

} // End Explorer