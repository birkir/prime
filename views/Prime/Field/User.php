<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<?=Form::hidden($field['name'], $value);?>
	<div class="controls">
		<div class="input-group">
			<div class="form-control">
				<?php if ($user->loaded()): ?>
					<i class="fa fa-file" style="font-size: 14px; color: #555;"></i> <?=$user->email;?>
				<?php else: ?>
					<span class="text-muted"><?=__('No user selected');?></span>
				<?php endif; ?>
			</div>
			<span class="input-group-btn">
				<button class="btn btn-default" type="button" onclick="return prime.select_list(this, '/Prime/User/Select_List', '<?=__('No user selected');?>');"><?=__('Select');?></button>
			</span>
		</div>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>