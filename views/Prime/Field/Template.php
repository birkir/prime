<div class="form-group <?php if ($error): ?> has-error<?php endif; ?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<?=Form::select($field['name'], $templates, $value, ['id' => $id, 'class' => 'form-control input-small']); ?>

	<!-- TODO:
	<div class="btn-group">
		<button class="btn btn-sm btn-warning" onclick="return false;"><?=__('Edit');?></button>
		<button class="btn btn-sm btn-warning dropdown-toggle" data-toggle="dropdown">
			<span class="caret"></span>
		</button>
		<ul class="dropdown-menu">
			<li><a href="#"><?=__('Manage templates');?></a></li>
			<li><a href="#"><?=__('View data');?></a></li>
			<li class="divider"></li>
			<li><a href="#"><?=__('Properties');?></a></li>
		</ul>
	</div>
	-->
	<?php if ($error): ?>
		<span class="help-inline"><?=$error;?></span>
	<?php endif; ?>
</div>