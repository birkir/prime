<div class="accordion <?=$classes;?>" id="accordion_<?=$region;?>">
	<?php foreach ($items as $i => $item): ?>
		<div class="accordion-group">
			<div class="accordion-heading">
				<?=HTML::anchor('#accordion'.$item['unique'], $item['name'], array('data-toggle' => 'collapse', 'data-parent' => 'accordion_'.$region));?>
			</div>
			<div class="accordion-body collapse<?=($i === 0 ? ' in' : NULL);?>" id="accordion<?=$item['unique'];?>">
				<div class="accordion-inner">
					<?=$item['view'];?>
				</div>
			</div>
		</div>
	<?php endforeach; ?>
</div>