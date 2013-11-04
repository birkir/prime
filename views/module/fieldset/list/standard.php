<table class="table table-hover table-striped table-condensed table-bordered">
	<thead>
		<tr>
			<?php foreach ($fields as $field): ?>
				<th><?=$field->caption;?></th>
			<?php endforeach; ?>
			<th></th>
		</tr>
	</thead>
	<tbody>
		<?php foreach ($items as $item): ?>
			<tr>
				<?php foreach ($fields as $field): ?>
					<td><?=$field->field->as_text($item);?></td>
				<?php endforeach; ?>
				<?php if ($page): ?>
					<td>
						<?=HTML::anchor($page.'/'.$item->id.URL::query(['page' => NULL]), __('more details')); ?>
					</td>
				<?php endif; ?>
			</tr>
		<?php endforeach; ?>
	</tbody>
</table>

<?=$pagination;?>