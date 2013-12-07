<?=Form::open();?>
	<div class="tabbable tabs-left">
		<ul class="nav nav-tabs">
			<?php $i = 0; ?>
			<?php foreach ($fields as $groupName => $group): ?>
				<li class="<?=($i === 0 ? 'active' : NULL);?>"><a href="#tpl_<?=$tpl;?>_<?=$i;?>" data-toggle="tab"><?=$groupName;?></a></li>
				<?php $i++; ?>
			<?php endforeach; ?>
		</ul>
		<div class="tab-content">
			<?php $i = 0; ?>
			<?php foreach ($fields as $groupName => $group): ?>
				<div class="tab-pane<?=($i === 0 ? ' active' : NULL);?>" id="tpl_<?=$tpl;?>_<?=$i;?>">
					<?php foreach ($group as $field): ?>
						<?=$field->field->input($data);?>
					<?php endforeach; ?>
				</div>
				<?php $i++; ?>
			<?php endforeach; ?>
		</div>
	</div>
	<input type="submit" class="sr-only">
<?=Form::close();?>