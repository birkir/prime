<?php foreach ($nodes->files->where('type', '=', 0)->order_by('name', 'ASC')->find_all() as $node): ?>

	<?php $children = $node->files->where('type', '=', 0)->count_all() > 0; ?>

	<li<?=HTML::attributes(['class' => 'list-group-item'.($children ? ' has-children' : '').(isset($open[$node->id]) ? ' open' : '')]);?>>

		<b class="caret" onselectstart="return false;"></b>

		<?=HTML::anchor('/Prime/File/List/'.$node->id, '<span><i class="fa fa-folder"></i> '.$node->name.'</span>', [
			'onclick'   => 'return prime.view(this.href);',
			'data-id'   => $node->id,
			'data-href' => '/Prime/File/List/'.$node->id
		]);?>

		<?php if ($children): ?>

			<ul class="list-group">
				<?=View::factory('Prime/File/Tree/Node')->set('nodes', $node)->set('open', $open)->set('request', $request);?>
			</ul>

		<?php endif; ?>

	</li>

<?php endforeach; ?>