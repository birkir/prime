<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Prime 3.3 &raquo; Home</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<meta name="author" content="">

		<!-- Rollbar -->
		<script>
		var _rollbarParams = {"server.environment": "development"};
		_rollbarParams["notifier.snippet_version"] = "2"; var _rollbar=["d5cfdad9616c44d9b5eae9a98cca3fcc", _rollbarParams]; var _ratchet=_rollbar;
		(function(w,d){w.onerror=function(e,u,l,c,err){_rollbar.push({_t:'uncaught',e:e,u:u,l:l,c:c,err:err});};var i=function(){var s=d.createElement("script");var 
		f=d.getElementsByTagName("script")[0];s.src="//d37gvrvc0wt4s1.cloudfront.net/js/1/rollbar.min.js";s.async=!0;
		f.parentNode.insertBefore(s,f);};if(w.addEventListener){w.addEventListener("load",i,!1);}else{w.attachEvent("onload",i);}})(window,document);
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
			<div class="navbar-header">
				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
					<span class="sr-only"><?=__('Toggle navigation');?></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<?=HTML::anchor('Prime', HTML::image('media/Prime/img/logo.png', ['alt' => '']), ['class' => 'navbar-brand pull-left']);?>
			</div>
			<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
				<ul class="nav navbar-nav">
					<li class="dropdown">
						<?=HTML::anchor('Prime', '<i class="fa fa-edit"></i> '.__('Content').' <b class="caret"></b>', ['class' => 'dropdown-toggle', 'data-toggle' => 'dropdown']); ?>
						<ul class="dropdown-menu">
							<li><?=HTML::anchor('Prime/Page', '<i class="fa fa-file"></i> '.__('Pages')); ?></li>
							<li><?=HTML::anchor('Prime/File', '<i class="fa fa-picture-o"></i> '.__('Files')); ?></li>
						</ul>
					</li>
					<li class="dropdown">
						<?=HTML::anchor('#', '<i class="fa fa-folder"></i> '.__('Modules').' <b class="caret"></b>', ['class' => 'dropdown-toggle', 'data-toggle' => 'dropdown']); ?>
						<ul class="dropdown-menu">
							<li><?=HTML::anchor('Prime/Module/Fieldset', '<i class="fa fa-list-alt"></i> '.__('Fieldsets')); ?></li>
							<?php if (class_exists('Controller_Prime_Module_Store')): ?>
								<li><?=HTML::anchor('Prime/Module/Store', '<i class="fa fa-shopping-cart"></i> '.__('Store')); ?></li>
							<?php endif; ?>
						</ul>
					</li>
					<li><?=HTML::anchor('Prime/Explorer', '<i class="fa fa-th"></i> '.__('Explorer'));?></li>
					<li class="dropdown">
						<?=HTML::anchor('#', '<i class="fa fa-wrench"></i> '.__('System').' <b class="caret"></b>', ['class' => 'dropdown-toggle', 'data-toggle' => 'dropdown']);?>
						<ul class="dropdown-menu">
							<li><?=HTML::anchor('Prime/Log', '<i class="fa fa-tasks"></i> '.__('Event Log'));?></li>
							<li><?=HTML::anchor('Prime/Url', '<i class="fa fa-random"></i> '.__('URL Mapping'));?></li>
							<li><?=HTML::anchor('Prime/User', '<i class="fa fa-group"></i> '.__('Users'));?></li>
						</ul>
					</li>
				</ul>
				<ul class="nav navbar-nav navbar-right">
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
		<script>
		if (navigator.appName.indexOf('Internet Explorer') !== -1) {
			if (navigator.appVersion.indexOf('MSIE 8') !== -1 || navigator.appVersion.indexOf('MSIE 7') !== -1 || navigator.appVersion.indexOf('MSIE 6') !== -1) {
				document.getElementsByTagName('body')[0].innerHTML = '';
				alert('Please upgrade your browser or use Google Chrome.');
			}
		}
		</script>
		<script data-main="/media/Prime/js/prime.js" src="/media/Prime/js/lib/require.js"></script>
	</body>
</html>