<?=Form::open(NULL, array('class' => 'form-horizontal', 'style' => 'margin: 0;', 'onsubmit' => 'return fieldSave(this);'));?>
	<input type="hidden" name="prime_module_fieldset_id" value="<?=$fieldset->id;?>">
	<div class="modal-body scrollable">
		<div class="control-group">
			<?=Form::label('fieldName', __('Name'), array('class' => 'control-label'));?>
			<div class="controls">
				<?=Form::input('name', $item->name, array('id' => 'fieldName', 'class' => 'input-block-level', 'placeholder' => 'Field name'));?>
			</div>
		</div>
		<div class="control-group">
			<?=Form::label('fieldCaption', __('Caption'), array('class' => 'control-label'));?>
			<div class="controls">
				<?=Form::input('caption', $item->caption, array('id' => 'fieldCaption', 'class' => 'input-block-level', 'placeholder' => 'Field caption'));?>
			</div>
		</div>
		<div class="control-group">
			<?=Form::label('fieldGroup', __('Group'), array('class' => 'control-label'));?>
			<div class="controls">
				<?=Form::input('group', $item->group, array('id' => 'fieldGroup', 'class' => 'input-block-level', 'placeholder' => 'Group name'));?>
			</div>
		</div>
		<div class="control-group">
			<?=Form::label('fieldType', __('Field type'), array('class' => 'control-label'));?>
			<div class="controls">
				<?=Form::select('field', $fields, $item->field, array('class' => 'input-block-level select'));?>
			</div>
		</div>
		<div class="control-group">
			<?=Form::label('fieldDefault', __('Default'), array('class' => 'control-label'));?>
			<div class="controls">
				<?=Form::input('default', $item->default, array('id' => 'fieldDefault', 'class' => 'input-block-level', 'placeholder' => 'Default value'));?>
			</div>
		</div>
		<div class="control-group">
			<?=Form::label('fieldOptions', __('Options'), array('class' => 'control-label'));?>
			<div class="controls">
				<?=Form::input('properties', $item->properties, array('id' => 'fieldOptions', 'class' => 'input-block-level', 'placeholder' => 'Field options'));?>
			</div>
		</div>

		<?php foreach ($fields as $name => $f): ?>
			<?php // $class = $name::facor ?>
		<?php endforeach; ?>

		<div class="control-group">
			<?=Form::label('fieldFlags', __('Flags'), array('class' => 'control-label'));?>
			<div class="controls">
				<label for="fieldVisible" class="checkbox inline">
					<input type="checkbox" name="visible" value="1" id="fieldVisible"<?=$item->visible || ! $item->loaded()?' checked="checked"':NULL;?>> <?=__('Visible');?>
				</label>
				<label for="fieldRequired" class="checkbox inline">
					<input type="checkbox" name="required" value="1" id="fieldRequired"<?=$item->required?' checked="checked"':NULL;?>> <?=__('Required');?>
				</label>
			</div>
		</div>
		<div class="control-group">
			<?=Form::label('fieldIndex', __('Order'), array('class' => 'control-label'));?>
			<div class="controls">
				<?=Form::input('index', $item->index, array('id' => 'fieldIndex', 'class' => 'input-block-level', 'placeholder' => 'Order index'));?>
			</div>
		</div>
		<script type="text/javascript">
		app.selects();
		function fieldSave(form)
		{
			$.<?=$item->loaded() ? 'update' : 'create';?>('/prime/modules/fieldset/field<?=$item->loaded() ? '/'.$item->id : NULL;?>', JSON.stringify($(form).serializeObject()), function (request) {
				if (request.status == 'success') {
					$('form[data-id=<?=$fieldset->id;?>]').parent('.modal').load('/prime/modules/fieldset/field_list/<?=$fieldset->id;?>');
					$(form).parents('.modal').modal('hide');
				}
			});

			return false;
		}
		</script>
	</div>
	<div class="modal-footer">
		<button class="btn btn-danger" data-dismiss="modal" aria-hidden="true"><?=__('Cancel');?></button>
		<button class="btn btn-primary" type="submit"><?=__(($item->loaded() ? 'Save changes' : 'Create field'));?></button>
	</div>
<?=Form::close();?>