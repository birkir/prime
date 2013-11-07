<?php if ($editor_type === 'plaintext'): ?>

	<?php $editor_id = 'ace'.uniqid(); ?>

	<div id="<?=$editor_id;?>" style="width: 698px; min-height: 360px; margin: -20px;"><?=htmlentities($content);?></div>
	<script>
	var init_editor = function () {
		var editor = ace.edit('<?=$editor_id;?>');
		$.cookie.json = false;
		editor.setTheme('ace/theme/' + $.cookie('ace-theme') || 'github');
		$.cookie.json = false;
		editor.getSession().setMode('ace/mode/html');
	};
	if (typeof ace === 'undefined') {
		var ace_script = document.createElement('script');
		ace_script.src= '/media/Prime/js/lib/ace/ace.js';
		ace_script.onload = init_editor;
		document.getElementsByTagName('head')[0].appendChild(ace_script);
	}
	else
	{
		init_editor();
	}
	</script>
	

<?php else: ?>
	<textarea class="wysiwyg"><?=$content;?></textarea>
<?php endif; ?>