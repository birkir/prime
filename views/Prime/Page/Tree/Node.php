<?php foreach ($nodes->recursive()->find_all() as $node): ?>

	<?php $children = $node->recursive()->count_all() > 0; ?>
	<?php $path = $url.'/'.$node->slug; ?>

	<li<?=HTML::attributes(['class' => 'list-group-item'.($children ? ' has-children' : '').(isset($open[$path]) ? ' open' : '')]);?>>

		<b class="caret" onselectstart="return false;"></b>

		<?=HTML::anchor($path, '<span><i class="icon-file"></i> '.$node->name.'</span>', ['data-id' => $node->id, 'data-href' => $path]);?>

		<?php if ($children): ?>

			<ul class="list-group">
				<?=View::factory('Prime/Page/Tree/Node')->set('nodes', $node)->set('open', $open)->set('url', $path);?>
			</ul>

		<?php endif; ?>

	</li>

<?php endforeach; ?>