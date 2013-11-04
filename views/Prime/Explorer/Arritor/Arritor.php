<div class="fullscreen-ui arritor">
	<div class="navbar navbar-toolbar navbar-default navbar-static-top">
		<div class="navbar-brand navbar-left"><?=$filename;?></div>
		<div class="btn-toolbar navbar-right">
			<a href="#" class="navbar-btn btn btn-danger arritor-save"><?=__('Save changes');?></a>
		</div>
	</div>
	<div class="scrollable">
		<form method="post" action="/Prime/Explorer/Save_Arritor/<?=$uri;?>" style="padding: 20px; width: 60%;">
			<?=View::factory('Prime/Explorer/Arritor/Editor')->set('table', $table);?>
		</form>
	</div>
</div>