<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Prime 3.3.1</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<meta name="author" content="">
		<link href="/media/prime/css/bootstrap.css" rel="stylesheet">
		<link href="/media/prime/css/bootstrap-todc.css" rel="stylesheet">
		<link href="/media/prime/css/bootstrap-select.css" rel="stylesheet">
		<link href="/media/prime/css/bootstrap-datepicker.css" rel="stylesheet">
		<link href="/media/prime/css/bootstrap-responsive.css" rel="stylesheet">
		<link href="/media/prime/css/jstree.css" rel="stylesheet">
		<link href="/media/prime/css/application.css" rel="stylesheet">
	</head>
	<body class="<?=(empty($left) ? NULL : ' with-leftpanel');?><?=(empty($right) ? NULL : ' with-rightpanel');?><?=(isset($modal) ? ' with-modal' : NULL);?>">
<?php if ( ! isset($hidenavbar)): ?>
		<div class="navbar navbar-fixed-top navbar-inverse navbar-googlenav">
			<div class="navbar-inner">
				<div class="container-fluid">
					<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
					<?=HTML::anchor('/prime', '<img alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAUCAYAAADMfWCyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTBGRDY5RUI5NzQ2MTFFMjhGRkVGMjc5OTE0N0Y2MUEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTBGRDY5RUM5NzQ2MTFFMjhGRkVGMjc5OTE0N0Y2MUEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMEZENjlFOTk3NDYxMUUyOEZGRUYyNzk5MTQ3RjYxQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMEZENjlFQTk3NDYxMUUyOEZGRUYyNzk5MTQ3RjYxQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlJpF+YAAATQSURBVHjavFhrSCNXFB51lQZfBEHIolgDKhoflSjopj8spkWqFLSkP6RqodBWCyoiDZQuu4vCKlTpWhB3+8cqkaUt0lpBwSgKFqWs+I5S2UAEJ4gvKMJERe05cm+4O2ZeMemBw8x9nHvP/e55zXDX19dT1/J0TObYgfUcIXinrCT/CrgL2MjIsGwVzZ9SGGfX5RRYL6OXljPckkWK5JQJAbMCd11eXnoODg4ecNrIDGwHfi0Iwg9Kk3meN0ZERNSrWbelpeVbhTk2qQHY4zEXJFHZW+AdHR154QBuZHxnx6KiouITExOdExMTpVILs/LiMZ1O17K9vf0TFyKqrq5+Dw6il5li5cJI98QdDofDCTc6D68+bHd3d2e1tra2xcTEvIXt6OhoXXJy8lNQuhrM90ROvrKyMhbkPzeZTGY6npKS8jHI/gyy83dVPi8vzwQP5HmtlidHs7OzzrW1Na9m8Ag5gW8sx263c7W1tR449HM6mJaWlknc0SklD+DcyC8uLv4O7v4PWG0ctuPi4vRNTU0fyBxYNSUlJRkqKiqKJNayBbsuAgcG8AKjiNw8NTGPS01NfSFWGh5GNbIlJSVesLS/2b6srKy3FdyNkwsLbLuxsbEc1tLJuaxYRiXxaABSrBo8CbqvdmJkZGSiRCLSTGdnZwIkrS3azs3NxUvMkbO89fX1zXDEPFXgAdJmtn16enqiYQ8jcXE/jY6O8ndRend3d92/uNGYE8ALrOzlzMzMuLWsn5+fb1hZWbGQdcRsVg0eqe2es30ejweVUQMgbvaLqBRxz83NYTLyBgveyMjIG2FgeHjYJuWyeNEdHR2a9iorK7MWFBQMweuUmH0+3zMIE/cDgldeXp6zv7//JSmKu6DrldhypqenXTShiKm5ubkO5F4j7mRDv+z5+blvYGDgJhnBHCFY8Hp7ew8gCa3QdmFhIdaGpkAuu7W15VJ50aro+PjYQC/nVrYlZYVZSnhsbGwcMhECpymOoMUhcGAFbpksrZoge7+Exzv4npGRYSKuu0l097vxwsKCZl2DrvOkyO12u8bHx5cIcH/SjBMoG2JQT0hI0GNZQvv39va8ANxfpIzhQ6C7/wKwBu3v7/8I9WJdFi2d6Ksp5vX19Q0TOW3giQvEw8NDgYkZeINLcsrQIrmtrS2+p6fne9pfXFxsGRwcdDQ0NPAhuvilq6srD2TyNGwUFRVlg+vi97PfZXd2dlBfQeqiFWhITg72ug2eRIHoUyoYxVYBwLkhWMeD9T2inVVVVQ9h0z9CZHlYAr0k381cdnZ2Tmdnp4UNOcvLy3h4V7g+z6SyLU+si3JQhwXgnoHr8GxxDV8cP4ZQ/yVmL73NZvuKHayrq3NpddmQ13l3oJOLi4tv2A7IjB+CVX4SovV/Bdf9lzYyMzMfsDGalFqak4VCneevIe+FGTwuNjbWIQjC1zqdrpQG95qamu/AfacC/VgI0nW/EPdvbGwEnWWxzpP7I7O6uoq/zH4Lt+XRX1Gfsu309PS8ycnJhyFa3ilRC26Gy2WhyH8fHob/BTw8BCSPJ2yHxWL5rL29vTQc4DFfMa5wHiqCPOtF34dDGm9Nrfy7IndAt8XMbiBr+MEma7Dfx3LjOpp1ZeYgPZZp16v9U0TP+J8AAwBW4ClNTAYZCgAAAABJRU5ErkJggg==" /> <div class="version">v3.3.1</div>', array('class' => 'brand'));?>

					<div class="nav-collapse collapse">
						<ul class="nav">
							<li class="dropdown">
								<?=HTML::anchor('#', '<i class="icon-edit icon-white"></i> '.__('Content'), array('class' => 'dropdown-toggle', 'data-toggle' => 'dropdown'));?>

								<ul class="dropdown-menu">
									<li><?=HTML::anchor('prime/page', '<i class="icon-file"></i> '.__('Pages'));?></li>
									<li><?=HTML::anchor('prime/file', '<i class="icon-hdd"></i> '.__('Files'));?></li>
								</ul>
							</li>
							<li class="dropdown">
								<?=HTML::anchor('#', '<i class="icon-folder-close icon-white"></i> '.__('Modules'), array('class' => 'dropdown-toggle', 'data-toggle' => 'dropdown'));?>

								<ul class="dropdown-menu">
									<li><?=HTML::anchor('prime/modules/fieldset', '<i class="icon-list-alt"></i> '.__('Fieldsets'));?></li>
									<li><?=HTML::anchor('prime/modules/booking', '<i class="icon-calendar"></i> '.__('Booking'));?></li>
									<li><?=HTML::anchor('prime/modules/mailinglist', '<i class="icon-envelope"></i> '.__('Mailinglists'));?></li>
								</ul>
							</li>
							<li class="dropdown">
								<?=HTML::anchor('#', '<i class="icon-picture icon-white"></i> '.__('Layout'), array('class' => 'dropdown-toggle', 'data-toggle' => 'dropdown'));?>

								<ul class="dropdown-menu">
									<li><?=HTML::anchor('prime/template', __('Templates'));?></li>
									<li><?=HTML::anchor('prime/media', __('Media'));?></li>
								</ul>
							</li>
							<li class="dropdown">
								<?=HTML::anchor('#', '<i class="icon-wrench icon-white"></i> '.__('System'), array('class' => 'dropdown-toggle', 'data-toggle' => 'dropdown'));?>

								<ul class="dropdown-menu">
									<li><?=HTML::anchor('prime/log', '<i class="icon-tasks"></i> '.__('Event Log'));?></li>
									<li><?=HTML::anchor('prime/module', '<i class="icon-folder-close"></i> '._('Modules'));?></li>
									<li><?=HTML::anchor('prime/user', '<i class="icon-user"></i> '.__('Users'));?></li>
									<li><?=HTML::anchor('prime/website', '<i class="icon-globe"></i>'.__('Website'));?></li>
								</ul>
							</li>
						</ul>
						<ul class="nav pull-right">
							<li class="dropdown"><?php $avatar = HTML::image('http://www.gravatar.com/avatar/'.md5(strtolower(trim($user->email))).'?s=24', array('alt' => 'Profile photo')); ?>

								<?=HTML::anchor('#',$user->name."\n".$avatar."\n".'<span class="caret"></span>', array('class' => 'dropdown-toggle nav-user', 'data-toggle' => 'dropdown'));?>

								<ul class="dropdown-menu">
									<li><?=HTML::anchor('prime/user/profile', '<i class="icon-user"></i> '.__('Profile'), array('onclick' => 'return app.modal(this.href, true);'));?></li>
									<li><?=HTML::anchor('prime/user/logout', '<i class="icon-off"></i> '.__('Sign out'));?></li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
