define(['jquery', 'jqueryUI'], function($) {

	var page = {},
		frame = $('.prime-live-iframe'),
		doc = frame.contents();

	// find current page id
	page.id = doc.find('[data-pageid]:eq(0)').data('pageid');

	// sortable tree function
	page.tree = function () {
		$('.panel-left .nav-tree .list-group').sortable({
			appendTo: 'body',
			revert: 50,
			distance: 15,
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
			}
		});
	};

	// set page tree actions and functions
	page.tree();

	page.visible = function (el) {
		$.ajax({
			url: $(el).attr('href')
		})
		.done(function (response) {
			$('.panel-left').html(response);
			page.tree();
		});

		return false;
	};

	// live module actions
	// todo: Move to acceptable place
	// -------------------
	page.module = {};
	page.module.html = function (region) {

		// setup buttons and scope form
		var save = $('<button/>', { class: 'btn btn-primary', text: 'Save' }),
			cancel = $('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' }),
			form;

		// setup ajax dialog with page tree
		var dialog = prime.dialog({
			title: 'Edit content',
			remote: '/Prime/Module/Html/Editor/' + region,
			buttons: [save, cancel]
		},

		// process modal once loaded
		function (modal) {

			// is it wysiwyg
			var wysiwyg = false;

			// set modal dialog width and padding
			modal.find('.modal-dialog').css({
				width: 640
			});

			if (modal.find('textarea').hasClass('wysiwyg'))
			{
				// load prime with ckeditor
				if ( ! window.ckeditor_loaded) {
					window.CKEDITOR_BASEPATH = '/media/Prime/js/ckeditor/';
					var ckeditor = document.createElement('script');
					ckeditor.src = '/media/Prime/js/ckeditor/ckeditor.js';
					ckeditor.onload = function () {
						CKEDITOR.replace(modal.find('textarea')[0]);
						window.ckeditor_loaded = true;
					}
					document.getElementsByTagName('head')[0].appendChild(ckeditor);
				} else if (CKEDITOR) {
					CKEDITOR.replace(modal.find('textarea')[0]);
				}

				wysiwyg = true;
			}

			// save contents on click
			save.on('click', function () {
				if (wysiwyg) {
					var editor = CKEDITOR.dom.element.get(modal.find('textarea')[0]).getEditor(),
					    editor_data = editor.getData();
					} else {
						editor_data = modal.find('textarea').val();
					}
				$.ajax({
					url: '/Prime/Module/Html/Save/' + region,
					type: 'POST',
					data: {
						content: editor_data
					}
				})
				.done(function (response) {
					if (wysiwyg) {
						var editor2 = $('.prime-live-iframe').contents().find('.prime-region-item[data-id='+region+'] [contenteditable]')[0];
						$('.prime-live-iframe')[0].contentWindow.CKEDITOR.dom.element.get(editor2).getEditor().setData(editor_data);
					} else {
						$('.prime-live-iframe').contents().find('.prime-region-item[data-id='+region+'] .prime-region-item-content').html(editor_data);
					}
					modal.modal('hide');
				});
			});
		});
	};



	// move page
	page.move = function (el) {

		// set page
		var moving = parseInt($(el).data('id')) || 0,
			to = 0;

		var select   = $('<button/>', { class: 'btn btn-primary btn-sm disabled', text: 'Select' }),
		    cancel   = $('<button/>', { class: 'btn btn-default btn-sm', 'data-dismiss': 'modal', text: 'Cancel' });

		// setup ajax dialog with page tree
		var dialog = prime.dialog({
			remote: '/Prime/Page/Tree',
			buttons: [select, cancel]
		},

		// process modal once loaded
		function (modal) {

			// set modal dialog width and padding
			modal.find('.modal-dialog').css({
				width: 320,
				paddingTop: 90
			});

			// remove modal header
			modal.find('.modal-header').remove();

			// remove moving page from selectable list
			modal.find('[data-id='+moving+']').parent().each(function () {
				if ($(this).parent().children().length === 1) {
					$(this).parent().parent().removeClass('has-children open');
				}
				$(this).remove();
			});

			// attach click handler to tree nodes
			modal.find('.nav-tree a').on('click', function () {

				// do nothing for unselectable
				if ($(this).attr('unselectable') === 'on') return false;

				// enable select button
				select.removeClass('disabled');

				// find active link in tree and remove its state
				modal.find('.nav-tree li').removeClass('active');

				// add active state to this item
				$(this).parent('li').addClass('active');

				// set selected page
				to = $(this).data('id');

				return false;
			});

			// attach click event to select button
			select.on('click', function () {
				if (to > 0) {
					$.ajax({
						url: $(el).attr('href') + ':' + to
					})
					.done(function (response) {
						$('.panel-left').html(response)
						page.tree();
					});
					modal.modal('hide');
				}
			});
		});

		return false;
	};


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

	page.draggableConfig = {
		helper: function (event) {
			var helper = $('<div/>').text('Some module')
			.css({
				fontWeight: 'bold',
				padding: '4px 10px',
				backgroundColor: '#ffffff',
				border: '1px solid #d5d5d5',
				boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
				height: 28,
				width: 'auto',
				zIndex: 1000
			});

			return helper;
		},
		iframeFix: true,
		containment: $('body'),
		appendTo: '.fullscreen',
		revert: false,
		handle: '.move-handle',
		revertDuration: 135,
		cursorAt: { left: 5 },
		start: function (e, ui) {
			$(this).addClass('prime-region-drag');
			$('.prime-live-iframe').each(function () {
				$(this).contents().find('body').addClass('prime-drag');
			});
			this.frame = $('.prime-live-iframe');
			this.frameTop = this.frame.offset().top;
			this.frameBtm = this.frameTop + this.frame.height();
			this.frame = this.frame.contents();
		},
		stop: function (e, ui) {
			$(this).removeClass('prime-region-drag');
			$('.prime-live-iframe').each(function () {
				$(this).contents().find('body').removeClass('prime-drag')
				.find('.prime-drop-active').removeClass('.prime-drop-active');
			});
		},
		drag: function (e, ui) {
			var region = $(this).data('region');
			if (region) {
				if (ui.offset.top < region.middle - 10) {
					region.above.addClass('prime-drop-active');
				} else if (ui.offset.top > region.middle + 10) {
					region.below.addClass('prime-drop-active');
				} else {
					region.above.removeClass('prime-drop-active');
					region.below.removeClass('prime-drop-active');
				}
			}
			if (ui.offset.top < this.frameTop + 75) {
				this.frame.scrollTop(this.frame.scrollTop() - 50);
			}
			if (ui.offset.top > this.frameBtm - 75) {
				this.frame.scrollTop(this.frame.scrollTop() + 50);
			}
		}
	};

	page.droppableConfig = {
		greedy: true,
		hoverClass: 'ui-state-active',
		drop: function (e, ui) {

			// drop point
			var drop = $(this).find('.prime-drop-active'),
				region_item = drop.parent(),
				region = region_item.parent(),
				above = drop.hasClass('prime-drop-above');

			// move some module
			if (ui.draggable.hasClass('prime-region-item'))
			{
				// move node in dom
				drop.parent()[above ? 'before' : 'after'](ui.draggable);

				// send api call       [id]                     [reference]               [above = true|below = false]
				prime.page.region.move(ui.draggable.data('id'), drop.parent().data('id'), above);
			}
			else if (ui.draggable.hasClass('list-group-item'))
			{
				prime.page.region.add(ui.draggable.data('id'), $(this).data('id'), region.data('pageid'), region.data('name'), above);
			}

			// remove all active drops
			$('.prime-live-iframe').contents().find('.prime-drop-active').removeClass('prime-drop-active');

			e.preventDefault();

			return true;
		},
		over: function (e, ui) {

			$('.prime-live-iframe').contents().find('.prime-drop-active').removeClass('prime-drop-active');

			this.location = {};
			this.location.top = $(this).offset().top + frame.offset().top;
			this.location.middle = this.location.top + Math.floor($(this).height() / 2);
			this.location.id = $(this).data('id');
			this.location.above = $(this).find('.prime-drop-above');
			this.location.below = $(this).find('.prime-drop-below');

			ui.draggable.data('region', this.location);
		},
		out: function (e, ui) {
			this.location.above.removeClass('prime-drop-active');
			this.location.below.removeClass('prime-drop-active');

			ui.draggable.data('region', null);
		}
	};

	// region object
	page.region = {
		init: function () {
			$(this).draggable(page.draggableConfig)
			.droppable(page.droppableConfig)
			.addClass('prime-region-item-active');
			$(this).find('[contenteditable]').each(function () {
				$('.prime-live-iframe')[0].contentWindow.CKEDITOR.inline(this);
				$(this).trigger('focus');
			});
		},
		addDelay: false,
		add: function(module_id, reference_id, page_id, region, above) {
			if (page.addDelay) return;

			$.ajax({
				url: '/Prime/Region/Add',
				type: 'POST',
				data: {
					module: module_id,
					reference: reference_id,
					position: above ? 'above' : 'below',
					page: page_id,
					region: region
				}
			})
			.done(function (response) {
				var reference = $('.prime-live-iframe').contents().find('.prime-region-item[data-id=' + reference_id + ']'),
				    region = $(response);

				// append to dom
				reference[above ? 'before' : 'after'](region);

				// initialize the region
				region.each(page.region.init);

				// remove reference if empty
				if (reference.hasClass('prime-region-empty')) {
					reference.remove();
				}
			});

			// we dont want any OOPses here ...
			page.addDelay = true;
			setTimeout(function() { page.addDelay = false; }, 330);
		},
		move: function (region_id, reference_id, above) {

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
						var region_item = $('.prime-live-iframe').contents().find('.prime-region-item[data-id=' + id + ']'),
						    region = region_item.parent();
						if (region.children().length === 1) {
							$('<div/>', {class:'prime-region-item prime-region-empty', 'data-id': 0})
							.append($('<div/>', { class: 'prime-drop prime-drop-above', style: 'display: none;' }).text('Drop module here'))
							.append($('<div/>', { class: 'prime-drop prime-drop-below', style: 'display: none;' }).text('Drop module here'))
							.appendTo(region)
							.droppable(page.droppableConfig);
						}
						region_item.remove();
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
						var region_item = $(response);
						$('.prime-live-iframe').contents().find('.prime-region-item[data-id=' + id + ']').html(region_item);
						region_item.each(page.region.init);

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

		page.id = doc.find('[data-pageid]:eq(0)').data('pageid');

		// Lets push to history
		History.pushState({
			type: 'page',
			page: page.id
		}, 'Prime 3.3/master', '/Prime/Page/Edit/' + page.id);

		// add active class to current page
		$('.panel-left .nav-tree [data-id=' + page.id + ']').parent().addClass('active').parents('.has-children:not(.open)').each(function () {
			$(this).children('b.caret').trigger('click');
		});

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
						    region = $(this).parent();
						editor.changed = false;
						editor.on('change', function () {
							this.changed = true;
						});
						editor.on('blur', function (e) {
							if (editor.changed === false) 
								return;

							$.ajax({
								url: '/Prime/Module/Html/Save/' + region.data('id'),
								type: 'POST',
								data: {
									content: editor.getData()
								}
							})
							.done(function () {
								editor.changed = false;
							});
						});
						editor.on('focus', function (e) {
							// make sure region will be active
							region.addClass('prime-region-item-active');
						})
					});
				}, 330);
			});
		};

		// append script
		this.contentWindow.document.body.appendChild(ckeditor);

		// attach event handlers to child frame
		doc
		.on('click', function (e) {
			if (($(e.target).attr('class')+'').substring(0, 3) !== 'cke') {
				var me = $(e.target).hasClass('prime-region-item') ? $(e.target) : $(e.target).parents('.prime-region-item').eq(0);
				$(this).find('.prime-region-item-active').not(me).removeClass('prime-region-item-active');
			}
			$('body').trigger('click');
		})
		.on('click', '.prime-region-item', function (e) {
			if ($(this).hasClass('prime-region-empty')) return;
			$(this).addClass('prime-region-item-active');
		});

		// find region items (moving functionality)
		// ----------------------------------------
		doc.find('.prime-region-item')
		.draggable(page.draggableConfig)
		.droppable(page.droppableConfig);

	});


	// prime module list
	// -----------------
	$('.prime-module-list')
	.find('.list-group > .list-group-item')
	.draggable($.extend({}, page.draggableConfig, {
		helper: 'clone',
		revert: true,
		revertDuration: 135,
		handle: null
	}));

	frame.trigger('load');

	return page;
});