<?php $fields = $fieldset->fields->where('visible', '=', TRUE)->order_by('index', 'ASC')->find_all(); ?>
<div class="data-grid with-navbar onload">
	<div class="navbar navbar-static-top">
		<div class="navbar-inner">
			<div class="btn-toolbar">
				<a href="#create" class="btn btn-success action-create" onclick="app.module.fieldset.item.create(<?=$fieldset->id;?>);"><i class="icon-file icon-white"></i> <?=__('Create');?></a>
				<a href="#edit" class="btn btn-primary disabled action-edit"><i class="icon-pencil icon-white"></i> <?=__('Edit');?></a>
				<a href="#delete" class="btn btn-danger disabled action-delete"><i class="icon-trash icon-white"></i> <?=__('Delete');?></a>
			</div>
		</div>
	</div>
	<div class="tablepanel scrollable">
		<table class="table table-condensed table-select table-hover">
			<thead>
				<tr>
					<?php foreach ($fields as $field): ?>
						<th><?=$field->caption;?></th>
					<?php endforeach; ?>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($fieldset->items->find_all() as $item): $data = json_decode($item->data, TRUE); ?>
					<tr data-id="<?=$item->id;?>">
						<?php foreach ($fields as $field): ?>
							<td><?=isset($data[$field->name]) ? $data[$field->name] : '&nbsp;';?></td>
						<?php endforeach; ?>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<div class="navbar navbar-fixed-bottom">
		<div class="navbar-inner">
			<div class="input-prepend input-append" style="margin: 0;">
				<div class="btn-group" style="padding: 5px;">
					<a href="#" class="btn btn-small first" style="padding: 2px 6px;"><i class="icon-fast-backward" style="opacity: 0.4"></i></a>
					<a href="#" class="btn btn-small prev" style="padding: 2px 6px;"><i class="icon-backward" style="opacity: 0.4"></i></a>
					<input type="text" class="input-mini pagedisplay" style="height: 11px; font-size: 12px;width: 60px;" />
					<a href="#" class="btn btn-small next" style="padding: 2px 6px;"><div class="icon-forward" style="opacity: 0.4"></div></a>
					<a href="#" class="btn btn-small last" style="padding: 2px 6px;"><i class="icon-fast-forward" style="opacity: 0.4"></i></a>
				</div>
			</div>
			<div class="input-append pull-right" style="margin: 5px;">
  				<input class="input-mini pagesize" type="tel" value="10" style="height: 11px; font-size: 12px; width: 40px;">
  				<button class="btn btn-small" type="button">Go</button>
			</div>
			
		</div>
	</div>
</div>
<script>
$('.data-grid.onload').each(function () {

	var scope = this;

	// we just loaded!
	$(this).removeClass('onload');

	// attach event handler to delete
	$(this).find('.btn.action-delete').on('click', function () {
		$(scope.rows).each(function (i, item) {
			$.destroy('/prime/modules/fieldset/item', '{"id": ' + $(this).data('id') + ' }', function () {
				if ((scope.rows.length - 1) === i) {
					app.module.fieldset.item.list(<?=$fieldset->id;?>);
				}
			});
		});
		return false;
	});
	$(this).find('.btn.action-edit').on('click', function () {
		app.module.fieldset.item.edit((scope.rows[0]).data('id'));
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
			container: $(scope).find('.navbar-fixed-bottom'),
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
			app.module.fieldset.item.edit(item.data('id'));
			console.log('dblckick');
			return false;
		});
	});

	$(window).on('resize', function() {
		theadFixed();
	}).trigger('resize');

});
</script>