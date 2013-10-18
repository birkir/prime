<table class="table">
	<thead>
		<tr>
			<?php foreach ($fields as $field): ?>
				<th><?=$field->caption;?></th>
			<?php endforeach; ?>
		</tr>
	</thead>
	<tbody>
		<?php foreach ($items as $item): ?>
			<tr>
				<?php foreach ($fields as $field): ?>
					<td><?=$field->field->as_text($item);?></td>
				<?php endforeach; ?>
			</tr>
		<?php endforeach; ?>
	</tbody>
</table>

