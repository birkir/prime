<?=Form::open();?>
	<legend><?=$fieldset->name;?></legend>
	<?php foreach ($fields as $field): ?>
		<div class="control-group">
			<?=$field->render($item);?>
		</div>
	<?php endforeach; ?>
	<div class="control-group">
		<button class="btn btn-primary" type="submit"><?=__('Save');?></button>
	</div>
<?=Form::close();?>