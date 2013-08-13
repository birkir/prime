<div class="navbar navbar-masthead">
	<div class="btn-toolbar" style="margin-top: 7px;">
		<div class="btn-group">
			<a href="/Prime/Field/Create/<?=$resource_id;?>?type=<?=Arr::get($_GET, 'type', NULL);?>&amp;back=<?=Arr::get($_GET, 'back', NULL);?>" onclick="return Prime.LoadView(this.href, $('section.popup'));" class="btn btn-default"><i class="icon-file-text"></i>&nbsp; Create</a>
		</div>
		<div class="btn-group">
			<a href="/Prime/Field/Edit/" onclick="return false;" class="btn btn-default" data-single data-action="edit"><i class="icon-edit"></i>&nbsp; Edit</a>
			<a href="/Prime/Field/Delete/" onclick="return false;" class="btn btn-default" data-action="delete"><i class="icon-trash"></i>&nbsp; Delete</a>
		</div>
	</div>
</div>
<div class="scrollable" style="padding-right: 20px;">
	<table class="table table-hover table-condensed table-selection table-dnd" data-reorder-api="/Prime/Field/Reorder">
		<thead>
			<tr class="nodrag">
				<th width="30" class="text-center" data-sorter="false">
					<input type="checkbox">
				</th>
				<th>Name</th>
				<th>Caption</th>
				<th>Group</th>
				<th>Field</th>
				<th>Default</th>
				<th>Visible</th>
				<th>Required</th>
				<th width="30"></th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($fields as $field): ?>
				<tr data-id="<?=$field->id;?>" ondblclick="Prime.LoadView('/Prime/Field/Edit/<?=$field->id;?>?type=<?=Arr::get($_GET, 'type', NULL);?>&amp;back=<?=Arr::get($_GET, 'back', NULL);?>', $('section.popup'));" onselectstart="return false;">
					<td class="text-center">
						<input type="checkbox">
					</td>
					<td><?=$field->name;?></td>
					<td><?=$field->caption;?></td>
					<td><?=$field->group;?></td>
					<td><?=$field->field->name;?></td>
					<td><?=$field->default;?></td>
					<td><?=$field->visible ? 'Yes' : 'No';?></td>
					<td><?=$field->required ? 'Yes' : 'No';?></td>
					<td class="reorder-handle"><i class="icon-reorder"></i></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>
<script type="text/javascript">
	$('section.popup').each(function () {
		var ui = $(this);
		ui.find('table').on('selectionchange', function () {
			var num = 0,
				actions = ui.find('.btn-toolbar [data-action]');
			for (var i in $(this).data('selected')) num++;
			if (num === 0 || num > 1) actions.addClass('disabled');
			else if (num === 1) actions.removeClass('disabled');
			if (num > 1) actions.not('[data-single]').removeClass('disabled');
		});
		ui.find('[data-action=edit]').on('click', function (e) {
			if ($(this).hasClass('disabled')) return false;
			for (var itemid in ui.find('table').data('selected')) {
				ui.find('table tbody tr').eq(itemid).trigger('ondblclick');
			}
		});
	});
</script>