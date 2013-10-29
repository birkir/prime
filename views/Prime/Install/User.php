<form method="post" class="form-signin" style="max-width: 500px;">
	<div class="well">
		<h3>Create admin</h3>

		<div class="form-group">
			<?=Form::label('formEmail', __('Email address'), ['class' => 'control-label']);?>
			<?=Form::input('email', NULL, ['class' => 'form-control', 'id' => 'formEmail', 'autocomplete' => 'off']);?>
		</div>

		<div class="form-group">
			<?=Form::label('formPassword', __('Password'), ['class' => 'control-label']);?>
			<?=Form::password('password', NULL, ['class' => 'form-control', 'id' => 'formPassword', 'autocomplete' => 'off']);?>
		</div>

		<hr style="border-color: #ddd;">

		<div class="form-group">
			<?=Form::label('formName', __('Website name'), ['class' => 'control-label']);?>
			<?=Form::input('name', 'Default website', ['class' => 'form-control', 'id' => 'formName', 'autocomplete' => 'off']);?>
		</div>

		<div class="form-group">
			<?=Form::label('formHostname', __('Hostname'), ['class' => 'control-label']);?>
			<?=Form::input('hostname', Arr::get($_SERVER, 'HTTP_HOST'), ['class' => 'form-control', 'id' => 'formHostname', 'autocomplete' => 'off']);?>
		</div>

		<div class="form-group">
			<button type="submit" class="btn btn-lg btn-danger">Create admin</button>
		</div>
	</div>
</form>