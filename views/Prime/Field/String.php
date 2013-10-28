<div class="form-group <?php if ($error): ?> has-error<?php endif; ?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<?=Form::input($field['name'], $value, [
		'id' => $id,
		'class' => 'form-control input-small',
		'type' => Arr::get($options, 'type', 'text'),
		'placeholder' => Arr::get($options, 'placeholder', NULL)
	]);?>
	<?php if ($error): ?>
		<span class="help-inline"><?=$error;?></span>
	<?php endif; ?>
</div>