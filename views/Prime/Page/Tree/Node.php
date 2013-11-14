<?php foreach ($nodes->order_by('position', 'ASC')->find_all() as $node): ?>

	<?php $children = ORM::factory('Prime_Page')->where('parent_id', '=', $node->id)->count_all() > 0; ?>
	<?php $path = $url.'/'.$node->slug; ?>

	<li<?=HTML::attributes(['class' => 'list-group-item'.($children ? ' has-children' : '').(isset($open[$node->id]) ? ' open' : '').($node->visible ? '' : ' disabled')]);?>>

		<b class="caret" onselectstart="return false;"></b>
	
		<?php if ($node->published !== $node->revision): ?>
			<i class="fa fa-pencil right text-info"></i>
		<?php endif; ?>

		<?php $icon = '<i class="fa fa-file"></i>'; ?>

		<?=HTML::anchor($path, '<span>'.$icon.' '.$node->name.'</span>', ['data-id' => $node->id, 'data-href' => $path, 'data-visible' => $node->visible]);?>

		<?php if ($children): ?>
			<?php $children = ORM::factory('Prime_Page')->where('parent_id', '=', $node->id); ?>
			<ul class="list-group">
				<?=View::factory('Prime/Page/Tree/Node')->set('nodes', $children)->set('open', $open)->set('url', $path);?>
			</ul>

		<?php endif; ?>

	</li>

<?php endforeach; ?>