<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<div class="controls">
		<div class="input-group">
			<?=Form::select($field['name'], $templates, $value, [
				'id' => $id,
				'class' => 'form-control input-small',
				'onchange' => '$(this).next().children()[0].href = \'/Prime/Explorer/File/views/'.Arr::get($options, 'directory').'/\'+this.value+\'.php\';'
			]); ?>
			<div class="input-group-btn">
				<a href="/Prime/Explorer/File/views/<?=Arr::get($options, 'directory');?>/<?=$value;?>.php" target="_blank" class="btn btn-default" style="margin: -2px 0 0 4px; padding: 4px 12px; border-radius: 2px;"><?=__('Edit');?></a>
				<a href="#" onclick="return prime.page.region.template_settings(this, '<?=$field['name'];?>', prime.crc32('views/<?=Arr::get($options, 'directory');?>/'+$(this).parent().prev().val()+'.php'));" class="btn btn-default" style="margin: -2px 0 0 0px; padding: 4px 12px; border-radius: 2px;">Settings</a>
			</div>
		</div>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>