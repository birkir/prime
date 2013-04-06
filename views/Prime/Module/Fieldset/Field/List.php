<?=Form::open(NULL, array('style' => 'margin: 0;', 'data-id' => $fieldset->id));?>
	<div class="data-grid with-navbar onload">
		<div class="navbar navbar-static-top">
			<div class="navbar-inner">
				<label for="" class="pull-left" style="margin: 15px 10px 0 0;"><?=__('Name');?>:</label>
				<input type="text" value="<?=$fieldset->name;?>" style="margin: 13px 0 0 0; height: 16px;" />
				<div class="btn-toolbar pull-right">
					<a href="#create" class="btn btn-success action-create" onclick="app.module.fieldset.field.create(<?=$fieldset->id;?>);"><i class="icon-file icon-white"></i> <?=__('Create');?></a>
					<a href="#edit" class="btn btn-primary disabled action-edit"><i class="icon-pencil icon-white"></i> <?=__('Edit');?></a>
					<a href="#delete" class="btn btn-danger disabled action-delete"><i class="icon-trash icon-white"></i> <?=__('Delete');?></a>
				</div>
			</div>
		</div>
		<div class="tablepanel scrollable">
			<table class="table table-condensed table-select">
				<thead class="header">
					<tr>
						<th width="5%"><?=__('Name');?></th>
						<th width="5%"><?=__('Caption');?></th>
						<th width="5%"><?=__('Group');?></th>
						<th width="5%"><?=__('Field');?></th>
						<th width="5%"><?=__('Visible');?></th>
						<th width="5%"><?=__('Required');?></th>
						<th width="5%"><?=__('Index');?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ($fieldset->fields->order_by('index', 'ASC')->find_all() as $field): ?>
						<tr data-id="<?=$field->id;?>">
							<td><?=$field->name;?></td>
							<td><?=$field->caption;?></td>
							<td><?=$field->group;?></td>
							<td><?=isset($fields[$field->field])?$fields[$field->field]:$field->field;?></td>
							<td><?=__($field->visible ? 'Yes' : 'No');?></td>
							<td><?=__($field->required ? 'Yes' : 'No');?></td>
							<td><?=$field->index;?></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
		<div class="hidden">
			<input type="text" class="pagedisplay">
			<input type="text" class="pagesize" value="10">
		</div>
	</div>
	<div class="modal-footer">
		<button class="btn btn-primary" data-dismiss="modal" aria-hidden="true"><?=__('Close');?></button>
	</div>
<?=Form::close();?>
<script>
$('.data-grid.onload').each(function () {

	var scope = this;

	// we just loaded!
	$(this).removeClass('onload');

	// attach event handler to delete
	$(this).find('.btn.action-delete').on('click', function () {
		$(scope.rows).each(function (i, item) {
			$.destroy('/prime/modules/fieldset/field', '{"id": ' + $(this).data('id') + ' }', function () {
				if ((scope.rows.length - 1) === i) {
					$(scope).parent('form').parent('.modal').load('/prime/modules/fieldset/field_list/<?=$fieldset->id;?>');
				}
			});
		});
		return false;
	});

	var theadFixed = function () {
		$(scope).find('table.table-sort thead tr:eq(0) th').each(function (i, item) {
			$(item).children().css({ width: $(item).width() - 6 });
		});
	};

	$(scope).find('table.table-select').each(function () {
		$(this).removeClass('table-select').addClass('table-sort').tablesorter({
			
		}).tablesorterPager({
			container: $(scope),
			positionFixed: false
		})
		.tableselect({
			activeClass: 'warning'
		})
		.on('applyWidgets', theadFixed)
		.on('select', function (e, rows) {
			var grid = $(scope);
			scope.rows = rows;
			if (rows.length === 0) {
				grid.find('.action-edit, .action-delete').addClass('disabled');
			} else if (rows.length === 1) {
				grid.find('.action-edit, .action-delete').removeClass('disabled');
			} else if (rows.length > 1) {
				grid.find('.action-edit').addClass('disabled');
				grid.find('.action-delete').removeClass('disabled');
			}
		}).on('tableselect.dblclick', function (e, item) {
			app.module.fieldset.field.edit(item.data('id'));
			return false;
		});
	});

	$(window).on('resize', function() {
		theadFixed();
	}).trigger('resize');

});
</script>