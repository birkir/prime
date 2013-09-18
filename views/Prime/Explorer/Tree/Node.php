<?php $level = isset($level) ? $level : 1; ?>
<?php uasort($nodes, function ($a, $b) {
	return is_array($a) ? (is_array($b) ? strnatcasecmp(basename(key($a)), basename(key($b))) : -1) : (is_array($b) ? 1 : (strcasecmp(basename($a), basename($b)) == 0 ? strnatcasecmp(basename(key($a)), basename(key($b))) : strcasecmp(basename($a), basename($b))));
}); ?>
<?php foreach ($nodes as $key => $val): ?>
	<li class="list-group-item<?php if (is_array($val)): ?> has-children<?php endif; ?>">
		<b class="caret" onselectstart="return false;" style="margin-left: <?=($level * 10) - 2;?>px;"></b>
		<a href="/Prime/Explorer/File/<?=$key;?>" onclick="return false;" data-file="<?=$key;?>" data-folder="<?=(string) is_array($val);?>">
			<span style="margin-left: <?=($level * 10) + 13;?>px">
				<?php if (is_array($val)): ?>
					<i class="icon-folder-close"></i> <?=basename($key);?>
				<?php else: ?>
					<i class="icon-file"></i> <?=basename($val);?>
				<?php endif; ?>
			</span>
		</a>
		<?php if (is_array($val)): ?>
	        <ul class="list-group">
	            <?=View::factory('Prime/Explorer/Tree/Node')->set('nodes', $val)->set('level', $level + 1);?>
	        </ul>
		<?php endif; ?>
	</li>
<?php endforeach; ?>