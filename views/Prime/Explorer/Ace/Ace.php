<div id="editor" style="width: 100%; height: 100%;"><?=htmlentities($content);?></div>
<script>
var ace_editor = null,
    ace_ready = function () {
		if (ace_editor === null) {
			ace_editor = ace.edit('editor');
			$('.ace_scrollbar-h,.ace_scrollbar').addClass('scrollable');
			ace_editor.setTheme('ace/theme/chrome');
			ace_editor.getSession().setMode('ace/mode/php');

			// handle save
			ace_editor.commands.addCommand({
				name: 'SaveChanges',
				bindKey: {
					win: 'Ctrl-S',
					mac: 'Command-S'
				},
				exec: function(editor) {
					console.log('Lets, save!');
				},
				readOnly: true
			});
		}
	};

if (typeof ace === 'undefined') {

	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src= '/media/Prime/js/ace/ace.js';
	script.onreadystatechange= function () {
		if (this.readyState == 'complete') {
			ace_ready();
		}
	};
	script.onload= ace_ready;
	(document.getElementsByTagName('head')[0]).appendChild(script);

} else {
	ace_ready();
}
</script>