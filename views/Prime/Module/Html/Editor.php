<?=Form::open(NULL, array('style' => 'margin: 0;', 'onsubmit' => 'return saveContent(this);'));?>
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		<h3><?=__('Edit content');?></h3>
	</div>
	<div class="modal-body scrollable">
		<textarea name="content" cols="30" rows="10" class="prime-module-html-<?=$id;?> input-block-level"><?=$content;?></textarea>
		<script type="text/javascript">
		var ta = $('.prime-module-html-<?=$id;?>');
		<?php if ($editor === 'wysiwyg'): ?>
		ta.wysihtml5();
		<?php endif; ?>
		function saveContent(form)
		{
			$.ajax({
				url: '/prime/modules/html/save/<?=$id;?>',
				type: 'POST',
				data: { content: ta.val() },
				success: function (response) {
					var resp = JSON.parse(response);
					if (resp.status === 'success') {
						app.page.region.reload(<?=$id;?>);
						$(form).parents('.modal').modal('hide');
					}
				}
			});
			return false;
		}
		</script>
	</div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true"><?=__('Cancel');?></button>
		<button class="btn btn-success" type="submit"><?=__('Save changes');?></button>
	</div>
<?=Form::close();?>