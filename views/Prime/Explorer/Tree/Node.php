<?php uasort($nodes, function ($a, $b) {
	return is_array($a) ? (is_array($b) ? strnatcasecmp(basename(key($a)), basename(key($b))) : -1) : (is_array($b) ? 1 : (strcasecmp(basename($a), basename($b)) == 0 ? strnatcasecmp(basename(key($a)), basename(key($b))) : strcasecmp(basename($a), basename($b))));
}); ?>

<?php foreach ($nodes as $key => $val): ?>

	<?php $path = '/Prime/Explorer/File/'.$key; ?>
	<?php $folder = is_array($val); ?>
	<?php $children = ($folder AND count($val) > 0); ?>
	<?php $name = $folder ? $key : $val; ?>

	<li<?=HTML::attributes(['class' => 'list-group-item'.($children ? ' has-children' : '').(isset($open[$key]) ? ' open' : '')]);?>>

		<b class="caret" onselectstart="return false;"></b>

		<?=HTML::anchor($path, '<span><i class="fa fa-'.($folder ? 'folder' : 'file').'"></i> '.basename($name).'</span>', [
			'onclick'      => $folder ? 'return false;' : 'return prime.view(this.href);',
			'data-id'      => $key,
			'data-folder'  => (bool) $folder,
			$folder ? 'unselectable' : '' => $folder ? 'on' : ''
		]);?>

		<?php if ($children): ?>

	        <ul class="list-group">
	            <?=View::factory('Prime/Explorer/Tree/Node')->set('nodes', $val)->set('open', $open);?>
	        </ul>

		<?php endif; ?>
	</li>
<?php endforeach; ?>