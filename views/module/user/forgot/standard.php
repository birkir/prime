<?php if ($status === 1): ?>

	<div class="alert alert-success">
		<h4><?=__('Thank you');?></h4>
		<p><?=__('Confirmation link has been sent to your email address.');?></p>
	</div>	

<?php elseif ($status === 2): ?>

	<?=Form::open(NULL, ['role' => 'form']);?>

		<div class="form-group">
			<?=Form::label('forgotPassword', __('Type your new password'), ['class' => 'control-label']);?>
			<?=Form::password('password', NULL, ['id' => 'forgotPassword', 'placeholder' => __('Enter password'), 'class' => 'form-control']);?>
		</div>

		<?=Form::button(NULL, __('Submit'), ['class' => 'btn btn-default', 'type' => 'submit']);?>

	<?=Form::close();?>

<?php elseif ($status === 3): ?>

	<h3><?=__('Your password has been changed.');?></h3>
	<p><?=__('You may now login with your new password <code>:password</code>.', array(':password' => $pwd));?></p>
	<?=HTML::anchor($login_page, __('Continue to login'), ['class' => 'btn btn-success']);?>

<?php else: ?>
	<?=Form::open(NULL, ['role' => 'form']);?>

		<?php if ($error): ?>

			<div class="alert alert-warning">
				<strong><?=__('Error');?>:</strong> <?=$error;?>
			</div>

		<?php endif; ?>

		<div class="form-group">
			<?=Form::label('forgotEmail', __('Email address'), ['class' => 'control-label']);?>
			<?=Form::input('email', Arr::get($post, 'email', NULL), ['id' => 'forgotEmail', 'placeholder' => __('Enter email address'), 'class' => 'form-control']);?>
		</div>

		<?php if ($captcha): ?>
			<div class="form-group">
				<?=Form::label('forgotCaptcha', __('Captcha'), ['class' => 'control-label']);?>
				<?=$captcha;?>
			</div>
		<?php endif; ?>

		<?=Form::button(NULL, __('Submit'), ['class' => 'btn btn-default', 'type' => 'submit']);?>

	<?=Form::close();?>
	

<?php endif; ?>