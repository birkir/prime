<div class="control-group">
	<?=Form::label($form.$field['name'], $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::select($field['name'], Arr::get($field['options'], 'items', ['no options']), $value, ['id' => $form.$field['name']]);?>
	</div>
</div>