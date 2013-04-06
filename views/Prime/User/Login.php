<div class="container">
	<div class="modal-frame">
		<a href="#" style="text-decoration: none;" class="clearfix">
			<img src="/media/prime/img/logo-medium.png" alt="" class="pull-left">
			<div class="version">v3.3.1</div>
		</a>
		<div class="modal-frame-box" style="margin-top: 8px;">
			<?=Form::open(NULL, array('method' => 'POST'));?>
				<fieldset>
					<div class="control-group">
						<?=Form::label('loginUsername', __('Username'));?>
						<?=Form::input('username', Arr::get($_POST, 'username'), array('id' => 'loginUsername', 'class' => 'input-block-level'));?>
					</div>
					<div class="control-group">
						<?=Form::label('loginPassword', __('Password'));?>
						<?=Form::password('password', NULL, array('id' => 'loginPassword', 'class' => 'input-block-level'));?>
					</div>
					<input type="submit" class="btn btn-primary pull-left" value="Sign in">
					<label class="checkbox pull-left input-medium" for="loginRemember" style="margin-left: 20px; margin-top: 5px;">
						<?=Form::checkbox('remember', 1, (bool) Arr::get($_POST, 'remember', FALSE), array('id' => 'loginRemember'));?>
						<span style="font-weight: normal; color: #777;"><?=__('Stay signed in');?></span>
					</label>
				</fieldset>
			<?=Form::close();?>
			<ul>
				<li><a href="/prime/user/lostpwd"><?=__('Can\'t access your account?');?></a></li>
			</ul>
		</div>
	</div>
</div>
<style type="text/css">
body { background-image: url(/media/prime/img/background.png); }
</style>