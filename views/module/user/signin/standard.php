<?=Form::open(NULL, ['role' => 'form']);?>

	<?php if ($user->loaded()): ?>

		<p><?=__('Welcome :user', array(':user' => $user->fullname));?></p>
		<?=Form::button('logout', __('Sign out'), ['class' => 'btn btn-default', 'type' => 'submit']);?>

	<?php else: ?>

		<div class="form-group">
			<?=Form::label('signinEmail', __('Email address'));?>
			<?=Form::input('email', Arr::get($data, 'email'), ['id' => 'signinEmail', 'class' => 'form-control', 'autofocus' => 'autofocus']);?>
		</div>

		<div class="form-group">
			<?=Form::label('signinPassword', __('Password'));?>
			<?=Form::password('password', NULL, ['id' => 'signinPassword', 'class' => 'form-control']);?>
		</div>

		<?php if (Arr::get($data, 'has-remember', FALSE)): ?>

			<div class="form-group">
				<?=Form::hidden('remember', 0);?>
				<label for="signinRemember" class="checkbox-inline">
					<?=Form::checkbox('remember', 1, Arr::get($data, 'remember'), ['id' => 'signinRemember']);?>
					<?=__('Remember me');?>
				</label>
			</div>

		<?php endif; ?>

		<div class="form-group">
			<?=Form::button(NULL, __('Sign in'), ['class' => 'btn btn-default', 'type' => 'submit']);?>
		</div>

	<?php endif; ?>

<?=Form::close();?>