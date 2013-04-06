<?=Form::open('prime/page/delete', array('style' => 'margin: 0;', 'onsubmit' => 'return pageDelete(this);'));?>
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		<h3><?=__('Delete page');?></h3>
	</div>
	<div class="modal-body scrollable">
		<p><?=__('Are you sure about delete the page :page?', array(':page' => $item->name));?></p>
		<script type="text/javascript">
		function pageDelete(form)
		{
			$.destroy('/prime/page/rest/<?=$item->id;?>', {}, function (request) {
				if (request.status == 'success') {
					var tree = jQuery.jstree._reference(jQuery('.jstree')[0]);
					tree.remove(document.getElementById('page_id_<?=$item->id;?>'));
					$(form).parents('.modal').modal('hide');
				}
			});

			return false;
		}
		</script>
	</div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true"><?=__('Cancel');?></button>
		<button class="btn btn-danger" type="submit"><?=__('Delete page');?></button>
	</div>
<?=Form::close();?>