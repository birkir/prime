<div class="fullscreen-ui">
	<div class="navbar navbar-toolbar">
		<div class="btn-toolbar">
			<div class="btn-group">
				<?=HTML::anchor('Prime/User/Create/'.$role->id, __('Create'), [
					'data-title'  => __('New user'),
					'data-save'   => __('Save'),
					'data-cancel' => __('Cancel'),
					'onclick'     => 'return prime.user.create(this);',
					'class'       => 'btn btn-danger'
				]);?>
			</div>
			<div class="btn-group table-bind-template">
			</div>
			<script class="table-actions-template" type="text/x-handlebars-template">
				<a href="#" data-id="{{id}}" onclick="return {{#if one}}prime.user.edit(this){{else}}false{{/if}};" class="btn btn-default{{#more}} disabled{{/more}}{{#zero}} disabled{{/zero}}">
					<i class="fa fa-edit"></i>&nbsp; <?=__('Edit');?>
				</a>
				<a href="/Prime/User/Remove/{{id}}" onclick="return {{#if zero}}false{{else}}prime.user.delete(this){{/if}};" class="btn btn-default{{#zero}} disabled{{/zero}}" data-title="<?=__('Delete user');?>" data-message="<?=__('Are you sure you want to delete selected users?');?>">
					<i class="fa fa-trash"></i>&nbsp; <?=__('Delete');?>
				</a>
			</script>
		</div>
	</div>
	<div class="scrollable">
		<table class="table table-hover table-condensed table-selection table-sortable" data-bind-template=".table-actions-template" data-bind=".table-bind-template" data-role="<?=$role->id;?>">
			<thead>
				<tr>
					<th width="30" class="text-center" data-sorter="false"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></th>
					<th><?=__('Full name');?></th>
					<th><?=__('Email');?></th>
					<th><?=__('Logins');?></th>
					<th><?=__('Last login');?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($items as $item): ?>
					<tr ondblclick="prime.user.edit(this);" onselectstart="return false;" data-id="<?=$item->id;?>">
						<td class="text-center"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></td>
						<td><?=$item->fullname;?></td>
						<td><?=$item->email;?></td>
						<td><?=$item->logins;?></td>
						<td><?=($item->last_login === NULL) ? __('Never') : date('Y-m-d H:i:s', $item->last_login);?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</div>