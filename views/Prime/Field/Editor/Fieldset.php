<?=Form::open($action, ['role' => 'form']);?>
	<?=Form::hidden('visible', 0);?>
	<?=Form::hidden('required', 0);?>
	<div class="row">
		<div class="col-lg-6">
			<div class="form-group">
				<?=Form::label('fieldName', __('Name'), ['class' => 'control-label']);?>
				<?=Form::input('name', $item->name, ['id' => 'fieldName', 'placeholder' => 'Field name', 'class' => 'form-control']);?>
			</div>
			<div class="form-group">
				<?=Form::label('fieldCaption', __('Caption'), ['class' => 'control-label']);?>
				<?=Form::input('caption', $item->caption, ['id' => 'fieldCaption', 'placeholder' => 'Field caption', 'class' => 'form-control']);?>
			</div>
			<div class="form-group">
				<?=Form::label('fieldGroup', __('Group'), ['class' => 'control-label']);?>
				<?=Form::input('group', $item->group, ['id' => 'fieldGroup', 'placeholder' => 'Group name', 'class' => 'form-control']);?>
			</div>
			<div class="form-group">
				<?=Form::label('fieldDefault', __('Default'), ['class' => 'control-label']);?>
				<?=Form::input('default', $item->default, ['id' => 'fieldDefault', 'placeholder' => 'Default value', 'class' => 'form-control']);?>
			</div>
			<div class="row">
				<div class="col-lg-6">
					<label for="fieldVisible" class="checkbox-inline">
						<?=Form::checkbox('visible', 1, $item->loaded() ? (bool) $item->visible : TRUE, ['id' => 'fieldVisible']);?>
						<?=__('Visible');?>
					</label>
				</div>
				<div class="col-lg-6">
					<label for="fieldRequired" class="checkbox-inline">
						<?=Form::checkbox('required', 1, (bool) $item->required, ['id' => 'fieldRequired']);?>
						<?=__('Required');?>
					</label>
				</div>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="form-group" style="margin-bottom: 46px;">
				<?=Form::label('fieldType', __('Field type'), ['class' => 'control-label']);?>
				<?=Form::select('field', $fields['select'], $item->loaded() ? $item->field->type : NULL, ['class' => 'col-lg-12']);?>
			</div>
			<?php foreach ($fields['items'] as $i => $f): ?>
				<?php $params = $f->params(); ?>
				<div id="f<?=$f->name;?>" class="hide field-options">
					<?php foreach ($params as $field): ?>
						<?php $fieldClass = call_user_func_array([$field['field'], 'factory'], [$field]); ?>
						<?=$fieldClass->input(json_decode($item->options, TRUE)); ?>
					<?php endforeach; ?>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
	<input type="submit" class="sr-only" />
<?=Form::close();?>