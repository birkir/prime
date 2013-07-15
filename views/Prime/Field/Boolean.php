<div class="control-group">
	<label><?=$field['caption'];?></label>
	<div class="controls">
		<label for="<?=$form.$field['name'];?>" class="checkbox">
			<?=Form::checkbox($field['name'], 1, $value, ['id' => $form.$field['name']]);?>
			<?=__('Enabled');?>
		</label>
	</div>
</div>