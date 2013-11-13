<div class="fullscreen-ui">
	<div class="navbar navbar-toolbar">
		<div class="btn-toolbar">
			<?=HTML::anchor('Prime/Module/Fieldset/Create/'.$fieldset->id, __('Create'), [
				'onclick' => 'return prime.view(this.href);',
				'class'   => 'btn btn-danger'
			]);?>
			<div class="table-bind-template" style="padding-left: 2px; display: inline-block;">
			</div>
    		<script id="selTemplate" type="text/x-handlebars-template">
				<a href="/Prime/Module/Fieldset/Edit/{{id}}" onclick="return {{#if one}}prime.view(this.href){{else}}false{{/if}};" class="btn btn-default{{#more}} disabled{{/more}}{{#zero}} disabled{{/zero}}">
					<?=__('Edit');?>
				</a>
				<a href="/Prime/Module/Fieldset/Delete/{{id}}" onclick="return {{#if zero}}false{{else}}prime.fieldset.delete(this){{/if}};" class="btn btn-default{{#zero}} disabled{{/zero}}">
					<?=__('Delete');?>
				</a>
				<a href="/Prime/Module/Fieldset/Publish/{{id}}" onclick="return {{#if zero}}false{{else}}prime.fieldset.publish(this){{/if}};" class="btn btn-default{{#zero}} disabled{{/zero}}">
					<?=__('Publish');?>
				</a>
    		</script>
		</div>
	</div>
	<div class="scrollable">
		<table class="table table-hover table-condensed table-selection table-sortable table-dnd" data-bind-template="#selTemplate" data-bind=".table-bind-template" data-reorder-api="/Prime/Module/Fieldset/Reorder">
			<thead>
				<tr class="nodrag">
					<th width="30" class="text-center" data-sorter="false"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></th>
					<th width="1"></th>
					<?php foreach ($fields as $field): ?>
						<th><?=$field->caption;?></th>
					<?php endforeach; ?>
					<th width="70"><?=__('Order');?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($fieldset->items->order_by('position', 'ASC')->find_all() as $i => $item): ?>
					<tr ondblclick="prime.view('/Prime/Module/Fieldset/Edit/<?=$item->id;?>');" onselectstart="return false;" data-id="<?=$item->id;?>">
						<td class="text-center">
							<?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?>
						</td>
						<td width="1">
							<?php if ($item->published !== $item->revision): ?>
								<a href="#" onclick="return false;"><i class="fa fa-pencil text-warning" title="<?=__('Unpublished changes');?>"></i></a>
							<?php endif; ?>
						</td>
						<?php foreach ($fields as $f => $field): ?>
							<td>
								<?=$field->field->text($item);?>
							</td>
						<?php endforeach; ?>
						<td class="reorder-handle"><span class="sr-only"><?=$i;?></span><i class="fa fa-reorder"></i></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</div>
