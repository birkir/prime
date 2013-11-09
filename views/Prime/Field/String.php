<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
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
</div>