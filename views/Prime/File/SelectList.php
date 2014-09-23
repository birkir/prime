<div class="scrollable" style="margin: -20px; max-height: 480px; overflow: auto;">
	<table class="table table-hover table-condensed table-sortable table-filter">
		<thead>
			<tr>
				<th><?=__('Filename');?></th>
				<th><?=__('Size');?></th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($files as $item): ?>
				<tr data-id="<?=$item->id;?>">
					<td><?=$item->name;?></td>
					<td><?=Text::bytes($item->size);?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>