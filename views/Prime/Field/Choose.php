<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::select($field['name'].($multiple ? '[]' : NULL), $items, $value, ['id' => $id, 'class' => 'form-control', $multiple ? 'multiple' : 'no' => 'multiple']);?>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>