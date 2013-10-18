<ul>
	<?php foreach ($items as $item): ?>
		<li>
			<?=$item->data['name'];?>
			<?=$item->data['gender'];?>
			<?=$item->data['email'];?>
			<?=$item->data['phone'];?>
		</li>
	<?php endforeach; ?>
</ul>