<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::file($field['name'].(Arr::get($options, 'multiple', FALSE) ? '[]' : NULL), array(
			'class' => 'form-control',
			Arr::get($options, 'multiple', FALSE) ? 'multiple' : NULL => Arr::get($options, 'multiple', FALSE) ? 'multiple' : NULL
		));?>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>