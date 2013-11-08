<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Prime 3.3 &raquo; Home</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<meta name="author" content="">

		<!-- Errorception -->
		<script>
			(function(_,e,rr,s){_errs=[s];var c=_.onerror;_.onerror=function(){var a=arguments;_errs.push(a);
			c&&c.apply(this,a)};var b=function(){var c=e.createElement(rr),b=e.getElementsByTagName(rr)[0];
			c.src="//beacon.errorception.com/"+s+".js";c.async=!0;b.parentNode.insertBefore(c,b)};
			_.addEventListener?_.addEventListener("load",b,!1):_.attachEvent("onload",b)})
			(window,document,"script","526135e8db03cad121000085");
    	</script>

		<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
		<!--[if lt IE 9]>
			<script src="/media/Prime/js/lib/html5shiv.js"></script>
			<script src="/media/Prime/js/lib/respond.min.js"></script>
		<![endif]-->

		<link href="/media/Prime/css/bootstrap.css" rel="stylesheet">
		<link href="/media/Prime/css/bootstrap-tree.css" rel="stylesheet">
		<link href="/media/Prime/css/todc-bootstrap.css" rel="stylesheet">
		<link href="/media/Prime/css/font-awesome.css" rel="stylesheet">
		<link href="/media/Prime/css/select2.css" rel="stylesheet">
		<link href="/media/Prime/css/prime.css" rel="stylesheet">
	</head>
	<body>
		<div class="navbar navbar-default navbar-fullscreen">
			<?=HTML::anchor('Prime', HTML::image('media/Prime/img/logo.png', ['alt' => '']), ['class' => 'navbar-brand pull-left']);?>
			<ul class="nav navbar-nav">
				<li class="dropdown">
					<?=HTML::anchor('Prime', '<i class="fa fa-edit"></i> '.__('Content').' <b class="caret"></b>', ['class' => 'dropdown-toggle', 'data-toggle' => 'dropdown']); ?>
					<ul class="dropdown-menu">
						<li><?=HTML::anchor('Prime/Page', '<i class="fa fa-file"></i> '.__('Pages')); ?></li>
						<li><?=HTML::anchor('Prime/File', '<i class="fa fa-th"></i> '.__('Files')); ?></li>
					</ul>
				</li>
				<li class="dropdown">
					<?=HTML::anchor('#', '<i class="fa fa-folder"></i> '.__('Modules').' <b class="caret"></b>', ['class' => 'dropdown-toggle', 'data-toggle' => 'dropdown']); ?>
					<ul class="dropdown-menu">
						<li><?=HTML::anchor('Prime/Module/Fieldset', '<i class="fa fa-list-alt"></i> '.__('Fieldsets')); ?></li>
					</ul>
				</li>
				<li><?=HTML::anchor('Prime/Explorer', '<i class="fa fa-th"></i> '.__('Explorer'));?></li>
				<li class="dropdown">
					<?=HTML::anchor('#', '<i class="fa fa-wrench"></i> '.__('System').' <b class="caret"></b>', ['class' => 'dropdown-toggle', 'data-toggle' => 'dropdown']);?>
					<ul class="dropdown-menu">
						<li><?=HTML::anchor('Prime/Log', '<i class="fa fa-tasks"></i> '.__('Event Log'));?></li>
						<li><?=HTML::anchor('Prime/User', '<i class="fa fa-group"></i> '.__('Users'));?></li>
					</ul>
				</li>
			</ul>
			<ul class="nav navbar-nav pull-right">
				<li class="dropdown">
					<?php $avatar = HTML::image('http://www.gravatar.com/avatar/'.md5(strtolower(trim($user->email))).'?s=24', array('alt' => 'Profile photo')); ?>
					<?=HTML::anchor('#', $user->email.' '."\n".$avatar."\n".'<span class="caret"></span>', ['class' => 'dropdown-toggle nav-user', 'data-toggle' => 'dropdown']);?>
					<ul class="dropdown-menu">
						<li><?=HTML::anchor('Prime/Account/Profile', '<i class="fa fa-user"></i> '.__('Profile'), ['onclick' => 'return prime.profile(this);']);?></li>
						<li><?=HTML::anchor('Prime/Account/Logout', '<i class="fa fa-power-off"></i> '.__('Sign out'));?></li>
					</ul>
				</li>
			</ul>
		</div>
		<div class="fullscreen<?=(empty($left) ? NULL : ' with-panel-left');?><?=(empty($right) ? NULL : ' with-panel-right');?>" data-controller="<?=UTF8::strtolower($r->directory().'/'.$r->controller());?>">
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
		<?=(isset($bottom) ? $bottom : NULL);?>
		<script data-main="/media/Prime/js/prime.js" src="/media/Prime/js/lib/require.js"></script>
	</body>
</html>