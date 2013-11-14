<div class="scrollable" style="margin: -20px; max-height: 480px; overflow: auto;">
	<table class="table table-hover table-condensed table-sortable table-filter">
		<thead>
			<tr>
				<th><?=__('Full name');?></th>
				<th><?=__('Email');?></th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($users->order_by('email', 'ASC')->find_all() as $item): ?>
				<tr data-id="<?=$item->id;?>">
					<td><?=$item->fullname;?></td>
					<td><?=$item->email;?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>