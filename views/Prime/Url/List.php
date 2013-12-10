<div class="fullscreen-ui">
	<div class="navbar navbar-toolbar">
		<div class="btn-toolbar">
			<div class="btn-group">
				<?=HTML::anchor('Prime/Url/Create/', __('Create'), [
					'data-title'  => __('New URL Mapping'),
					'data-save'   => __('Save'),
					'data-cancel' => __('Cancel'),
					'onclick'     => 'return prime.url.create(this);',
					'class'       => 'btn btn-danger'
				]);?>
			</div>
			<div class="btn-group table-bind-template">
			</div>
			<script class="table-actions-template" type="text/x-handlebars-template">
				<a href="/Prime/Url/Edit/{{id}}" data-id="{{id}}" onclick="return {{#if one}}prime.url.edit(this){{else}}false{{/if}};" class="btn btn-default{{#more}} disabled{{/more}}{{#zero}} disabled{{/zero}}" data-title="<?=__('Edit URL Mapping');?>" data-save="<?=__('Save');?>" data-cancel="<?=__('Cancel');?>" id="editBtn">
					<i class="fa fa-edit"></i> <?=__('Edit');?>
				</a>
				<a href="/Prime/Url/Delete/{{id}}" onclick="return {{#if zero}}false{{else}}prime.url.delete(this){{/if}};" class="btn btn-default{{#zero}} disabled{{/zero}}" data-title="<?=__('Delete url mapping');?>" data-message="<?=__('Are you sure you want to delete selected urls?');?>">
					<i class="fa fa-trash-o"></i> <?=__('Delete');?>
				</a>
				<a href="/Prime/Url/Export/{{id}}" onclick="return {{#if zero}}false{{else}}true(this){{/if}};" class="btn btn-default{{#zero}} disabled{{/zero}}">
					<i class="fa fa-share-square-o"></i> <?=__('Export');?>
				</a>
			</script>
		</div>
	</div>
	<div class="scrollable">
		<table class="table table-hover table-condensed table-selection table-sortable" data-bind-template=".table-actions-template" data-bind=".table-bind-template">
			<thead>
				<tr>
					<th width="30" class="text-center" data-sorter="false"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></th>
					<th><?=__('URI');?></th>
					<th><?=__('Redirect');?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($items as $i => $item): ?>
					<tr ondblclick="prime.url.edit(this);" onselectstart="return false;" data-id="<?=$item->id;?>">
						<td class="text-center"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></td>
						<td><?=$item->uri;?></td>
						<td>
							<?php if ( ! empty($item->prime_page_id) AND $p = ORM::factory('Prime_Page', $item->prime_page_id) AND $p->loaded()): ?>
								<?=$p->uri();?>
							<?php else: ?>
								<?=$item->redirect;?>
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</div>