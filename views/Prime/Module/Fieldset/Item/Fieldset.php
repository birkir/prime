<form method="post" enctype="multipart/form-data" class="form-fieldset onload" onsubmit="return saveFieldsetItem(this);" style="height: 100%;">
	<div class="data-grid with-navbar">
		<div class="navbar navbar-static-top">
			<div class="navbar-inner">
				<div class="btn-toolbar">
					<button type="submit" class="btn btn-success"><?=__('Save changes');?></button>
					<a href="#" onclick="app.module.fieldset.item.list(<?=$fieldset->id;?>);" class="btn"><?=__('Back');?></a>
				</div>
			</div>
		</div>
		<div class="tablepanel scrollable">
			<?php $last = ''; foreach ($fieldset->fields->order_by('group', 'ASC')->order_by('index', 'ASC')->find_all() as $field): ?>
				<?php if ($last !== $field->group): ?>
				<div class="nav-header"><?=$field->group;?></div>
				<?php endif; ?>
				<?=$field->render($item);?>
			<?php $last = $field->group; endforeach; ?>
		</div>
	</div>
</form>
<script>
function saveFieldsetItem(form) {

	$.<?=$item->loaded() ? 'update' : 'create';?>('/prime/modules/fieldset/item/<?=$item->loaded() ? $item->id : $fieldset->id;?>', JSON.stringify($(form).serializeObject()), function (resposne) {
		app.module.fieldset.item.list(<?=$fieldset->id;?>);
	});

	return false;
}
$('.onload').each(function () {
	$(this).removeClass('onload');

	app.selects();

});
</script>