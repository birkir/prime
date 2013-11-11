<div class="<?=$groupClasses;?>">
	<?=Form::label($id, $field['caption'], ['class' => 'control-label']);?>
	<?=Form::hidden($field['name'], $value);?>
	<div class="controls">
		<div class="input-group">
			<?php if ($type === 'item'): ?>
				<span class="input-group-addon"><?=$fieldset->name;?></span>
			<?php endif; ?>
			<div class="form-control">
				<?php if ($item->loaded()): ?>
					<i class="fa fa-file" style="font-size: 14px; color: #555;"></i> <?=$item->name;?>
				<?php else: ?>
					<span class="text-muted"><?=__('No fieldset '.($type === 'item' ? 'item ' : NULL).'selected');?></span>
				<?php endif; ?>
			</div>
			<span class="input-group-btn">
				<?php if ($type === 'item'): ?>
					<button class="btn btn-default" type="button" onclick="return prime.select_list(this, '/Prime/Module/Fieldset/Select_List/<?=$fieldset->id;?>', '<?=__('No fieldset item selected');?>');"><?=__('Select');?></button>
				<?php else: ?>
					<button class="btn btn-default" type="button" onclick="return prime.select_tree(this, '/Prime/Module/Fieldset/Tree', '<?=__('No fieldset selected');?>');"><?=__('Select');?></button>
				<?php endif; ?>
			</span>
		</div>
		<?php if ($error): ?>
			<span class="help-inline"><?=$error;?></span>
		<?php endif; ?>
	</div>
</div>