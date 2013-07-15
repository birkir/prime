<div class="fullscreen-ui">
	<form action="" class="form-horizontal" onsubmit="return Prime.Field.SaveItem(this);">
		<input type="hidden" name="_field_id" value="<?=$item->id;?>">
		<input type="hidden" name="_resource_id" value="<?=$item->loaded() ? $item->resource_id : $resource_id; ?>">
		<input type="hidden" name="_resource_type" value="<?=$item->loaded() ? $item->resource_type : $_GET['type']; ?>">
		<div class="navbar navbar-toolbar">
			<div class="btn-toolbar">
				<div class="btn-group">
					<button type="submit" class="btn btn-primary"><i class="icon-save" style="color: #fff;"></i>&nbsp; Save</a>
				</div>
				<div class="btn-group">
					<a href="/Prime/Field/Detail/<?=$item->loaded() ? $item->resource_id : $resource_id;?>?type=<?=$item->loaded() ? $item->resource_type : $_GET['type'];?>&amp;back=<?=$_GET['back'];?>" class="btn btn-default" onclick="return Prime.LoadView(this.href);">
						Cancel
					</a>
				</div>
			</div>
		</div>
		<div class="scrollable" style="padding: 0 20px;">
			<br>
			<div class="row">
				<?=Form::label('fieldName', __('Name'), ['class' => 'col-lg-1 control-label']);?>
				<div class="col-lg-3">
					<?=Form::input('name', $item->name, ['id' => 'fieldName', 'placeholder' => 'Field name']);?>
				</div>
			</div>
			<div class="row">
				<?=Form::label('fieldCaption', __('Caption'), ['class' => 'col-lg-1 control-label']);?>
				<div class="col-lg-3">
					<?=Form::input('caption', $item->caption, ['id' => 'fieldCaption', 'placeholder' => 'Field caption']);?>
				</div>
			</div>
			<div class="row">
				<?=Form::label('fieldGroup', __('Group'), ['class' => 'col-lg-1 control-label']);?>
				<div class="col-lg-3">
					<?=Form::input('group', $item->group, ['id' => 'fieldGroup', 'placeholder' => 'Group name']);?>
				</div>
			</div>
			<div class="row">
				<?=Form::label('fieldType', __('Field type'), ['class' => 'col-lg-1 control-label']);?>
				<div class="col-lg-3">
					<?=Form::select('field', $fields, $item->loaded() ? $item->field->type : NULL, ['class' => 'col-lg-12']);?>
				</div>
			</div>
			<div class="row">
				<?=Form::label('fieldDefault', __('Default'), ['class' => 'col-lg-1 control-label']);?>
				<div class="col-lg-3">
					<?=Form::input('default', $item->default, ['id' => 'fieldDefault', 'placeholder' => 'Default value']);?>
				</div>
			</div>
			<div class="row">
				<?=Form::label('fieldOptions', __('Options'), ['class' => 'col-lg-1 control-label']);?>
				<div class="col-lg-3">
					<?=Form::textarea('options', $item->options, ['id' => 'fieldOptions', 'placeholder' => '{"foo":"bar"}', 'rows' => 3]);?>
				</div>
			</div>
			<div class="row">
				<?=Form::label('fieldFlags', __('Flags'), array('class' => 'col-lg-1 control-label'));?>
				<div class="col-lg-3">
					<label for="fieldVisible" class="checkbox-inline">
						<input type="checkbox" name="visible" value="1" id="fieldVisible"<?=$item->visible || ! $item->loaded()?' checked="checked"':NULL;?>> <?=__('Visible');?>
					</label>
					<label for="fieldRequired" class="checkbox-inline">
						<input type="checkbox" name="required" value="1" id="fieldRequired"<?=$item->required?' checked="checked"':NULL;?>> <?=__('Required');?>
					</label>
				</div>
			</div>
			<div class="row">
				<?=Form::label('fieldIndex', __('Order'), array('class' => 'col-lg-1 control-label'));?>
				<div class="col-lg-3">
					<?=Form::input('position', $item->position, array('id' => 'fieldIndex', 'class' => 'input-block-level', 'placeholder' => 'Order index'));?>
				</div>
			</div>
		</div>
	</form>
</div>