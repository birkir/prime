<div class="prime-region" data-prime-region="<?=$name;?>">
<?php foreach ($items as $i => $item): ?>
	<div class="prime-module" data-prime-module="<?=$i;?>">
		<?=$item;?>

	</div>
<?php endforeach; ?>

</div>