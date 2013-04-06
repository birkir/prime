<?=Form::open('prime/region/delete', array('style' => 'margin: 0;', 'onsubmit' => 'return regionDelete(this);'));?>
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		<h3><?=__('Delete region');?></h3>
	</div>
	<div class="modal-body scrollable">
		<p><?=__('Are you sure about delete this region?');?></p>
		<script type="text/javascript">
		function regionDelete(form)
		{
			$.getJSON('/prime/region/remove/<?=$item->id;?>?confirm=true', function (request) {
				if (request.status == 'success') {
					app.page.region.remove(<?=$item->id;?>, true);
					$(form).parents('.modal').modal('hide');
				}
			});

			return false;
		}
		</script>
	</div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true"><?=__('Cancel');?></button>
		<button class="btn btn-danger" type="submit"><?=__('Delete region');?></button>
	</div>
<?=Form::close();?>