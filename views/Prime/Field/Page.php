<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<?=Form::hidden($field['name'], $value);?>
	<div class="controls">
		<div class="input-group">
			<div class="form-control">
				<?php if ($page->loaded()): ?>
					<i class="fa fa-file" style="font-size: 14px; color: #555;"></i> <?=$page->name;?>
				<?php else: ?>
					<span class="text-muted"><?=__('No page selected');?></span>
				<?php endif; ?>
			</div>
			<span class="input-group-btn">
				<button class="btn btn-default" type="button" onclick="return prime.select_tree(this, '/Prime/Page/Tree', '<?=__('No page selected');?>');"><?=__('Select');?></button>
			</span>
		</div>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>