<?php if (Prime::$design_mode): ?>
<div class="prime-region" data-name="<?=$name;?>" data-pageid="<?=$page->id;?>">
<?php endif; ?>
	<?php foreach ($items as $i => $item): ?>
		<?php if (Prime::$design_mode): ?>
			<div class="prime-region-item" data-id="<?=$i;?>">
				<?php if ($item === reset($items)): ?>
					<div class="prime-drop" data-position="above" style="display: none;"><?=__('drop above');?></div>
				<?php endif; ?>
				<?=View::factory('Prime/Page/Region/Item')->set('item', $item)->render();?>
				<div class="prime-drop" data-position="below" style="display: none;"><?=__('drop below');?></div>
			</div>
		<?php else: ?>
			<?=$item->render();?>
		<?php endif; ?>
	<?php endforeach; ?>
	<?php if (empty($items)): ?>
		<div class="prime-drop" style="display: none;"><?=__('drop to empty');?></div>
	<?php endif; ?>
<?php if (Prime::$design_mode): ?>
</div>
<?php endif; ?>