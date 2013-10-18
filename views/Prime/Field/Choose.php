<div class="form-group">
	<?=Form::label($form.$field['name'], $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::select($field['name'], Arr::get($field['options'], 'items', ['no options']), $value, ['id' => $form.$field['name'], 'class' => 'form-control']);?>
	</div>
</div>