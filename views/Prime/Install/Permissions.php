<div class="form-signin" style="max-width: 500px;">
	<div class="well">
		<h1>Permissions</h1>
		<p>Please make the following directories writable:</p>

		<div class="list-group-item"><i class="fa fa-<?=$writable['app'] ? 'check' : 'check-empty';?>"></i> <?=APPPATH;?></div>
		<div class="list-group-item"><i class="fa fa-<?=$writable['config'] ? 'check' : 'check-empty';?>"></i> <?=APPPATH.'config/';?></div>
		<div class="list-group-item"><i class="fa fa-<?=$writable['cache'] ? 'check' : 'check-empty';?>"></i> <?=APPPATH.'cache/';?></div>
		<div class="list-group-item"><i class="fa fa-<?=$writable['logs'] ? 'check' : 'check-empty';?>"></i> <?=APPPATH.'logs/';?></div>

		<p>
			<?php $fail = false; ?>
			<?php foreach ($writable as $check): ?>
				<?php if ( ! $check) $fail = true; ?>
			<?php endforeach; ?>
			<?php if ($fail): ?>
			<?php endif; ?>
		</p>

		<?php if ($fail): ?>
			<?=HTML::anchor('Prime/Install/Permissions', 'Check again <i class="fa fa-refresh"></i>', ['class' => 'btn btn-lg btn-warning']);?>
		<?php endif; ?>
		<?=HTML::anchor('Prime/Install/Database', 'Continue'.($fail ? ' without permissions' : NULL), ['class' => 'btn btn-lg btn-danger']);?>
	</div>
</div>