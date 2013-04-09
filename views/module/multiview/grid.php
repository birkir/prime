<div class="row <?=$classes;?>">
	<?php foreach ($items as $item): ?>
		<div class="<?=$item['name'];?>">
			<?=$item['view'];?>
		</div>
	<?php endforeach; ?>
</div>