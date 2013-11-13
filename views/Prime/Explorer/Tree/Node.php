<?php
		// Sort the results alphabetically but folders first
		uasort($nodes, function ($a, $b) {
			if (($a['folder'] AND $b['folder']) OR ( ! $a['folder'] AND ! $b['folder'])) return strcasecmp($a['file'], $b['file']);
			if ($a['folder'] AND ! $b['folder']) return -1;
			if ($b['folder'] AND ! $a['folder']) return 1;
		});
?>

<?php foreach ($nodes as $key => $val): ?>

	<?php $file     = Arr::get($val, 'file', NULL); ?>
	<?php $folder   = Arr::get($val, 'folder', FALSE); ?>
	<?php $children = Arr::get($val, 'children', array()); ?>
	<?php $yours = ! (substr($folder ? NULL : $file, 0, strlen(MODPATH)) === MODPATH); ?>

	<li<?=HTML::attributes(['class' => 'list-group-item'.((count($children) > 0) ? ' has-children' : '').(isset($open[sha1($key)]) ? ' open' : '').($yours ? NULL : ' primefile')]);?>>

		<b class="caret" onselectstart="return false;"></b>

		<?=HTML::anchor('/Prime/Explorer/File/'.$key, '<span><i class="fa fa-'.($folder ? 'folder' : 'file').'"></i> '.basename($file).'</span>', [
			'onclick'      => $folder ? 'return false;' : 'return prime.view(this.href);',
			'data-id'      => sha1($key),
			'data-path'    => $key,
			'data-folder'  => (bool) $folder,
			'data-yours'   => (bool) $yours,
			$folder ? 'unselectable' : '' => $folder ? 'on' : ''
		]);?>

		<?php if (count($children) > 0): ?>

	        <ul class="list-group">
	            <?=View::factory('Prime/Explorer/Tree/Node')->set('nodes', $children)->set('open', $open);?>
	        </ul>

		<?php endif; ?>
	</li>

<?php endforeach; ?>