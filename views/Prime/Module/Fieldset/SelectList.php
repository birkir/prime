<div class="scrollable" style="margin: -20px; max-height: 480px; overflow: auto;">
	<table class="table table-hover table-condensed table-sortable table-filter">
		<thead>
			<tr>
				<?php foreach ($fields as $field): ?>
					<th><?=$field->caption;?></th>
				<?php endforeach; ?>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($fieldset->items->order_by('position', 'ASC')->find_all() as $item): ?>
				<tr data-id="<?=$item->id;?>">
					<?php foreach ($fields as $field): ?>
						<td><?=$field->field->text($item);?></td>
					<?php endforeach; ?>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>