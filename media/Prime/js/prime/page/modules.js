define(['jqueryUI'], function(ui) {
	return function () {
		$(this)
		.find('.list-group > .list-group-item')
		.draggable({
			helper: 'clone',
			iframeFix: true,
			containment: $('body'),
			appendTo: '.fullscreen',
			revert: true,
			revertDuration: 135,
			start: function (e, ui) {
				$('.prime-live-iframe').each(function () {
					$(this).contents().find('body').addClass('prime-drag');
				});
			},
			stop: function (e, ui) {
				$('.prime-live-iframe').each(function () {
					$(this).contents().find('body').removeClass('prime-drag');
				});
			}
		});
	};
});