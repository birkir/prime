<div class="form-group">
	<label for="<?=$form.$field['name'];?>" class="checkbox">
		<?=Form::checkbox($field['name'], 1, $value, ['id' => $form.$field['name']]);?>
		<strong><?=$field['caption'];?></strong>
	</label>
</div>