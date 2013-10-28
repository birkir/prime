<?=Form::open();?>

	<?=Form::hidden('fieldset_id', $fieldset->id);?>

	<?php if (count($errors) > 0): ?>
		<div class="alert">
			<button type="button" class="close" data-dismiss="alert">&times;</button>
			You have some errors in your form, please fix them and try again.
		</div>
	<?php endif; ?>

	<?php foreach ($fields as $field): ?>

		<?=$field->field->as_input('form_'.$fieldset->id.'_', $item, $errors);?>

	<?php endforeach; ?>

	<?=Form::submit(NULL, __('Submit'), ['class' => 'btn']);?>

<?=Form::close();?>