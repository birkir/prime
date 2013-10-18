<div class="form-group">
	<?=Form::label($form.$field['name'], $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<?=Form::select($field['name'], $templates, $value, ['id' => $form.$field['name'], 'class' => 'form-control input-small', 'style' => 'width: 75%']); ?>
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
	</div>
</div>