<div class="fullscreen-ui">
	<div class="navbar navbar-toolbar">
		<div class="btn-toolbar">
			<div class="btn-group">
				<a href="/Prime/Module/Fieldset/ItemCreate/<?=$fieldset->id;?>" onclick="return Prime.LoadView(this.href);" class="btn btn-default">
					<i class="icon-file-text"></i>&nbsp; Create
				</a>
			</div>
			<div class="btn-group">
				<a href="#" class="btn btn-default">
					<i class="icon-edit"></i>&nbsp; Edit
				</a>
				<a href="#" onclick="return Prime.LoadView(this.href);" class="btn btn-default">
					<i class="icon-trash"></i>&nbsp; Delete
				</a>
			</div>
			<div class="pull-right">
				<div class="btn-group">
					<a href="#" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
						<i class="icon-cog"></i>
						<span class="caret"></span>
					</a>
					<ul class="dropdown-menu pull-right">
						<li class="nav-header">Fieldset</li>
						<li><a href="/Prime/Field/Detail/<?=$fieldset->id;?>?type=Module_Fieldset&amp;back=/Prime/Module/Fieldset/Detail/<?=$fieldset->id;?>" onclick="return Prime.LoadView(this.href);">Field configure</a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div class="scrollable" style="padding-right: 20px;">
		<table class="table table-hover table-condensed table-selection table-sortable">
			<thead>
				<tr>
					<th width="30" class="text-center" data-sorter="false">
						<input type="checkbox">
					</th>
					<?php foreach ($fields as $field): ?>
						<th><?=$field->caption;?></th>
					<?php endforeach; ?>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($fieldset->items->find_all() as $item): ?>
					<tr ondblclick="Prime.LoadView('/Prime/Module/Fieldset/ItemUpdate/<?=$item->id;?>');" onselectstart="return false;" data-id="<?=$item->id;?>">
						<td class="text-center">
							<input type="checkbox">
						</td>
						<?php foreach ($fields as $field): ?>
							<td><?=$field->field->as_text($item);?></td>
						<?php endforeach; ?>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</div>