<div class="control-group">
	<?=Form::label($form.$field['name'], $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::input($field['name'], $value, ['id' => $form.$field['name'], 'class' => 'input-small']);?>
	</div>
</div>