<?=Form::open(NULL, ['role' => 'form']);?>

	<?php if ($status === 1 AND empty($return_url)): ?>

		<?=__('You have successfully registered.');?>

	<?php else: ?>

		<?php if ( ! empty($errors)): ?>
			<div class="alert alert-warning">
				<strong><?=__('Please fix these errors');?>:</strong>
				<ul>
					<?php foreach ($errors as $error): ?>
						<li><?=ucfirst($error);?></li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endif; ?>

		<?php foreach ($roles as $role): ?>
			<?=Form::hidden('roles[]', $role);?>
		<?php endforeach; ?>

		<div class="form-group">
			<?=Form::label('signupEmail', __('Email address'));?>
			<?=Form::input('email', Arr::get($post, 'email'), ['id' => 'signupEmail', 'class' => 'form-control', 'autofocus' => 'autofocus']);?>
		</div>

		<div class="form-group">
			<?=Form::label('signupPassword', __('Password'));?>
			<?=Form::password('password', NULL, ['id' => 'signupPassword', 'class' => 'form-control']);?>
		</div>

		<div class="form-group">
			<?=Form::label('signupPasswordConfirm', __('Re-type password'));?>
			<?=Form::password('password_confirm', NULL, ['id' => 'signupPasswordConfirm', 'class' => 'form-control']);?>
		</div>

		<?php if ($captcha): ?>
			<div class="form-group">
				<?=Form::label('signupCaptcha', __('Type answer'));?>
				<?=$captcha;?>
			</div>
		<?php endif; ?>

		<div class="form-group">
			<?=Form::button(NULL, __('Sign up'), ['class' => 'btn btn-default', 'type' => 'submit']);?>
		</div>

	<?php endif; ?>

<?=Form::close();?>