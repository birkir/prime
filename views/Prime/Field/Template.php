<div class="control-group">
	<?=Form::label($form.$field['name'], $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::select($field['name'], $templates, $value, ['id' => $form.$field['name'], 'class' => 'input-small']); ?>
		<?php if (isset($field['options']['edit']) AND $field['options']['edit'] === TRUE): ?>
			<div class="btn-group btn-block" style="padding-top: 5px;">
				<button class="btn btn-small btn-warning" style="width:85%;" onclick="return false;"><?=__('Edit template');?></button>
				<button class="btn btn-small btn-warning dropdown-toggle" style="width: 15%;" data-toggle="dropdown">
					<span class="caret"></span>
				</button>
				<ul class="dropdown-menu">
					<li><a href="#"><?=__('Manage templates');?></a></li>
					<li><a href="#"><?=__('View data');?></a></li>
					<li class="divider"></li>
					<li><a href="#"><?=__('Properties');?></a></li>
				</ul>
			</div>
		<?php endif; ?>
	</div>
</div>