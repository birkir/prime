<form class="form-signin" style="max-width: <?php if ( ! empty($config)): ?>800<?php else: ?>550<?php endif; ?>px;" method="post">
	<div class="well">

		<h1>Create admin</h1>

		<?php if ( ! empty($config)): ?>

			<p>Paste this code to <strong><?=APPPATH;?>config/prime.php</strong></p>

			<pre><?=htmlentities($config);?></pre>

			<?=HTML::anchor('Prime', 'All done, lets sign in', ['class' => 'btn btn-lg btn-danger']);?>

		<?php else: ?>

			<div class="form-group">
				<?=Form::label('formEmail', __('Email address'), ['class' => 'control-label']);?>
				<?=Form::input('email', NULL, ['class' => 'form-control', 'id' => 'formEmail', 'autocomplete' => 'off']);?>
			</div>

			<div class="form-group">
				<?=Form::label('formPassword', __('Password'), ['class' => 'control-label']);?>
				<?=Form::password('password', NULL, ['class' => 'form-control', 'id' => 'formPassword', 'autocomplete' => 'off']);?>
			</div>

			<div class="form-group">
				<button type="submit" class="btn btn-lg btn-danger">Create admin</button>
			</div>

		<?php endif; ?>

	</div>
</form>