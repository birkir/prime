<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::select($field['name'], $templates, $value, ['id' => $id, 'class' => 'form-control input-small']); ?>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>