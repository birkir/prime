<div class="control-group">
	<?=Form::label($name.'RegionSettings', $caption, array('class' => 'control-label'));?>
	<div class="controls">
		<?=Form::select($name, $pages, $value, array('id' => $name.'RegionSettings', 'class' => 'input-block-level select', 'data-search' => 'true', 'data-tree' => 'true'));?>
	</div>
</div>


