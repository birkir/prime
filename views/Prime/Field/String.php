<div class="<?=$groupClasses;?>">
	<?php $prefix = Arr::get($options, 'prefix', NULL); ?>
	<?php $suffix = Arr::get($options, 'suffix', NULL); ?>
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?php if ( ! empty($prefix) OR ! empty($suffix)): ?>
		<div class="input-group">
		<?php endif; ?>
			<?php if ( ! empty($prefix)): ?>
				<span class="input-group-addon"><?=$prefix;?></span>
			<?php endif; ?>
			<?=Form::input($field['name'], $value, [
				'id' => $id,
				'class' => 'form-control input-small',
				'type' => Arr::get($options, 'type', 'text'),
				'placeholder' => Arr::get($options, 'placeholder', NULL)
			]);?>
			<?php if ( ! empty($suffix)): ?>
				<span class="input-group-addon"><?=$suffix;?></span>
			<?php endif; ?>
		<?php if ( ! empty($prefix) OR ! empty($suffix)): ?>
			</div>
		<?php endif; ?>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>