<?php endif; ?>

<?php if (isset($modal)): ?>
			<?=$modal;?>

<?php else: ?>

		<div class="container-fluid">
			<div class="leftpanel well well-small scrollable">
<?=isset($left) ? $left : NULL;?>

			</div>
			<div class="centerpanel">
<?=isset($view) ? $view : NULL;?>

			</div>
			<div class="rightpanel well well-small scrollable">
<?=isset($right) ? $right : NULL;?>

			</div>
		</div>
<?php endif; ?>

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.1/jquery-ui.min.js"></script>
		<script src="/media/prime/js/wysihtml5.js"></script>
		<script src="/media/prime/js/bootstrap.js"></script>
		<script src="/media/prime/js/bootstrap-select.js"></script>
		<script src="/media/prime/js/bootstrap-datepicker.js"></script>
		<script src="/media/prime/js/bootstrap-wysihtml5.js"></script>
		<script src="/media/prime/js/jstree.js"></script>
		<script src="/media/prime/js/jquery.rest.js"></script>
		<script src="/media/prime/js/ace/ace.js"></script>
		<script src="/media/prime/js/emmet.js"></script>
		<script src="/media/prime/js/plupload.js"></script>
		<script src="/media/prime/js/prettify.js"></script>
		<script src="/media/prime/js/application.js"></script>
	</body>
</html>