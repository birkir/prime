<ul class="nav nav-tabs" style="margin: -9px;">
	<li class="active" style="display: table-cell;float: none;width: 1%; text-align: center;">
		<a href="#rightPanelPage" data-toggle="tab" style="border-color: transparent;" class="page-tab">Page</a>
	</li>
	<li style="display: table-cell;float: none;width: 1%;text-align: center;">
		<a href="#rightPanelRegion" data-toggle="tab" style="border-color: transparent;" class="region-tab">Region</a>
	</li>
</ul>
<br>
<div class="tab-content">
	<div class="tab-pane active" id="rightPanelPage">
		<span class="list-group-header" style="padding: 4px 10px;">Modules</span>
		<section class="prime-module-list">
			<div class="list-group scrollable" style="height: 200px; overflow: auto;">
				<?php foreach ($modules as $module): ?>
					<a href="#" class="list-group-item" style="padding-right: 5px;" data-id="<?=$module->id;?>">
						<h6 class="list-group-item-heading"><strong><?=$module->name;?></strong></h6>
						<p class="list-group-item-text"><?=$module->description;?></p>
					</a>
				<?php endforeach; ?>
			</div>
		</section>
	</div>
	<div class="tab-pane" id="rightPanelRegion">
		<p class="text-muted">No region selected</p>
	</div>
</div>