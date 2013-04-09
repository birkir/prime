<div class="tabbable <?=$classes;?>">
	<ul class="nav nav-tabs">
		<?php foreach ($items as $i => $item): ?>
			<li<?=($item['id'] === 0 ? ' class="active"' : NULL);?>>
				<?=HTML::anchor('#tab'.$item['unique'], $item['name'], array('data-toggle' => 'tab', 'onclick' => ''));?>
			</li>
		<?php endforeach; ?>
	</ul>
	<div class="tab-content">
		<?php foreach ($items as $i => $item): ?>
			<div class="tab-pane<?=($item['id'] === 0 ? ' active' : NULL); ?>" id="tab<?=$item['unique'];?>">
				<?=$item['view'];?>
			</div>
		<?php endforeach; ?>
	</div>
</div>