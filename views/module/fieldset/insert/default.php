<?=Form::open();?>

	<?php foreach ($fields as $field): ?>

		<?=$field->field->as_input('form_'.$fieldset->id.'_', $item);?>

	<?php endforeach; ?>

	<?=Form::submit(NULL, __('Submit'), ['class' => 'btn']);?>

<?=Form::close();?>