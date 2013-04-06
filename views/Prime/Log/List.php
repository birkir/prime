<div class="data-grid">
	<div class="tablepanel scrollable">
		<table class="table table-condensed">
			<thead>
				<tr>
					<th><?=__('Level');?></th>
					<th><?=__('Time');?></th>
					<th><?=__('Type');?> / <?=__('Message');?></th>
					<th><?=__('File');?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach (array_reverse($items) as $i => $item): ?>
					<tr>
						<td<?php if ( ! empty($item['message'])): ?> rowspan="2"<?php endif; ?>>
							<span class="label <?=$labels[$item['level']];?>"><?=$item['level'];?></span>
						</td>
						<td class="muted"><?=strftime('%H:%M:%S', $item['time']);?></td>
						<td<?php if ( ! empty($item['message'])): ?> class="muted"<?php endif; ?>><?=$item['type'];?>
							<?php if ( ! empty($item['strace'])): ?>
								<a href="#" class="btn btn-mini" style="margin-right: 10px;" data-toggle="collapse" data-target="#stack<?=$i;?>">Stack trace</a>
							<?php endif; ?></td>
						<td class="muted"><?=$item['file'];?></td>
					</tr>
					<?php if ( ! empty($item['message'])): ?>
					<tr>
						<td colspan="4" style="border-top: 0;">
							<?php if (UTF8::trim($item['message']) !== 'in'): ?>
								<pre class="prettyprint" style="border: 0; background: none; padding: 0;"><?=$item['message'];?></pre>
							<?php endif; ?>
							<div id="stack<?=$i;?>" class="collapse">
								<pre class="prettyprint trace linenums"><?=implode('<br>', $item['strace']);?></pre>
							</div>
						</td>
					</tr>
					<?php endif; ?>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</div>
<script>
	window.prettyPrint && prettyPrint();
</script>