<ul class="prime-region-actions" style="display: none;">
	<?php foreach ($item->actions() as $action): ?>
		<li><?=$action;?></li>
	<?php endforeach; ?>
</ul>
<div class="prime-region-item-content"<?php if (isset($item->wysiwyg)): ?> contenteditable="true"<?php endif; ?>>
	<?=$item->render();?>
</div>