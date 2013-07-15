<!DOCTYPE html>
<html lang="en" ng-app="Prime">
	<head>
		<meta charset="utf-8">
		<title ng-bind="'Prime - ' + $state.current.name">Prime 3.3/master</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<meta name="author" content="">
		<link href="/media/Prime/css/bootstrap.css" rel="stylesheet">
		<link href="/media/Prime/css/todc-bootstrap.css" rel="stylesheet">
		<link href="/media/Prime/css/font-awesome.css" rel="stylesheet">
		<link href="/media/Prime/css/select2.css" rel="stylesheet">
		<link href="/media/Prime/css/bootstrap-tree.css" rel="stylesheet">
		<link href="/media/Prime/css/prime.css" rel="stylesheet">
	</head>
	<body>
		<div class="navbar navbar-fullscreen">
			<?=HTML::anchor('Prime', HTML::image('media/Prime/img/logo.png', ['alt' => '']), ['class' => 'navbar-brand pull-left']);?>
			<ul class="nav navbar-nav">
				<li><?=HTML::anchor('Prime/Page', '<i class="icon-edit"></i> '.__('Content')); ?></li>
				<li class="dropdown">
					<?=HTML::anchor('#', '<i class="icon-folder-close"></i> '.__('Modules').' <b class="caret"></b>', ['class' => 'dropdown-toggle', 'data-toggle' => 'dropdown']); ?>
					<ul class="dropdown-menu">
						<li><?=HTML::anchor('Prime/Module/Fieldset', '<i class="icon-list-alt"></i> '.__('Fieldsets')); ?></li>
					</ul>
				</li>
				<li><?=HTML::anchor('Prime/Explorer', '<i class="icon-columns"></i> '.__('Explorer'));?></li>
				<li class="dropdown">
					<?=HTML::anchor('#', '<i class="icon-wrench"></i> '.__('System').' <b class="caret"></b>', ['class' => 'dropdown-toggle', 'data-toggle' => 'dropdown']);?>
					<ul class="dropdown-menu">
						<li><?=HTML::anchor('Prime/Log', '<i class="icon-tasks"></i> '.__('Event Log'));?></li>
						<li><?=HTML::anchor('Prime/User', '<i class="icon-group"></i> '.__('Users'));?></li>
					</ul>
				</li>
			</ul>
			<ul class="nav navbar-nav pull-right">
				<li class="dropdown">
					<?php $avatar = HTML::image('http://www.gravatar.com/avatar/'.md5(strtolower(trim('birkir.gudjonsson@gmail.com'))).'?s=24', array('alt' => 'Profile photo')); ?>
					<?=HTML::anchor('#', 'Username '."\n".$avatar."\n".'<span class="caret"></span>', ['class' => 'dropdown-toggle nav-user', 'data-toggle' => 'dropdown']);?>
					<ul class="dropdown-menu">
						<li><?=HTML::anchor('Prime/User/Profile', '<i class="icon-user"></i> '.__('Profile'));?></li>
						<li><?=HTML::anchor('Prime/User/Logout', '<i class="icon-off"></i> '.__('Sign out'));?></li>
					</ul>
				</li>
			</ul>
		</div>
		<div class="fullscreen<?=(empty($left) ? NULL : ' with-panel-left');?><?=(empty($right) ? NULL : ' with-panel-right');?>">
			<div class="panel-left well well-small scrollable">
<?=isset($left) ? $left : NULL;?>

			</div>
			<div class="panel-center">
<?=isset($view) ? $view : NULL;?>

			</div>
			<div class="panel-right well well-small scrollable">
<?=isset($right) ? $right : NULL;?>

			</div>
		</div>
		<div class="alert-container"></div>
		<script src="/media/Prime/js/respond.min.js"></script>
		<script src="/media/Prime/js/jquery-2.0.2.min.js"></script>
		<script src="/media/Prime/js/jquery-ui-1.10.3.min.js"></script>
		<script src="/media/Prime/js/jquery.tablednd.js"></script>
		<script src="/media/Prime/js/tablesorter.min.js"></script>
		<script src="/media/Prime/js/bootstrap.min.js"></script>
		<script src="/media/Prime/js/bootstrap-context.js"></script>
		<script src="/media/Prime/js/select2.min.js"></script>
		<script src="/media/Prime/js/nod.min.js"></script>
		<script src="/media/Prime/js/ckeditor/ckeditor.js"></script>
		<script src="/media/Prime/js/Prime.js"></script>
	</body>
</html>