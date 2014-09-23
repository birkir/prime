<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<?=Form::hidden($field['name'], $value);?>
	<div class="controls">
		<!--
		<?=Form::file($field['name'].(Arr::get($options, 'multiple', FALSE) ? '[]' : NULL), array(
			'class' => 'form-control',
			Arr::get($options, 'multiple', FALSE) ? 'multiple' : NULL => Arr::get($options, 'multiple', FALSE) ? 'multiple' : NULL
		));?>
		-->
		<div class="input-group">
			<div class="form-control">
				<i class="fa fa-file" style="font-size: 14px; color: #555;"></i> <?=$value;?>
			</div>
			<span class="input-group-btn">
				<button class="btn btn-default" type="button" onclick="return prime.select_list(this, '/Prime/File/Select_List/<?=Arr::get($options, 'folder', FALSE);?>', 'No file(s) selected');"><?=__('Select');?></button>
				<button class="btn btn-default" type="button"><?=__('Upload');?></button>
			</span>
		</div>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>