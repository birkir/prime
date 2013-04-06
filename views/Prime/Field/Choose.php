<div class="control-group">
	<?=Form::label($name.'RegionSettings', $caption, array('class' => 'control-label'));?>
	<div class="controls">
		<?=Form::select($name, $options, $value, array('id' => $name.'RegionSettings', 'class' => 'input-block-level select'));?>
	</div>
</div>