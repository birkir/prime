<div class="<?=$groupClasses;?>">
	<?php if (Arr::get($options, 'type', 'checkbox') === 'radio'): ?>
		<label class="control-label"><?=$field['caption'];?></label>
		<div class="controls">
			<label for="<?=$id;?>_true" class="radio-inline">
				<?=Form::radio($field['name'], 1, (bool) $value === TRUE, ['id' => $id.'_true']);?> <?=__('Yes');?>
			</label>
			<label for="<?=$id;?>_false" class="radio-inline">
				<?=Form::radio($field['name'], 0, (bool) $value === FALSE, ['id' => $id.'_false']);?> <?=__('No');?>
			</label>
			<?php if ($error): ?>
				<span class="help-inline"><?=$error;?></span>
			<?php endif; ?>
		</div>
	<?php else: ?>
		<?=Form::hidden($field['name'], 0);?>
		<label for="<?=$id;?>" class="checkbox">
			<?=Form::checkbox($field['name'], 1, (bool) $value, ['id' => $id]);?>
			<strong><?=$field['caption'];?></strong>
		</label>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	<?php endif; ?>
</div>