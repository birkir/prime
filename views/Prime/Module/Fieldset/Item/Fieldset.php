<div class="fullscreen-ui">
	<form action="" class="form-fieldset" onsubmit="return Prime.Module.Fieldset.SaveItem(this);">
		<input type="hidden" name="_fieldset_id" value="<?=$fieldset->id;?>">
		<input type="hidden" name="_fieldset_item_id" value="<?=$item->id;?>">
		<div class="navbar navbar-toolbar">
			<div class="btn-toolbar">
				<div class="btn-group">
					<button type="submit" class="btn btn-primary"><i class="icon-save" style="color: #fff;"></i>&nbsp; Save</a>
				</div>
				<div class="btn-group">
					<a href="/Prime/Module/Fieldset/Detail/<?=$fieldset->id;?>" class="btn btn-default" onclick="return Prime.LoadView(this.href);">
						Cancel
					</a>
				</div>
			</div>
		</div>
		<div class="scrollable">
			<?php foreach ($fieldset->fields() as $field): ?>
				<?=$field->field->as_input('form_'.$fieldset->id.'_', $item);?>
			<?php endforeach; ?>
		</div>
	</form>
</div>