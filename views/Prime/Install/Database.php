<form class="form-signin" style="max-width: <?php if ( ! empty($config)): ?>800<?php else: ?>550<?php endif; ?>px;" method="post">
	<div class="well">

		<h1>Database connection</h1>

		<?php if ( ! empty($config)): ?>

			<p>Paste this code to <strong><?=APPPATH;?>config/database.php</strong></p>

			<pre><?=htmlentities($config);?></pre>

			<?=HTML::anchor('Prime/Install/User', 'Ok, whats next?', ['class' => 'btn btn-lg btn-danger']);?>

		<?php else: ?>

			<div class="alert alert-warning">
				<p><strong>Error:</strong> <?=$error;?></p>
			</div>

			<div class="form-group">
				<?=Form::label('databaseHostname', 'Hostname');?>
				<?=Form::input('hostname', Arr::get($post, 'hostname', 'localhost'), ['class' => 'form-control']);?>
			</div>
			
			<div class="form-group">
				<?=Form::label('databaseUsername', 'Username');?>
				<?=Form::input('username', Arr::get($post, 'username'), ['class' => 'form-control', 'autocomplete' => 'off']);?>
			</div>

			<div class="form-group">
				<?=Form::label('databasePassword', 'Password');?>
				<?=Form::password('password', Arr::get($post, 'password'), ['class' => 'form-control', 'autocomplete' => 'off']);?>
			</div>

			<div class="form-group">
				<?php $checkbox = Form::checkbox('create', 1, Arr::get($post, 'create'), ['id' => 'databaseCreate']);?>
				<?=Form::hidden('create', 0);?>
				<?=Form::label('databaseCreate', 'Create if not exists'.$checkbox, ['class' => 'checkbox-inline pull-right']);?>
				<?=Form::label('databaseName', 'Database');?>
				<?=Form::input('database', Arr::get($post, 'database'), ['class' => 'form-control']);?>
			</div>

			<div class="form-group">
				<?=Form::button(NULL, 'Check and continue', ['type' => 'submit', 'class' => 'btn btn-lg btn-danger']);?>
			</div>

		<?php endif; ?>

	</div>
</form>