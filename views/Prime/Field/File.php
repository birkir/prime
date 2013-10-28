<div class="form-group <?php if ($error): ?> has-error<?php endif; ?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<div>FIELD IN PROGRESS...</div>
	<?php if ($error): ?>
		<span class="help-inline"><?=$error;?></span>
	<?php endif; ?>
</div>