<div class="control-group">
	<label><?=$caption;?></label>
	<div class="controls">
		<label for="<?=$name.'RegionSettings';?>" class="checkbox">
			<?=Form::checkbox($name, 1, $value, array('id' => $name.'RegionSettings'));?>
			<?=__('Enabled');?>
		</label>
	</div>
</div>