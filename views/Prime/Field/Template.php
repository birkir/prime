<div class="control-group">
	<?=Form::label($name.'RegionSettings', $caption, array('class' => 'control-label'));?>
	<div class="controls">
		<?=Form::select($name, $templates, $value, array('class' => 'select input-block-level')); ?>
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
		</div>
	</div>
</div>