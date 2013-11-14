<div class="fullscreen-ui" data-fieldset-id="<?=$fieldset->id;?>">
	<?=Form::open($action, [
		'role'     => 'form',
		'class'    => 'form-fieldset',
		'onsubmit' => 'return prime.fieldset.save(this);',
		'data-id'  => $fieldset->id
	]);?>
		<div class="navbar navbar-toolbar navbar-default">
			<div class="btn-toolbar">
				<div class="btn-group">
					<?=Form::button(NULL, __('Save changes'), [
						'type' => 'submit',
						'class' => 'btn btn-danger'
					]);?>
				</div>
				<div class="btn-group">
					<?=HTML::anchor('Prime/Module/Fieldset/List/'.$fieldset->id, __('Cancel'), [
						'class' => 'btn btn-default',
						'onclick' => 'return prime.view(this.href);'
					]);?>
				</div>
				<div class="btn-group">
					<label for="publishOnSave" class="checkbox-inline" style="padding-top: 10px;">
						<?=Form::checkbox('_publish', 1, (bool) Cookie::get('prime-publish-on-save', FALSE), array('id' => 'publishOnSave'));?>
						<?=__('Publish on save');?>
					</label>
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