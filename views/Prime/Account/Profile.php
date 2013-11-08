<?=Form::open('Prime/Account/Profile', ['role' => 'form']);?>
	<div class="tabbable tabs-left">
		<ul class="nav nav-tabs">
			<li class="active"><?=HTML::anchor('#tabGeneral', __('General'), ['data-toggle' => 'tab']);?></li>
		</ul>
		<div class="tab-content">
			<div class="tab-pane active" id="tabGeneral">

				<div class="form-group">
					<?=Form::label('formFullName', __('Full name'), ['class' => 'control-label']);?>
					<?=Form::input('fullname', $item->fullname, ['class' => 'form-control', 'id' => 'formFullName']);?>
				</div>

				<div class="form-group">
					<?=Form::label('formEmail', __('Email address'), ['class' => 'control-label']);?>
					<?=Form::input(NULL, $item->email, ['class' => 'form-control', 'id' => 'formEmail', 'type' => 'email', 'readonly' => 'readonly', 'autocomplete' => 'off']);?>
				</div>

				<div class="form-group">
					<?=Form::label('formPassword', __('Password'), ['class' => 'control-label']);?>
					<?=Form::password('password', NULL, Arr::merge(['class' => 'form-control', 'id' => 'formPassword', 'autocomplete' => 'off', 'minlength' => 6,], ($item->loaded() ? ['data-empty' => 'true'] : ['required' => 'required'])));?>
					<div class="collapse" style="margin-top: 5px;">
						<?=Form::password('password_confirm', NULL, ['class' => 'form-control', 'id' => 'formPasswordConfirm', 'placeholder' => __('Re-type password'), 'data-matches' => '[name=password]']);?>
					</div>
				</div>

				<div class="form-group">
					<?=Form::label('formLanguage', __('Language'), ['class' => 'control-label']);?>
					<?=Form::select('language', $languages, $item->language, ['class' => 'form-control', 'id' => 'formLanguage']);?>
				</div>
			</div>
		</div>
	</div>
	<input type="submit" class="sr-only">
<?=Form::close();?>