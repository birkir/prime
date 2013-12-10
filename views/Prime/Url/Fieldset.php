<?=Form::open($action, ['role' => 'form']);?>

	<div class="form-group">
		<?=Form::label('formUri', __('URI'), ['class' => 'control-label']);?>
		<?=Form::input('uri', $item->uri, ['class' => 'form-control', 'id' => 'formUri']);?>
	</div>

	<div class="form-group">
		<?=Form::label('formRedirect', __('Redirect'), ['class' => 'control-label']);?>
		<?=Form::input('redirect', $item->redirect, ['class' => 'form-control', 'id' => 'formRedirect']);?>
	</div>

	<div class="form-group">
		<?=Form::label('formPage', __('Page'), ['class' => 'control-label']);?>
		<?=Form::hidden('prime_page_id', $item->prime_page_id);?>
		<?php $p = ORM::factory('Prime_Page', $item->prime_page_id); ?>
		<div class="controls">
			<div class="input-group">
				<div class="form-control">
					<?php if ($p->loaded()): ?>
						<i class="fa fa-file" style="font-size: 14px; color: #555;"></i> <?=$p->name;?>
					<?php else: ?>
						<span class="text-muted"><?=__('No page selected');?></span>
					<?php endif; ?>
				</div>
				<span class="input-group-btn">
					<button class="btn btn-default" type="button" onclick="return prime.select_tree(this, '/Prime/Page/Tree', '<?=__('No page selected');?>');"><?=__('Select');?></button>
				</span>
			</div>
		</div>
	</div>

	<input type="submit" class="sr-only">

<?=Form::close();?>