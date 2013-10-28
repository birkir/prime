define(['jquery', 'jqueryUI'], function($) {

	var page = {},
		frame = $('.prime-live-iframe'),
		doc = frame.contents();

	// find current page id
	page.id = doc.find('[data-pageid]:eq(0)').data('pageid');

	// sortable tree function
	page.tree = function () {
		$('.nav-tree .list-group').sortable({
			appendTo: 'body',
			revert: 50,
			cursorAt: { top: 1, left: 1 },
			helper: function (event, original) {
				return $('<div/>', { 'class': 'tree-item-drag' }).text($(original).children('a').children('span').text()).css({
					fontWeight: 'bold',
					padding: '4px 10px',
					backgroundColor: '#ffffff',
					border: '1px solid #d5d5d5',
					boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
					height: 28,
					width: 'auto'
				});
			},
			update: function (event, ui) {
				var ref = ui.item.index() === 0 ? 0 : ui.item.prev().children('a').data('id'),
				    id = ui.item.children('a').data('id');
				$.ajax({
					url: '/Prime/Page/Reorder/' + [id, ref].join(':')
				});
				console.log(ui.item.index());
				console.log('reorder');
			}
		});
	};

	// set page tree actions and functions
	page.tree();

	// create page dialog
	page.create = function (element) {

		// create buttons
		var save = $('<button/>', { class: 'btn btn-primary', text: 'Save' }),
			cancel = $('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' }),
			form;

		// create dialog
		var dialog = prime.dialog({
			title: $(element).data('title'),
			remote: element.href,
			buttons: [save, cancel]
		},
		function (modal) {
			form = modal.find('form');
			form.on('submit', function () {
				$('#formSlug').attr('disabled', false);
				$.ajax({
					url: $(this).attr('action'),
					type: 'POST',
					data: $(this).serialize()
				})
				.done(function (response) {
					$('.panel-left').html(response);
					dialog.modal('hide');
					page.tree();
				});
				return false;
			});
			save.on('click', function () {
				form.trigger('submit');
			});
		});

		return false;
	};

	// create remove confirmation dialog
	page.remove = function (element) {

		// get node
		var node = $('.has-context');

		// create confirm dialog
		var dialog = prime.dialog({
			backdrop: true,
			title: $(element).text() + ' "' + node.children('span').text().trim() + '"',
			body: $(element).data('message'),
			confirm: function () {
				$.ajax({
					url: element.href
				})
				.done(function () {
					var ul = node.parent().parent();
					node.parent().remove();
					if (ul.children().length === 0) {
						ul.parent().removeClass('has-children');
						ul.remove();
					}
				});
			}
		});

		return false;
	};

	// setup page properties modal
	page.properties = function (element) {

		// create buttons
		var save = $('<button/>', { class: 'btn btn-primary', text: 'Save' }),
			cancel = $('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' }),
			form;

		// create dialog
		var dialog = prime.dialog({
			title: $(element).text(),
			remote: element.href,
			buttons: [save, cancel]
		},
		function (modal) {
			form = modal.find('form');
			form.on('submit', function () {
				$('#formSlug').attr('disabled', false);
				$.ajax({
					url: $(this).attr('action'),
					type: 'POST',
					data: $(this).serialize()
				})
				.done(function (response) {
					$('.panel-left').html(response);
					dialog.modal('hide');
					page.tree();
				});
				return false;
			});
			save.on('click', function () {
				form.trigger('submit');
			});
		});

		return false;
	};

	// region object
	page.region = {
		add: function(id, droppable) {
			$.ajax({
				url: '/Prime/Region/Add',
				type: 'POST',
				data: {
					name: droppable.parents('.prime-region:eq(0)').data('name'),
					prime_module_id: id,
					prime_page_id: page.id,
					position: 0,
					_ref: droppable.parent('.prime-region-item').data('id'),
					_pos: droppable.data('position')
				}
			})
			.done(function (response) {
				var resp = $(response)
				droppable.before(resp);
				resp.trigger('click');
				resp.find('[contenteditable]').each(function () {
					$('.prime-live-iframe')[0].contentWindow.CKEDITOR.inline(this);
					$(this).trigger('focus');
				});
			});
		},
		remove: function (id) {
			prime.dialog({
				title: 'Remove region',
				body:  'Are you sure you want to delete this item?',
				confirm: function () {
					$.ajax({
						url: '/Prime/Region/Remove/' + id
					})
					.done(function (response) {
						$('.prime-live-iframe').contents().find('.prime-region-item[data-id=' + id + ']').remove();
					});
				}
			});
		},
		settings: function (id) {
			var save = $('<button/>').addClass('btn btn-primary').text('Save'),
				cancel = $('<button/>').addClass('btn btn-default').text('Cancel').attr('data-dismiss', 'modal');

			var dialog = prime.dialog({
				title: 'Settings',
				remote: '/Prime/Region/Settings/' + id,
				buttons: [save, cancel]
			},
			function (modal) {
				form = modal.find('form');
				form.on('submit', function () {
					$.ajax({
						url: $(this).attr('action'),
						type: 'POST',
						data: $(this).serialize()
					})
					.done(function (response) {
						$('.prime-live-iframe').contents().find('.prime-region-item[data-id=' + id + ']').html(response);
						dialog.modal('hide');
					});
					return false;
				});
				save.on('click', function () {
					form.trigger('submit');
				});
			});
		}
	};

	// add mode=design to tree
	// -----------------------
	$('.panel-left').on('click', 'a[data-href]', function () {
		prime.loading(true);
		frame.attr('src', $(this).attr('href') + '?mode=design');
		return false;
	});

	// attach event handlers to iframe
	// -------------------------------
	frame
	.on('load', function () {

		// remove active class from active node
		$('.panel-left .nav-tree li').removeClass('active');

		// stop loading
		prime.loading(false);

		// get document
		var doc = $(this).contents(),
		    ckeditor = document.createElement('script'),
		    unsaved = false;

		prime.page.id = doc.find('[data-pageid]:eq(0)').data('pageid');

		// add active class to current page
		$('.panel-left .nav-tree [data-id=' + prime.page.id + ']').parent().addClass('active');

		// make sure this event has not already loaded
		if (doc.find('#primeFrontend').length === 1)
			return;

		// add prime styles
		$('<link/>', { href: '/media/Prime/css/prime-frontend.css', rel: 'stylesheet', id: 'primeFrontend' })
		.appendTo(doc.find('head').eq(0));

		// add ckeditor 
		ckeditor.src = '/media/Prime/js/ckeditor/ckeditor.js';

		frame[0].contentWindow.CKEDITOR_BASEPATH = '/media/Prime/js/ckeditor/';

		ckeditor.onload = function () {
			var editorsDone;
			frame[0].contentWindow.CKEDITOR.on('instanceReady', function () {
				clearTimeout(editorsDone);
				editorsDone = setTimeout(function () {
					doc.find('[contenteditable]').each(function () {
						if (frame[0].contentWindow.CKEDITOR === undefined) return;
						var editor = frame[0].contentWindow.CKEDITOR.dom.element.get(this).getEditor(),
						    region = this;
						editor.changed = false;
						editor.on('change', function () {
							this.changed = true;
						});
						editor.on('blur', function (e) {
							if (editor.changed === false) 
								return;

							$.ajax({
								url: '/Prime/Module/Html/Save/' + $(region).parent().data('id'),
								type: 'POST',
								data: { content: editor.getData() }
							})
							.done(function () {
								editor.changed = false;
							});
						});
					});
				}, 330);
			});
		};

		// append script
		this.contentWindow.document.body.appendChild(ckeditor);

		// attach event handlers to child frame
		doc
		.on('click', 'body', function (e) {
			var me = $(e.target).hasClass('prime-region-item') ? $(e.target) : $(e.target).parents('.prime-region-item').eq(0);
			$(this).find('.prime-region-item-active').not(me).removeClass('prime-region-item-active');
			$('body').trigger('click');
		})
		.on('click', '.prime-region-item', function (e) {
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
				prime.page.region.add($(ui.draggable).data('id'), $(this));
				return true;
			}
		});
	});

	// prime module list
	// -----------------
	$('.prime-module-list')
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

	frame.attr('src', '/?mode=design');

	return page;
});