<div class="form-group <?php if ($error): ?> has-error<?php endif; ?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<?=Form::textarea($field['name'], $value, ['id' => $id, 'class' => 'form-control input-small', 'rows' => Arr::get($options, 'rows', 3)]);?>
	<?php if ($error): ?>
		<span class="help-inline"><?=$error;?></span>
	<?php endif; ?>
</div>