<?php foreach ($nodes->recursive()->find_all() as $node): ?>

	<?php $children = $node->recursive()->count_all() > 0; ?>
	<?php $folder = ((int) $node->type === 0); ?>

	<li<?=HTML::attributes(['class' => 'list-group-item'.($children ? ' has-children' : '').(isset($open[$node->id]) ? ' open' : '')]);?>>

		<b class="caret" onselectstart="return false;"></b>

		<?=HTML::anchor('/Prime/Module/Fieldset/List/'.$node->id, '<span><i class="fa fa-'.($folder ? 'folder' : 'list-alt').'"></i> '.$node->name.'</span>', [
			'onclick'   => $folder || $request->is_initial() ? 'return false;' : 'return prime.view(this.href);',
			'data-id'   => $node->id,
			'data-dir'  => $folder,
			'data-href' => '/Prime/Module/Fieldset/List/'.$node->id,
			$folder ? 'unselectable' : '' => $folder ? 'on' : ''
		]);?>

		<?php if ($children): ?>

			<ul class="list-group">
				<?=View::factory('Prime/Module/Fieldset/Tree/Node')->set('nodes', $node)->set('open', $open)->set('request', $request);?>
			</ul>

		<?php endif; ?>

	</li>

<?php endforeach; ?>