<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="generator" content="Prime CMS 3.3">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="<?=$page->description;?>">
		<meta name="description" content="<?=$page->keywords;?>">
		<link rel="shortcut icon" href="../../assets/ico/favicon.png">

		<title><?=Arr::get($website, 'name');?> - <?=$page->name;?></title>

		<!-- Bootstrap core CSS -->
		<link href="/media/Prime/css/bootstrap.css" rel="stylesheet">

		<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
			<script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
		<![endif]-->
	</head>
	<body>

		<div class="navbar navbar-default navbar-static-top">
			<div class="container">
				<div class="navbar-header">
					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
						<span class="fa fa-bar"></span>
						<span class="fa fa-bar"></span>
						<span class="fa fa-bar"></span>
					</button>
					<?=HTML::anchor('/', Arr::get($website, 'name'), ['class' => 'navbar-brand']);?>
				</div>
				<div class="navbar-collapse collapse">
					<ul class="nav navbar-nav">
						<?=$prime::module('prime.navigation', ['from_level' => 1, 'to_level' => 1]);?>
					</ul>
				</div>
			</div>
		</div>

		<div class="container">
			<?=$region->content;?>
		</div>

		<script src="/media/Prime/js/lib/jquery-2.0.3.min.js"></script>
		<script src="/media/Prime/js/lib/bootstrap-3.1.0.js"></script>
	</body>
</html>
