<div class="form-group <?php if ($error): ?> has-error<?php endif; ?>">
	<?php if (Arr::get($options, 'type', 'checkbox') === 'radio'): ?>
	<?php else: ?>
		<?=Form::hidden($field['name'], 0);?>
		<label for="<?=$id;?>" class="checkbox">
			<?=Form::checkbox($field['name'], 1, (bool) $value, ['id' => $id]);?>
			<strong><?=$field['caption'];?></strong>
		</label>
	<?php endif; ?>
	<?php if ($error): ?>
		<span class="help-inline"><?=$error;?></span>
	<?php endif; ?>
</div>