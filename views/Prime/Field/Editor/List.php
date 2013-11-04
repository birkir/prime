<div class="scrollable" style="margin: -20px;">
	<table class="table table-hover table-condensed table-selection table-dnd" data-resource-type="<?=$type;?>" data-resource-id="<?=$id;?>" data-reorder-api="/Prime/Field/Reorder">
		<thead>
			<tr class="nodrag">
				<th width="30" class="text-center" data-sorter="false"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></th>
				<th><?=__('Name');?></th>
				<th><?=__('Caption');?></th>
				<th><?=__('Group');?></th>
				<th><?=__('Field');?></th>
				<th><?=__('Default');?></th>
				<th><?=__('Visible');?></th>
				<th><?=__('Required');?></th>
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
					<td class="reorder-handle"><i class="fa fa-reorder"></i></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>