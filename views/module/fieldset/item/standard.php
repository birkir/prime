<h3><?=$fieldset->name;?> Item</h3>

<dl class="dl-horizontal">
	<?php foreach ($fields as $field): ?>
		<dt><?=$field->caption;?></dt>
		<dd><?=$field->field->as_text($item);?></dd>
	<?php endforeach; ?>
</dl>

<?php if ($page): ?>
	<?=HTML::anchor($page.URL::query(), __('Go back'), ['class' => 'btn btn-primary']); ?>
<?php endif; ?>