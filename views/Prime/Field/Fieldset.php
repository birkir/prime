<div class="form-group <?php if ($error): ?> has-error<?php endif; ?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<?=Form::hidden($field['name'], $value);?>
	<div class="input-group">
		<div class="form-control">
			<?php if ($fieldset->loaded()): ?>
				<i class="fa fa-file" style="font-size: 14px; color: #555;"></i> <?=$fieldset->name;?>
			<?php else: ?>
				<span class="text-muted"><?=__('No fieldset selected');?></span>
			<?php endif; ?>
		</div>
		<span class="input-group-btn">
			<button class="btn btn-default" type="button" onclick="return prime.select_tree(this, '/Prime/Module/Fieldset/Tree', '<?=__('No fieldset selected');?>');"><?=__('Select');?></button>
		</span>
	</div>
	<?php if ($error): ?>
		<span class="help-inline"><?=$error;?></span>
	<?php endif; ?>
</div>