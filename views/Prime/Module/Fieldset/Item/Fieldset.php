<div class="fullscreen-ui">
	<?=Form::open($action, [
		'role'     => 'form',
		'class'    => 'form-fieldset',
		'onsubmit' => 'return prime.fieldset.save(this);',
		'data-id'  => $fieldset->id
	]);?>
		<div class="navbar navbar-toolbar navbar-default">
			<div class="btn-toolbar">
				<div class="btn-group">
					<?=Form::button(NULL, __('Save'), [
						'type' => 'submit',
						'class' => 'btn btn-primary'
					]);?>
				</div>
				<div class="btn-group">
					<?=HTML::anchor('Prime/Module/Fieldset/List/'.$fieldset->id, __('Cancel'), [
						'class' => 'btn btn-default',
						'onclick' => 'return prime.view(this.href);'
					]);?>
				</div>
			</div>
		</div>
		<div class="scrollable">
			<?php foreach ($fieldset->fields() as $field): ?>
				<?=$field->field->input($item);?>
			<?php endforeach; ?>
		</div>
	<?=Form::close();?>
</div>