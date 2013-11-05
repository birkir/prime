<div class="fullscreen-ui">
	<div class="navbar navbar-toolbar">
		<div class="btn-toolbar">
			<div class="btn-group">
				<?=HTML::anchor('Prime/Module/Fieldset/Create/'.$fieldset->id, __('Create'), [
					'onclick' => 'return prime.view(this.href);',
					'class'   => 'btn btn-danger'
				]);?>
			</div>
			<div class="btn-group table-bind-template">
			</div>
    		<script id="selTemplate" type="text/x-handlebars-template">
				<a href="/Prime/Module/Fieldset/Edit/{{id}}" onclick="return {{#if one}}prime.view(this.href){{else}}false{{/if}};" class="btn btn-default{{#more}} disabled{{/more}}{{#zero}} disabled{{/zero}}">
					<i class="fa fa-edit"></i>&nbsp; <?=__('Edit');?>
				</a>
				<a href="/Prime/Module/Fieldset/Delete/{{id}}" onclick="return {{#if zero}}false{{else}}prime.fieldset.delete(this){{/if}};" class="btn btn-default{{#zero}} disabled{{/zero}}">
					<i class="fa fa-trash"></i>&nbsp; <?=__('Delete');?>
				</a>
    		</script>
		</div>
	</div>
	<div class="scrollable">
		<table class="table table-hover table-condensed table-selection table-sortable table-dnd" data-bind-template="#selTemplate" data-bind=".table-bind-template" data-reorder-api="/Prime/Module/Fieldset/Reorder">
			<thead>
				<tr class="nodrag">
					<th width="30" class="text-center" data-sorter="false"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></th>
					<?php foreach ($fields as $field): ?>
						<th><?=$field->caption;?></th>
					<?php endforeach; ?>
					<th width="70">Order</th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($fieldset->items->order_by('position', 'ASC')->find_all() as $item): ?>
					<tr ondblclick="prime.view('/Prime/Module/Fieldset/Edit/<?=$item->id;?>');" onselectstart="return false;" data-id="<?=$item->id;?>">
						<td class="text-center"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></td>
						<?php foreach ($fields as $field): ?>
							<td><?=$field->field->as_text($item);?></td>
						<?php endforeach; ?>
						<td class="reorder-handle"><i class="fa fa-reorder"></i></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</div>