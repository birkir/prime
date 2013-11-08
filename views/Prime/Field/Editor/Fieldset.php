<?=Form::open($action, ['role' => 'form']);?>
	<?=Form::hidden('visible', 0);?>
	<?=Form::hidden('required', 0);?>
	<div class="row">
		<div class="col-lg-6">
			<div class="form-group">
				<?=Form::label('fieldName', __('Name'), ['class' => 'control-label']);?>
				<?=Form::input('name', $item->name, ['id' => 'fieldName', 'placeholder' => 'Field name', 'class' => 'form-control']);?>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="form-group">
				<?=Form::label('fieldCaption', __('Caption'), ['class' => 'control-label']);?>
				<?=Form::input('caption', $item->caption, ['id' => 'fieldCaption', 'placeholder' => 'Field caption', 'class' => 'form-control']);?>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-lg-6">
			<div class="form-group">
				<?=Form::label('fieldGroup', __('Group'), ['class' => 'control-label']);?>
				<?=Form::input('group', $item->group, ['id' => 'fieldGroup', 'placeholder' => 'Group name', 'class' => 'form-control']);?>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="form-group">
				<?=Form::label('fieldType', __('Field type'), ['class' => 'control-label']);?>
				<?=Form::select('field', $fields, $item->loaded() ? $item->field->type : NULL, ['class' => 'col-lg-12']);?>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-lg-6">
			<div class="form-group">
				<?=Form::label('fieldDefault', __('Default'), ['class' => 'control-label']);?>
				<?=Form::input('default', $item->default, ['id' => 'fieldDefault', 'placeholder' => 'Default value', 'class' => 'form-control']);?>
			</div>
		</div>
		<div class="col-lg-2">
			<label for="fieldVisible" class="checkbox-inline" style="margin-top: 28px;">
				<?=Form::checkbox('visible', 1, $item->loaded() ? (bool) $item->visible : TRUE, ['id' => 'fieldVisible']);?>
				<?=__('Visible');?>
			</label>
		</div>
		<div class="col-lg-2">
			<label for="fieldRequired" class="checkbox-inline" style="margin-top: 28px;">
				<?=Form::checkbox('required', 1, (bool) $item->required, ['id' => 'fieldRequired']);?>
				<?=__('Required');?>
			</label>
			</div>
		</div>
	</div>
	<div class="form-group">
		<?=Form::label('fieldOptions', __('Options'), ['class' => 'control-label']);?>
		<?=Form::textarea('options', $item->options, ['id' => 'fieldOptions', 'placeholder' => '{"foo":"bar"}', 'rows' => 3, 'class' => 'form-control']);?>
	</div>
	<input type="submit" class="sr-only" />
<?=Form::close();?>