<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Prime 3.3/master</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link href="/media/Prime/css/bootstrap.css" rel="stylesheet">
    <link href="/media/Prime/css/todc-bootstrap.css" rel="stylesheet">
    <link href="/media/Prime/css/font-awesome.css" rel="stylesheet">
    <link href="/media/Prime/css/select2.css" rel="stylesheet">
    <link href="/media/Prime/css/bootstrap-tree.css" rel="stylesheet">
    <link href="/media/Prime/css/prime.css" rel="stylesheet">
    <style type="text/css">
    body { padding-top: 40px; padding-bottom: 40px; background-color: #eee; }
    .form-signin { max-width: 330px; padding: 15px; margin: 0 auto; }
    .form-signin .form-signin-heading,
    .form-signin .checkbox { margin-bottom: 10px; }
    .form-signin .checkbox { font-weight: normal; }
    .form-signin input[type="text"],
    .form-signin input[type="password"] { position: relative; font-size: 16px; height: auto; padding: 10px; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
    .form-signin input[type="text"]:focus,
    .form-signin input[type="password"]:focus { z-index: 2; }
    .form-signin input[type="text"] { margin-bottom: -1px; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
    .form-signin input[type="password"] { margin-bottom: 10px; border-top-left-radius: 0; border-top-right-radius: 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <form class="form-signin" method="post">
        <h2 class="form-signin-heading">Prime 3.3/master</h2>
        <?php if ($message): ?>
          <p class="alert"><?=$message;?></p>
        <?php endif; ?>
        <input type="text" name="email" value="<?=Arr::get($_POST, 'email');?>" class="form-control" placeholder="Email address" autofocus>
        <input type="password" name="password" class="form-control" placeholder="Password"<?php if (isset($_POST['email'])):?> autofocus<?php endif; ?>>
        <label class="checkbox">
          <input type="checkbox" name="remember" value="true" value="remember-me"<?=isset($_POST['remember']) ? ' checked' : ''?>> Remember me
        </label>
        <button class="btn btn-large btn-primary btn-block" type="submit">Sign in</button>
      </form>
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