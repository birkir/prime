<div class="fullscreen-ui" data-id="<?=sha1($id);?>">
	<div class="navbar navbar-toolbar navbar-default navbar-static-top">
		<div class="navbar-brand navbar-left"><?=$filename;?></div>
		<div class="navbar-form navbar-right">
			<div class="form-group">
				<?=Form::select('theme', $themes, $theme, ['style' => 'width: 160px;', 'class' => 'ace-theme']);?>
			</div>
		</div>
		<div class="navbar-right navbar-text" style="margin-right: 0; margin-left: 0;"><?=__('Theme');?></div>
		<div class="navbar-form navbar-right">
			<div class="form-group">
				<?=Form::select('mode', $modes, $mode, ['style' => 'width: 120px;', 'class' => 'ace-mode']);?>
			</div>
		</div>
		<div class="navbar-right navbar-text" style="margin-right: 0"><?=__('Mode');?></div>
		<div class="btn-toolbar navbar-right">
			<a href="#" class="navbar-btn btn btn-danger ace-save"><?=__('Save changes');?></a>
			<div class="btn-group" style="float: none;">
				<a href="#" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
					<?=__('Options');?> <b class="caret"></b>
				</a>
				<ul class="dropdown-menu ace-options" role="menu">
					<li><a href="#enableEmmet"><i class="icon-checkmark"></i><?=__('Enable Emmet');?></a></li>
					<li><a href="#softTabs"><i class="icon-checkmark"></i> <?=__('Use Soft Tab');?></a></li>
					<li><a href="#showInvisibles"><i class="icon-checkmark"></i> <?=__('Show Invisibles');?></a></li>
					<li><a href="#showIndentGuides"><i class="icon-checkmark"></i> <?=__('Show Indent Guides');?></a></li>
				</ul>
			</div>
		</div>
	</div>
	<div class="scrollable">
		<div style="width: 100%; height: 100%; white-space: pre;" class="ace-editor" data-id="<?=$id;?>"><?=htmlentities($content);?></div>
	</div>
</div>
<?php if ($primefile): ?>
	<div class="alert alert-danger top-center" style="top: 58px;margin-left: -250px;">
		<a class="close" data-dismiss="alert" href="#" aria-hidden="true">&times;</a>
		<strong><?=__('Warning');?>!</strong> <?=__('Saving this file will overwrite its origin to your application file system.');?>&nbsp;&nbsp;
	</div>
<?php endif; ?>