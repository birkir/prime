<table class="table table-condensed">
	<thead>
		<tr>
			<th><?=__('Time');?></th>
			<th><?=__('Level');?></th>
			<th><?=__('Type');?></th>
			<th><?=__('Message');?></th>
			<th><?=__('File');?></th>
		</tr>
	</thead>
	<tbody>
		<?php foreach ($items as $i => $item): ?>
			
			<tr>
				<td><?=Arr::get($item, 'time')->format('Y-m-d H:i:s');?></td>
				<td><small class="label <?=$labels[$item['level']];?>"><?=Arr::get($item, 'level');?></small></td>
				<td><?=Arr::get($item, 'type');?></td>
				<td>
					<a href="#" class="btn btn-default btn-xs pull-right" onclick="prime.dialog({ title: '<?=__('Stack trace');?>', alert: true, body: $(this).children('.hidden').html() }); return false;"><?=__('stack trace');?><div class="hidden"><pre><?=implode("\n", Arr::get($item, 'strace'));?></pre></div></a>
					<?=Arr::get($item, 'message');?>
				</td>
				<td><?=Arr::get($item, 'file');?></td>
			</tr>

		<?php endforeach; ?>
	</tbody>
</table>

<ul class="pager">
  <li class="<?=($offset === 0 ? 'disabled' : '');?>"><a href="?offset=<?=($offset === 0 ? 0 : $offset - 1);?>">&larr; <?=__('Older');?></a></li>
  <li class="<?=(count($items) === 0 ? 'disabled' : '');?>"><a href="?offset=<?=(count($items) === 0 ? $offset : $offset+1);?>"><?=__('Newer');?> &rarr;</a></li>
</ul>