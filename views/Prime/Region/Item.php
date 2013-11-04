<div<?=HTML::attributes($item->attrs('dropzone_a'));?>><?=('Dropzone');?></div>

<ul<?=HTML::attributes($item->attrs('actions'));?>>
	<?php foreach ($item->actions() as $action): ?>
		<li>
			<?=$action;?>
		</li>
	<?php endforeach; ?>
</ul>

<div<?=HTML::attributes($item->attrs('content'));?>>
	<?=$item->output_for_web();?>
</div>

<div<?=HTML::attributes($item->attrs('dropzone_b'));?>><?=('Dropzone');?></div>