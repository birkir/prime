<div class="scrollable" style="margin: -20px;">
	<table class="table table-hover table-condensed table-selection table-dnd" data-resource-type="<?=$type;?>" data-resource-id="<?=$id;?>" data-reorder-api="/Prime/Field/Reorder">
		<thead>
			<tr class="nodrag">
				<th width="30" class="text-center" data-sorter="false"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></th>
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
				<tr data-id="<?=$field->id;?>" onselectstart="return false;">
					<td class="text-center"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></td>
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