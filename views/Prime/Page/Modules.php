<span class="list-group-header" style="padding: 4px 0;"><?=__('Modules');?></span>
<section class="prime-module-list">
	<div class="list-group scrollable">
		<?php foreach ($modules as $module): ?>
			<a href="#" class="list-group-item" data-id="<?=$module->id;?>">
				<h6 class="list-group-item-heading"><strong><?=$module->name;?></strong></h6>
				<p class="list-group-item-text"><?=$module->description;?></p>
			</a>
		<?php endforeach; ?>
	</div>
</section>