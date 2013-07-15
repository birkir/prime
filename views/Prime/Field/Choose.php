<div class="control-group">
	<?=Form::label($form.$field['name'], $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::select($field['name'], $field['options']['items'], $value, ['id' => $form.$field['name']]);?>
	</div>
</div>