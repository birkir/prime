<?=Form::open('prime/user/profile', array('style' => 'margin: 0;', 'class' => 'form-fieldset', 'method' => 'POST', 'onsubmit' => 'return saveChanges(this);'));?>
	<div class="nav-header">General</div>
	<div class="control-group">
		<?=Form::label('profileName', __('Name'), array('class' => 'control-label'));?>
		<?=Form::input('name', $user->name, array('class' => 'input-block-level', 'id' => 'profileName'));?>
	</div>
	<div class="control-group">
		<?=Form::label('profileUsername', __('Username'), array('class' => 'control-label'));?>
		<?=Form::input(NULL, $user->username, array('class' => 'input-block-level', 'id' => 'profileUsername', 'disabled' => 'disabled'));?>
	</div>
	<div class="control-group">
		<?=Form::label('profileEmail', __('Email'), array('class' => 'control-label'));?>
		<?=Form::input('email', $user->email, array('class' => 'input-block-level', 'id' => 'profileEmail', 'type' => 'email', 'data-original' => $user->email, 'onkeyup' => 'emailchange(this);'));?>
		<span class="text-warning hide emailnotice">Notice: You will have to confirm changed email address at your email inbox.</span>
	</div>
	<div class="control-group">
		<?=Form::label('profilePassword', __('Password'), array('class' => 'control-label'));?>
		<?=Form::password('password', NULL, array('class' => 'input-block-level', 'id' => 'profilePassword', 'onkeyup' => 'confirmpwd(this.value);'));?>
	</div>
	<div class="control-group confirmpwd hide">
		<?=Form::label('profilePasswordConfirm', __('Confirm password'), array('class' => 'control-label'));?>
		<?=Form::password('password_confirm', NULL, array('class' => 'input-block-level', 'id' => 'profilePasswordConfirm'));?>
	</div>
	<div class="modal-footer">
		<?=Form::button(NULL, __('Cancel'), array('class' => 'btn btn-danger', 'data-dismiss' => 'modal', 'aria-hidden' => 'true'));?>
		<?=Form::submit(NULL, __('Save changes'), array('class' => 'btn btn-primary')); ?>
	</div>
<?=Form::close();?>
<script>
	app.selects();
	function confirmpwd(value) {
		if (value === '') {
			$('.confirmpwd').addClass('hide');
		} else {
			$('.confirmpwd').removeClass('hide').children('input').val('');
		}
	};
	function emailchange(email) {
		if ($(email).val() === $(email).data('original')) {
			$('.emailnotice').addClass('hide');
		} else {
			$('.emailnotice').removeClass('hide');
		}
	}
	function saveChanges(form) {
		$.ajax({
			url: $(form).attr('action'),
			data: $(form).serialize(),
			type: $(form).attr('method'),
			success: function (response) {
				console.log('THANKS!');
				$(form).find('[data-dismiss=modal]').trigger('click');
			}
		})
		return false;
	}
</script>