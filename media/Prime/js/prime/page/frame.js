define(['jquery', 'jqueryUI'], function($) {

	return function () {

		var frame = $(this);

		// add mode=design to tree
		$(document).on('click', 'a[data-href]', function () {
			prime.loading(true);
			frame.attr('src', $(this).attr('href') + '?mode=design');
			return false;
		});

		// attach event handlers to iframe
		frame
		.on('load', function () {

			// stop loading
			prime.loading(false);

			// get document
			var doc = $(this).contents(),
			    ckeditor = document.createElement('script'),
			    unsaved = false;

			// make sure this event has not already loaded
			if (doc.find('#primeFrontend').length === 1)
				return;

			// add prime styles
			$('<link/>', { href: '/media/Prime/css/prime-frontend.css', rel: 'stylesheet', id: 'primeFrontend' })
			.appendTo(doc.find('head').eq(0));

			// add ckeditor 
			ckeditor.src = '/media/Prime/js/ckeditor/ckeditor.js';

			/*
			ckeditor.onload = setTimeout(function () {
				doc.find('[contenteditable]').each(function () {
					var editor = frame[0].contentWindow.CKEDITOR.dom.element.get(this).getEditor(),
					    region = this;
					    /*
					editor.on('change', function () {
						unsaved = editor;
						
						var wrap = $('<div/>').css({
							position: 'absolute',
							bottom: '-22px',
							left: '-1px'
						});
						
						 $('<a/>', { text: 'Save', href: '#' }).css({
							padding: '3px 10px',
							background: '#faa328',
							color: '#fff',
							fontSize: '12px',
							fontWeight: 'bold',
							'text-shadow': '1px 1px rgba(0,0,0,0.2)',
							'text-decoration': 'none'
						})
						.on('click', function () {
							$.ajax({
								url: '/Prime/Module/Html/EditContent/' + $(region).parents('.prime-region-item').data('id'),
								type: 'POST',
								data: { content: editor.getData() }
							})
							.done(function () {
								var editor = unsaved;
								unsaved = false;
								editor.blur();
								doc.trigger('click');
							});
							wrap.remove();
						})
						.appendTo(wrap);

						$('<a/>', { text: 'Cancel', href: '#' }).css({
							padding: '3px 10px',
							background: '#eee',
							color: '#999',
							fontSize: '12px',
							'text-decoration': 'none'
						})
						.on('click', function () {
							var editor = unsaved;
							unsaved = false;
							editor.blur();
							doc.trigger('click');
							wrap.remove();
						})
						.appendTo(wrap);

						$(region).after(wrap);
					});

					editor.on('focus', function () {
						if (unsaved !== false && unsaved !== editor) {
							unsaved.blur();
						}
					});
					editor.on('blur', function () {
						if (unsaved !== false && unsaved === editor) {
							unsaved.focus();
						}
					})
				});
			}, 330);*/
			this.contentWindow.document.body.appendChild(ckeditor);

			// attach event handlers to child frame
			doc
			.on('click', 'body', function (e) {
				if (unsaved === false) {
					var me = $(e.target).hasClass('prime-region-item') ? $(e.target) : $(e.target).parents('.prime-region-item').eq(0);
					$(this).find('.prime-region-item-active').not(me).removeClass('prime-region-item-active');
				}
				$('body').trigger('click');
			})
			.on('click', '.prime-region-item', function (e) {
				if (unsaved === false)
					$(this).addClass('prime-region-item-active');
			});

			// attach draggable method
			doc.find('.prime-region-item').draggable({
				cursorAt: { top: 0, left: 0 },
				revert: true,
				revertDuration: 135,
				iframeFix: true,
				handle: '.prime-move-handle'
			});

			// attach droppable method
			doc.find('.prime-drop').droppable({
				greedy: true,
				hoverClass: 'ui-state-active',
				drop: function (e, ui) {
					prime.region.attach($(ui.draggable).data('id'), $(this));
					return true;
				}
			});
		})
		.trigger('load');
	};
});