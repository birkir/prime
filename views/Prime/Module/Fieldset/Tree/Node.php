<?php foreach ($nodes->recursive()->find_all() as $node): ?>

	<?php $children = $node->recursive()->count_all() > 0; ?>
	<?php $folder = ((int) $node->type === 0); ?>

	<li<?=HTML::attributes(['class' => 'list-group-item'.($children ? ' has-children' : '').(isset($open[$node->id]) ? ' open' : '')]);?>>

		<b class="caret" onselectstart="return false;"></b>

		<?=HTML::anchor('/Prime/Module/Fieldset/Detail/'.$node->id, '<span><i class="icon-'.($folder ? 'folder-close' : 'list-alt').'"></i> '.$node->name.'</span>', [
			'onclick'   => $folder ? 'return false;' : 'return prime.view(this.href);',
			'data-id'   => $node->id,
			'data-href' => '/Prime/Module/Fieldset/Detail/'.$node->id,
			$folder ? 'unselectable' : '' => $folder ? 'on' : ''
		]);?>

		<?php if ($children): ?>

			<ul class="list-group">
				<?=View::factory('Prime/Module/Fieldset/Tree/Node')->set('nodes', $node)->set('open', $open);?>
			</ul>

		<?php endif; ?>

	</li>

<?php endforeach; ?>