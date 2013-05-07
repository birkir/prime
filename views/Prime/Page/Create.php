<?=Form::open('prime/page/create', array('style' => 'margin: 0;', 'onsubmit' => 'return pageCreate(this);'));?>
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		<h3><?=__('Create page');?></h3>
	</div>
	<div class="modal-body scrollable" style="overflow: hidden;">
		<div class="control-group">
			<?=Form::label('pageName', __('Page name'), array('class' => 'control-label'));?>
			<div class="controls">
				<?=Form::input('name', NULL, array('id' => 'pageName', 'class' => 'input-block-level', 'placeholder' => 'Page name'));?>
			</div>
		</div>
		<?=$templates;?>
		<script type="text/javascript">
		// reload form selects
		app.selects();

		// focus pagename
		document.getElementById('pageName').focus();

		// lets create page
		function pageCreate(form)
		{
			var formData = $(form).serializeObject();

			formData.parent_id = <?=$item->id;?>;

			$.create('/prime/page/rest', JSON.stringify(formData), function (request) {
				if (request.status == 'success') {
					var tree = jQuery.jstree._reference(jQuery('.jstree')[0]);
					tree.refresh($('li[data-id=' + formData.parent_id + ']')[0]);
					$(form).parents('.modal').modal('hide');
				}
			});

			return false;
		}
		</script>
	</div>
	<div class="modal-footer">
		<button class="btn btn-danger" data-dismiss="modal" aria-hidden="true"><?=__('Cancel');?></button>
		<button class="btn btn-primary" type="submit"><?=__('Create page');?></button>
	</div>
<?=Form::close();?>