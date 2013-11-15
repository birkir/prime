<?php if (Prime::$design_mode): ?>

	<div<?=HTML::attributes(['class' => 'prime-region', 'data-sticky' => $sticky, 'data-name' => $name, 'data-pageid' => $page->id]);?>>

		<?php foreach ($items as $i => $item): ?>

			<div<?=HTML::attributes(['class' => 'prime-region-item', 'data-id' => $i]);?>>

				<?=View::factory('Prime/Region/Item')->set('item', $item)->render();?>

			</div>
		
		<?php endforeach; ?>

		<?php if (sizeof($items) === 0): ?>
			<div class="prime-region-item prime-region-empty" data-id="0">
				<div class="prime-drop prime-drop-above" style="display: none;"><?=__('Dropzone');?></div>
			</div>
		<?php endif; ?>

	</div>

<?php else: ?>

	<?php foreach ($items as $i => $item): ?>

		<?=$item->render();?>

	<?php endforeach; ?>

<?php endif; ?>