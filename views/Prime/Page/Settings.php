<div class="nav-header">Modules</div>

<div class="scrollable module-list">
	<ul class="nav nav-pills nav-stacked">
		<?php foreach (ORM::factory('Prime_Module')->find_all() as $module): ?>
			<li data-id="<?=$module->id;?>">
				<a href="">
					<?=$module->name;?>
					<div class="muted"><?=$module->description;?></div>
				</a>
			</li>
		<?php endforeach; ?>
	</ul>
</div>
<script>
var dropzones = [],
	activeDropzone = null;

$('.module-list ul li').draggable({
	helper: 'clone',
	iframeFix: true,
	containment: $('body'),
	appendTo: 'body',
	revert: true,
	revertDuration: 135,
	cursorAt: { top: 0, left: 0 },
	start: function() {
		$('#live').contents().find('body').addClass('droppable').find('.prime-region > .prime-dropzone').each(function(){
			dropzones.push({
				top: $(this).offset().top,
				left: $(this).offset().left,
				width: $(this).width(),
				height: $(this).height()
			});
		});
	},
	drag: function (event, ui)
	{
		activeDropzone = null;
		var mouse = {
			x: (ui.offset.left - $('#live').offset().left),
			y: (ui.offset.top - $('#live').offset().top)
		};
		var z = $('#live').contents().find('.prime-region > .prime-dropzone');
		for (var i = 0; i < dropzones.length; i++)
		{
			var zone = dropzones[i];
			if (mouse.x > zone.left && mouse.x < (zone.left + zone.width) && mouse.y > zone.top && mouse.y < (zone.top + zone.height))
			{
				activeDropzone = i;
			}
		}
		z.filter('.active').removeClass('active');
		if (activeDropzone !== null)
		{
			z.eq(activeDropzone).addClass('active');
		}
	},
	stop: function () {
		var li = $(this);
		dropzones = [];
		$('#live').contents().find('body').removeClass('droppable');

		if (activeDropzone !== null)
		{
			$('#live').contents().find('.prime-region > .prime-dropzone').removeClass('active').eq(activeDropzone).each(function(){
				var that = this;
				var obj = {
					page: app.page.id,
					pos: $(this).parent('.prime-region').children('.prime-dropzone').index(this),
					region: $(this).parent('.prime-region').data('prime-region'),
					module: li.data('id')
				};
				$.getJSON('/prime/region/add', obj, function (response) {
					var pm = $('<div/>', { 'class': 'prime-module', 'data-prime-module': response.id });
					$(that).after(pm);
					app.page.region.reload(response.id);
					// document.getElementById('live').contentWindow.location.reload();
				});
			});
		}
	}
});
</script>