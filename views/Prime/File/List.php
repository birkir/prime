<div class="fullscreen-ui file-list" data-id="<?=$folder->id;?>">
	<div class="navbar navbar-toolbar">
		<div class="btn-toolbar">
			<div class="btn-group">
			<span>
				<?=HTML::anchor('Prime/File/Upload/'.$folder->id, __('Upload files'), [
					'id'      => 'upload_btn',
					'onclick' => 'return false;',
					'class'   => 'btn btn-danger'
				]);?></span>
			</div>
			<div class="btn-group table-bind-template">
			</div>
			<div class="navbar-right">
				<div class="btn-group">
					<a href="#list" onclick="return prime.file.change_view(this);" class="btn btn-default<?=($viewtype === 'list' ? ' active' : NULL);?>"><i class="fa fa-align-justify"></i></a>
					<a href="#thumbnails" onclick="return prime.file.change_view(this);" class="btn btn-default<?=($viewtype === 'thumbnails' ? ' active' : NULL);?>"><i class="fa fa-th"></i></a>
				</div>
			</div>
    		<script id="selTemplate" type="text/x-handlebars-template">
				<a href="/Prime/File/Delete/{{id}}" onclick="return {{#if zero}}false{{else}}prime.file.delete(this){{/if}};" class="btn btn-default{{#zero}} disabled{{/zero}}" style="padding-left: 1px;">
					<i class="fa fa-trash"></i>&nbsp; <?=__('Delete');?>
				</a>
    		</script>
		</div>
	</div>
	<div class="scrollable">

		<?php $storage = Storage::factory(); ?>

		<div class="grid-group<?=$viewtype === 'thumbnails' ? NULL : ' hidden';?>">
			<?php foreach ($items as $item): ?>
				<div class="grid-group-item" data-id="<?=$item->id;?>">
					<div class="grid-group-item-bottom">
						<a href="#" class="grid-group-item-selection">
							<input type="checkbox">
							<?php if ($item->width !== NULL): ?>
								<img src="" data-src="<?=$storage->url($item->filename).'thumb.'.$item->ext;?>" alt="" data-preview="<?=$storage->url($item->filename).'preview.'.$item->ext;?>">
							<?php else: ?>
                        		<?php $image = 'thumbnail-file-generic'; ?>
								<?php $image = (in_array($item->mime, ['application/vnd.ms-excel', 'text/x-comma-separated-values', 'application/excel', 'application/vnd.oasis.opendocument.spreadsheet']) ? 'thumbnail-file-spreadsheet' : $image); ?>
								<?php $image = (in_array($item->mime, ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml', 'image/tiff']) ? 'thumbnail-file-image' : $image); ?>
								<img src="/media/Prime/img/<?=$image;?>.png" alt="" data-original="<?=$storage->url($item->filename).'.'.$item->ext;?>">
							<?php endif; ?>
						</a>
					</div>
					<span class="grid-group-item-caption"><span class="text-overflow"><?=$item->name;?></span></span>
				</div>
			<?php endforeach; ?>
		</div>

		<table class="table table-hover table-condensed table-selection table-sortable<?=$viewtype === 'list' ? NULL : ' hidden';?>" data-bind-template="#selTemplate" data-bind=".table-bind-template">
			<thead>
				<tr>
					<th width="30" class="text-center" data-sorter="false"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></th>
					<th><?=__('Name');?></th>
					<th><?=__('Extension');?></th>
					<th><?=__('Mime type');?></th>
					<th><?=__('Size');?></th>
					<th><?=__('Dimensions');?></th>
					<th><?=__('Channels');?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($items as $item): ?>
					<tr data-id="<?=$item->id;?>" data-url="<?=$storage->url($item->filename).'.'.$item->ext;?>">
						<td width="30" class="text-center" data-sorter="false"><?=Form::checkbox(NULL, NULL, FALSE, ['class' => 's']);?></td>
						<td><?=$item->name;?></td>
						<td><?=$item->ext;?></td>
						<td><?=$item->mime;?></td>
						<td><?=Text::bytes($item->size);?></td>
						<td><?= ! empty($item->width) ? $item->width.'x'.$item->height : NULL;?></td>
						<td><?= ! empty($item->channels) ? $item->bits.'-bit '.$item->channels : NULL;?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</div>