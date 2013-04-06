<div class="data-grid with-navbar onload" data-endpoint="/prime/media/upload/<?=$path;?>">
	<div class="navbar navbar-static-top">
		<div class="navbar-inner">
			<label for="" class="pull-left" style="margin: 15px 10px 0 0;"><?=__('Path');?>:</label>
			<input type="text" value="/<?=$path;?>" style="margin: 13px 0 0 0; height: 16px;" class="input-medium" />
			<div class="btn-toolbar pull-right">
				<a href="#select" class="btn btn-primary act-select"><?=__('Select files');?></a>
				<a href="#upload" class="btn btn-success act-start"><?=__('Upload');?></a>
				<a href="#cancel" class="btn btn-danger act-stop"><?=__('Cancel');?></a>
			</div>
		</div>
	</div>
	<div class="tablepanel scrollable">
		<table class="table table-condensed table-select">
			<thead class="header">
				<tr>
					<th width="35%"><?=__('Filename');?></th>
					<th width="20%"><?=__('Size');?></th>
					<th width="40%"><?=__('Progress');?></th>
					<th width="5%"></th>
				</tr>
			</thead>
			<tbody>
				<tr class="droptext">
					<td colspan="4" style="text-align: center; height: 60px; line-height: 60px;"><?=__('Drop files here');?></td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="hidden">
		<input type="text" class="pagedisplay">
		<input type="text" class="pagesize" value="10">
	</div>
</div>
<div class="modal-footer">
	<div class="pull-left info-speed"></div>
	<button class="btn btn-primary" data-dismiss="modal" aria-hidden="true"><?=__('Close');?></button>
</div>
<script>
$('.data-grid.onload').each(function () {
	var scope = this;
	$(this).removeClass('onload');
	$(this).each(app.upload);
});
</script>