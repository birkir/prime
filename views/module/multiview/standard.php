<?php if (Arr::get($options, 'type', 'columns') === 'columns'): ?>

	<div class="row <?=Arr::get($options, 'classes');?>">
		<?php foreach ($items as $item): ?>
			<div class="<?=$item['name'];?>">
				<?=$item['view'];?>
			</div>
		<?php endforeach; ?>
	</div>

<?php elseif (Arr::get($options, 'type') === 'tabs'): ?>

	<div class="tabbable">
		<ul class="nav nav-tabs <?=Arr::get($options, 'classes');?>">
			<?php foreach ($items as $i => $item): ?>
				<li<?php if ($i === 0): ?> class="active"<?php endif; ?>>
					<?=HTML::anchor(implode('_', ['#tab', $region, $i]), Arr::get($item, 'name'), ['data-toggle' => 'tab']);?>
				</li>
			<?php endforeach; ?>
		</ul>
		<div class="tab-content">
			<?php foreach ($items as $i => $item): ?>
				<div class="tab-pane<?php if ($i === 0): ?> active<?php endif; ?>" id="tab_<?=$region;?>_<?=$i;?>">
					<?=Arr::get($item, 'view');?>
				</div>
			<?php endforeach; ?>
		</div>
	</div>

<?php elseif (Arr::get($options, 'type') === 'accordion'): ?>

	<div class="panel-group" id="accordion_<?=$region;?>">
		<?php foreach ($items as $i => $item): ?>
			<div class="panel panel-default">
				<div class="panel-heading">
					<h4 class="panel-title">
						<a href="#accordion_<?=$region;?>_<?=$i;?>" class="accordion-toggle" data-toggle="collapse" data-parent="#accordion_<?=$region;?>">
							<?=Arr::get($item, 'name');?>
						</a>
					</h4>
				</div>
				<div class="panel-collapse collapse<?php if ($i === 0): ?> in<?php endif; ?>" id="accordion_<?=$region;?>_<?=$i;?>">
					<div class="panel-body">
					<?=Arr::get($item, 'view');?>
					</div>
				</div>
			</div>
		<?php endforeach; ?>
	</div>

<?php endif; ?>