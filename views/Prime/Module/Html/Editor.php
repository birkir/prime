<?php if ($editor_type === 'plaintext'): ?>
	<textarea name="" id="" rows="10" style="width: 100%;" class="form-control"><?=$content;?></textarea>
<?php else: ?>
	<textarea class="wysiwyg"><?=$content;?></textarea>
<?php endif; ?>