<button type="button" class="close" onclick="return app.page.settings();">&times;</button>

<?=Form::open('/prime/region/settings/'.$region->id, array('class' => 'form-settings', 'onsubmit' => 'return saveSettings(this);'));?>

	<?php foreach ($items as $group => $fields): ?>
	
		<div class="nav-header"><?=__($group);?></div>
	
		<?php foreach ($fields as $field): ?>
		
			<?=$field['field']->render();?>
		
		<?php endforeach; ?>
	
	<?php endforeach; ?>

	<div class="form-actions">
		<div class="btn-toolbar">
			<button class="btn btn-primary btn-block" type="submit"><?=__('Save changes');?></button>
		</div>
	</div>

<?=Form::close();?>

<script type="text/javascript">
	app.selects();
	function saveSettings(form) {
		$(form).find('button[type=submit]').text('<?=__('Loading...');?>');
		$.ajax({
			url: $(form).attr('action'),
			type: 'POST',
			data: $(form).serialize(),
			success: function () {
				app.page.region.reload(<?=$region->id;?>);
				$(form).find('button[type=submit]').text('<?=__('Save changes');?>');
			}
		});

		return false;
	}
</script>