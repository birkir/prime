<?=Form::open($action, ['role' => 'form']);?>
	<div class="tabbable tabs-left">
		<ul class="nav nav-tabs">
			<li class="active"><?=HTML::anchor('#tabGeneral', __('General'), ['data-toggle' => 'tab']);?></li>
			<li><?=HTML::anchor('#tabProperties', __('Properties'), ['data-toggle' => 'tab']);?></li>
		</ul>
		<div class="tab-content">
			<div class="tab-pane active" id="tabGeneral">
				<div class="form-group">
					<?=Form::label('formFullName', __('Full name'), ['class' => 'control-label']);?>
					<?=Form::input('fullname', $item->fullname, ['class' => 'form-control', 'id' => 'formFullName']);?>
				</div>

				<div class="form-group">
					<?=Form::label('formEmail', __('Email address'), ['class' => 'control-label']);?>
					<?=Form::input('email', $item->email, ['class' => 'form-control', 'id' => 'formEmail', 'type' => 'email', 'required' => 'required', 'data-remote' => '/Prime/User/Available', 'autocomplete' => 'off']);?>
				</div>

				<div class="form-group">
					<?=Form::label('formPassword', __('Password'), ['class' => 'control-label']);?>
					<?=Form::password('password', NULL, Arr::merge(['class' => 'form-control', 'id' => 'formPassword', 'autocomplete' => 'off', 'minlength' => 6,], ($item->loaded() ? ['data-empty' => 'true'] : ['required' => 'required'])));?>
					<div class="collapse" style="margin-top: 5px;">
						<?=Form::password('password_confirm', NULL, ['class' => 'form-control', 'id' => 'formPasswordConfirm', 'placeholder' => __('Re-type password'), 'data-matches' => '[name=password]']);?>
					</div>
				</div>

				<div class="form-group">
					<?=Form::label('formRoles', __('Roles'), ['class' => 'control-label', 'multiple' => 'multiple']);?>
					<?=Form::select('roles[]', $roles->as_array('id', 'name'), $user_roles->as_array('id'), ['class' => 'form-control']);?>
				</div>

			</div>
			<div class="tab-pane" id="tabProperties">
				<?php if (count($fields) === 0): ?>
					<p class="text-center text-muted"><?=__('No fields for user roles.');?></p>
				<?php else: ?>
					<?php foreach ($fields as $field): ?>
						<?=$field->field->as_input('form_user_', $properties);?>
					<?php endforeach; ?>
				<?php endif; ?>

			</div>
		</div>
	</div>
	<input type="submit" class="sr-only">
<?=Form::close();?>