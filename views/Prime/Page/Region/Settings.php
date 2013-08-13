<form action="" class="form-small">
	
	<?php foreach ($fields as $groupname => $group): ?>
		<div class="list-group-header" style="padding: 10px 0 0 0;"><?=__($groupname);?></div>
		<?php foreach ($group as $field): ?>
			<?php $fieldClass = call_user_func_array([$field['field'], 'factory'], [$field]); ?>
			<?=$fieldClass->as_input('Region'.$region->id, $region); ?>
		<?php endforeach; ?>
	<?php endforeach; ?>

	<div class="form-actions">
		<br>
		<div class="btn-toolbar">
			<button class="btn btn-primary btn-block" type="submit"><?=__('Save changes');?></button>
		</div>
	</div>
</form>
<script>
	$('.panel-right').each(Prime.Elements);
</script>