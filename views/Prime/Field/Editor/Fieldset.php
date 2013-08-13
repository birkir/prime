<form action="" onsubmit="return Prime.Field.SaveItem(this);">
	<input type="hidden" name="_field_id" value="<?=$item->id;?>">
	<input type="hidden" name="_resource_id" value="<?=$item->loaded() ? $item->resource_id : $resource_id; ?>">
	<input type="hidden" name="_resource_type" value="<?=$item->loaded() ? $item->resource_type : $_GET['type']; ?>">
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
				<input type="checkbox" name="visible" value="1" id="fieldVisible"<?=$item->visible || ! $item->loaded()?' checked="checked"':NULL;?>> <?=__('Visible');?>
			</label>
		</div>
		<div class="col-lg-2">
			<label for="fieldRequired" class="checkbox-inline" style="margin-top: 28px;">
				<input type="checkbox" name="required" value="1" id="fieldRequired"<?=$item->required?' checked="checked"':NULL;?>> <?=__('Required');?>
			</label>
			</div>
		</div>
	</div>
	<div class="form-group">
		<?=Form::label('fieldOptions', __('Options'), ['class' => 'control-label']);?>
		<?=Form::textarea('options', $item->options, ['id' => 'fieldOptions', 'placeholder' => '{"foo":"bar"}', 'rows' => 3, 'class' => 'form-control']);?>
	</div>
	<div class="navbar navbar-masthead">
		<div class="btn-toolbar" style="margin-top: 7px;">
			<div class="btn-group">
				<button type="submit" class="btn btn-primary"><i class="icon-save" style="color: #fff;"></i>&nbsp; <?=__('Save');?></a>
			</div>
			<div class="btn-group">
				<a href="/Prime/Field/Detail/<?=$item->loaded() ? $item->resource_id : $resource_id;?>?type=<?=$item->loaded() ? $item->resource_type : $_GET['type'];?>&amp;back=<?=$_GET['back'];?>" class="btn btn-default" onclick="return Prime.LoadView(this.href, $('section.popup'));">
					<?=__('Cancel');?>
				</a>
			</div>
		</div>
	</div>
</form>