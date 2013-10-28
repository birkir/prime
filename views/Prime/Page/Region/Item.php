<ul class="prime-region-actions" style="display: none;">
	<?php foreach ($item->actions() as $action): ?>
		<li><?=$action;?></li>
	<?php endforeach; ?>
</ul>
<div class="prime-region-item-content"<?php if (isset($item->wysiwyg)): ?> contenteditable="true"<?php endif; ?>>
	<?php try { ?>
		<?=$item->render();?>
	<?php } catch (Kohana_Exception $e) { ?>
		<pre><?=__('Error loading module');?>: <?=$e->getMessage();?></pre>
	<?php } ?>
</div>