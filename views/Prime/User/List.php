<div class="data-grid with-navbar">
	<div class="navbar navbar-static-top">
		<div class="navbar-inner">
			<div class="btn-toolbar actions">
				<a href="#" onclick="" class="btn action btn-success">
					<i class="icon-file icon-white"></i> <?=__('Create');?>
				</a>
				<a href="#" onclick="this.disabled ? null : app.modal('/prime/user/edit/' + this.rone);" class="btn btn-primary action disabled" data-eq="1">
					<i class="icon-pencil icon-white"></i> <?=__('Edit');?>
				</a>
				<a href="#" onclick="this.disabled ? null : app.modal('/prime/user/remove/' + this.rlist);" class="btn btn-danger action disabled" data-gt="0">
					<i class="icon-trash icon-white"></i> <?=__('Delete');?>
				</a>
			</div>
		</div>
	</div>
	<div class="tablepanel scrollable">
		<table class="table table-condensed table-select table-hover" data-dblclick="/prime/user/edit/%1">
			<thead>
				<tr>
					<th><?=__('Username');?></th>
					<th><?=__('Name');?></th>
					<th><?=__('E-Mail Address');?></th>
					<th><?=__('Last login');?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($items as $item): ?>
					<tr data-id="<?=$item->id;?>">
						<td><?=$item->username;?></td>
						<td><?=$item->name;?></td>
						<td><?=$item->email;?></td>
						<td><?=date('Y-m-d H:i', $item->last_login);?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?=View::factory('Prime/Misc/DatagridPager');?>
</div>