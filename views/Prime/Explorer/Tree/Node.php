<?php uasort($nodes, function ($a, $b) {
	return is_array($a) ? (is_array($b) ? strnatcasecmp(basename(key($a)), basename(key($b))) : -1) : (is_array($b) ? 1 : (strcasecmp(basename($a), basename($b)) == 0 ? strnatcasecmp(basename(key($a)), basename(key($b))) : strcasecmp(basename($a), basename($b))));
}); ?>

<?php foreach ($nodes as $key => $val): ?>

	<?php $path = '/Prime/Explorer/File/'.$key; ?>
	<?php $folder = is_array($val); ?>
	<?php $name = $folder ? $key : $val; ?>

	<li<?=HTML::attributes(['class' => 'list-group-item'.($folder ? ' has-children' : '').(isset($open[$path]) ? ' open' : '')]);?>>

		<b class="caret" onselectstart="return false;"></b>

		<?=HTML::anchor($path, '<span><i class="icon-'.($folder ? 'folder-close' : 'file').'"></i> '.basename($name).'</span>', [
			'onclick'      => $folder ? 'return false;' : 'return prime.view(this.href);',
			'data-file'    => $key,
			'data-folder'  => (string) $folder,
			$folder ? 'unselectable' : '' => $folder ? 'on' : ''
		]);?>

		<?php if ($folder): ?>

	        <ul class="list-group">
	            <?=View::factory('Prime/Explorer/Tree/Node')->set('nodes', $val)->set('open', $open);?>
	        </ul>

		<?php endif; ?>
	</li>
<?php endforeach; ?>