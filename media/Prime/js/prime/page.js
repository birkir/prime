define(['jquery', 'jqueryUI'], function($) {

	var page = {},
		frame = $('.prime-live-iframe'),
		doc = frame.contents();

	// find current page id
	page.id = doc.find('[data-pageid]:eq(0)').data('pageid');

	page.publish = function (element, discard) {
		var active = $('.panel-left li.active').children('a').data('id');
		$.ajax({
			url: element.href,
		})
		.done(function (response) {
			$('.panel-left').html(response);
			page.tree(active);
			$('.tree-context.open').remove();
			$('.pchanges').addClass('hide');
			if (discard) {
				$('.panel-left li.active > a').trigger('click');
			}
		});

		return false;
	};

	// sortable tree function
	page.tree = function (active_node) {
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
				var ref = ui.item.next().children('a').data('id'),
				    id = ui.item.children('a').data('id');

				$.ajax({
					url: '/Prime/Page/Reorder/' + [id, ref].join(':')
				});
			}
		});
		$('.panel-left [data-id='+active_node+']').parent().addClass('active');
	};

	// set page tree actions and functions
	page.tree();

	page.visible = function (el) {
		var active = $('.panel-left li.active').children('a').data('id');
		$.ajax({
			url: $(el).attr('href')
		})
		.done(function (response) {
			$('.panel-left').html(response);
			page.tree(active);
		});

		return false;
	};

	page.rename = function (el) {
		var active = $('.panel-left li.active').children('a').data('id');

		prime.rename(el, function (response) {
			$('.panel-left').html(response)
			prime.page.tree(active);
		});

		return false;
	}

	// live module actions
	// todo: Move to acceptable place
	// -------------------
	page.module = {};

	// loop through modules list
	$('.prime-module-list .list-group-item[data-js=1]').each(function () {
		var slug = $(this).data('slug').split('.')[1];
		require(['page_module/' + slug], function (moduleController) {
			page.module[slug] = moduleController;
		});
	});

	// move page
	page.move = function (el) {

		// set page
		var moving = parseInt($(el).data('id')) || 0,
			to = 0;

		var select   = $('<button/>', { class: 'btn btn-danger btn-sm disabled', text: 'Select' }),
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
		var save = $('<button/>', { class: 'btn btn-danger', text: 'Save' }),
			cancel = $('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' });

		// create dialog
		var dialog = prime.dialog({
			title: $(element).data('title'),
			remote: element.href,
			buttons: [save, cancel]
		},
		function (modal) {

			var form = modal.find('form');

			// validate and handle form submit
			prime.validate(form, function (response) {
				if (response.status === true) {
					var active = $('.panel-left li.active').children('a').data('id');
					$('.panel-left').html(response.data);
					dialog.modal('hide');
					page.tree(active);
				}
			});

			save.on('click', function () {
				form.trigger('submit');
			});
		});

		return false;
	};

	// create remove confirmation dialog
	page.delete = function (element) {

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
				.done(function (response) {
					var active = $('.panel-left li.active').children('a').data('id');
					$('.panel-left').html(response);
					dialog.modal('hide');
					page.tree(active);
				});
			}
		});

		return false;
	};

	// setup page properties modal
	page.properties = function (element) {

		// create buttons
		var save = $('<button/>', { class: 'btn btn-danger', text: 'Save' }),
			cancel = $('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' });

		// create dialog
		var dialog = prime.dialog({
			title: $(element).text(),
			remote: element.href,
			buttons: [save, cancel]
		},
		function (modal) {

			var form = modal.find('form');

			// validate and handle form submit
			prime.validate(form, function (response) {
				if (response.status === true) {
					var active = $('.panel-left li.active').children('a').data('id');
					$('.panel-left').html(response.data);
					dialog.modal('hide');
					page.tree(active);

					if ($(element).data('id') == active) {
						$('.panel-left li.active > a').trigger('click');
					}
				}
			});

			save.on('click', function () {
				form.trigger('submit');
			});
		});

		return false;
	};

	page.draggableConfig = {
		helper: function (event) {
			var helper = $('<div/>').text('Move')
			.css({
				fontWeight: 'bold',
				padding: '4px 10px',
				backgroundColor: '#ffffff',
				border: '1px solid #d5d5d5',
				boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
				height: 28,
				marginLeft: 270,
				width: 150,
				textAlign: 'center',
				zIndex: 1000
			});

			return helper;
		},
		snap: true,
		snapMode: 'outer',
		snapTolerance: 15,
		iframeFix: true,
		containment: $('body'),
		appendTo: '.fullscreen',
		revert: false,
		handle: '.move-handle',
		revertDuration: 135,
		cursorAt: { left: 270, top: 0 },
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
				if (ui.offset.top < region.middle) {
					region.above.addClass('prime-drop-active');
					region.below.removeClass('prime-drop-active');
				} else if (ui.offset.top > region.middle) {
					region.above.removeClass('prime-drop-active');
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
		accept: '.list-group-item, .prime-region-item',
		drop: function (e, ui) {

			// drop point
			var drop      = $(this).find('.prime-drop-active');
			if (prime.active_dropzone) { drop = prime.active_dropzone; }

			var item      = drop.parent(),
				region    = item.parent(),
				above     = drop.hasClass('prime-drop-above'),
				reference = above ? drop.parent() : drop.parent().next();

			var draggable = ui.draggable;
			var moving    = ui.draggable.hasClass('prime-region-item');

			if (moving) {

				var oldRegion = ui.draggable.parent();

				drop.parent()[above ? 'before' : 'after'](ui.draggable);

				$.ajax({
					url: '/Prime/Region/Move/' + [ui.draggable.data('id'), reference.data('id'), region.data('name'), region.data('pageid'), region.data('sticky')].join(':') + '?mode=design'
				});

				if (region.data('sticky') != '1')
					page.unpublished();

				// Create Empty Dropzone
				if (oldRegion.children().length === 0) {

					var dropzone = $('<div/>', { class: 'prime-region-item prime-region-empty', 'data-id': 0 })
					    .append(   $('<div/>', { class: 'prime-drop prime-drop-above', text: 'Dropzone' }).hide());

					oldRegion.removeClass('prime-region-item-active').append(dropzone);

					dropzone.droppable(page.droppableConfig);
				}
			}
			else
			{
				$.ajax({
					url: '/Prime/Region/Add/' + [ui.draggable.data('id'), reference.data('id'), region.data('name'), region.data('pageid'), region.data('sticky')].join(':') + '?mode=design'
				})
				.done(function (response) {

					var region = $(response);

					// append to dom
					if (reference.length === 0)
						drop.parent().parent().append(region);
					else
						reference.before(region);

					// initialize the region
					region.each(page.region.init);

					// remove reference if empty
					if (reference.hasClass('prime-region-empty')) {
						reference.remove();
					}

					if (region.data('sticky') != '1')
						page.unpublished();
				});
			}

			// remove all active drops
			$('.prime-live-iframe').contents().find('.prime-drop-active').removeClass('prime-drop-active');

			return true;
		},
		over: function (e, ui) {

			$('.prime-live-iframe').contents().find('.prime-drop-active').removeClass('prime-drop-active');

			this.location = {};
			this.location.top = $(this).offset().top + frame.offset().top;
			this.location.middle = Math.floor(this.location.top + ($(this).height() / 2));
			this.location.id = $(this).data('id');
			this.location.above = $(this).children('.prime-drop-above');
			this.location.below = $(this).children('.prime-drop-below');

			ui.draggable.data('region', this.location);
		},
		out: function (e, ui) {

			this.location.above.removeClass('prime-drop-active');
			this.location.below.removeClass('prime-drop-active');

			ui.draggable.data('region', null);
		}
	};

	page.unpublished = function () {
		var node   = $('.panel-left li.active'),
			state  = $('<i/>', { class: 'fa fa-pencil right text-info' });

		if (node.children('i').length === 0) {
		    node.addClass('unpublished').children('b').after(state);
		}

		$('.pchanges').removeClass('hide');
	}

	page.template_settings = function (el, pid, template) {

		var region = $(el).closest('form').data('region'),
		    save = $('<button/>').addClass('btn btn-danger').text('Save'),
			close = $('<button/>').addClass('btn btn-default').text('Close').attr('data-dismiss', 'modal');

		var dialog = prime.dialog({
			title: 'Template Settings',
			remote: '/Prime/Page/Template_Settings/' + pid + ':' + template,
			buttons: [save, close]
		},
		function (modal) {
			var active = $('.panel-left li.active').children('a').data('id');
			form = modal.find('form');
			form.on('submit', function () {
				$.ajax({
					url: '/Prime/Page/Template_Settings/' + pid + ':' + template + '?mode=design',
					type: 'POST',
					data: $(this).serialize()
				})
				.done(function (response) {
					$('.panel-left').html(response);
					page.tree(active);

					if (pid == active) {
						$('.panel-left li.active > a').trigger('click');
					}
				});

				return false;
			});
			save.on('click', function () {
				modal.find('form').trigger('submit');
			});
		});
		return false;
	};

	// region object
	page.region = {
		init: function () {
			frame.contents().find('.prime-region-item-active').removeClass('prime-region-item-active');
			$(this).draggable(page.draggableConfig)
			.droppable(page.droppableConfig)
			.addClass('prime-region-item-active');
			$(this).find('[contenteditable]').each(function () {
				$('.prime-live-iframe')[0].contentWindow.CKEDITOR.inline(this);
			});
			$(this).find('.prime-region-item').draggable(page.draggableConfig).droppable(page.droppableConfig);
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

						if (region.data('sticky') != '1')
							page.unpublished();
					});
				}
			}, function (modal) {
				modal.find('.btn.btn-danger').trigger('focus');
			});
		},
		settings: function (id) {
			var save = $('<button/>').addClass('btn btn-danger').text('Save'),
				close = $('<button/>').addClass('btn btn-default').text('Close').attr('data-dismiss', 'modal');

			var dialog = prime.dialog({
				title: 'Settings',
				remote: '/Prime/Region/Settings/' + id,
				buttons: [save, close]
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
						region_item.parent().each(page.region.init);
					});

					if ($('.prime-region-item[data-id=' + id + ']').parent().data('sticky') != '1')
						page.unpublished();

					return false;
				});
				save.on('click', function () {
					modal.find('form').trigger('submit');
				});
			});
		},
		template_settings: function (el, key_name, crc32) {
			
			var region = $(el).closest('form').data('region'),
			    save = $('<button/>').addClass('btn btn-danger').text('Save'),
				close = $('<button/>').addClass('btn btn-default').text('Close').attr('data-dismiss', 'modal');

			var dialog = prime.dialog({
				title: 'Template Settings',
				remote: '/Prime/Region/Template_Settings/' + region + ':' + crc32 + ':' + key_name,
				buttons: [save, close]
			},
			function (modal) {
				form = modal.find('form');
				form.on('submit', function () {
					$.ajax({
						url: '/Prime/Region/Template_Settings/' + region + ':' + crc32 + ':' + key_name + '?mode=design',
						type: 'POST',
						data: $(this).serialize()
					})
					.done(function (response) {
						var region_item = $(response);
						$('.prime-live-iframe').contents().find('.prime-region-item[data-id=' + region + ']').html(region_item);
						region_item.parent().each(page.region.init);
					});

					if ($('.prime-live-iframe').contents().find('.prime-region-item[data-id=' + region + ']').parent().data('sticky') != '1')
						page.unpublished();

					return false;
				});
				save.on('click', function () {
					modal.find('form').trigger('submit');
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

		prime.changingView = true;

		// Lets push to history
		History.pushState({
			type: 'page',
			page: page.id,
			src:  this.src
		}, window.document.title, '/Prime/Page/Edit/' + page.id);

		// add active class to current page
		$('.panel-left .nav-tree [data-id=' + page.id + ']').parent().addClass('active').parents('.has-children:not(.open)').each(function () {
			$(this).children('b.caret').trigger('click');
		});

		// are unpublished changes on page?		
		$('.pchanges')[$('.panel-left li.active').hasClass('unpublished') ? 'removeClass' : 'addClass']('hide');

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
						    region = $(this).closest('.prime-region-item');
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
								if (region.parent('.prime-region').data('sticky') != '1')
									prime.page.unpublished();
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

		function addDesignMode(str_ori) {
			var loc = window.location,
			    host = loc.protocol + '//' + loc.hostname,
			    str  = str_ori.indexOf(host) >= 0 ? str_ori.substr(host.length) : str_ori;
			if (str[0] !== '/') return str_ori;

			var href  = str,
			    query = href.indexOf('?'),
			    hash  = href.indexOf('#'),
			    uri   = href.substr(0, (query >= 0) ? query : ((hash >= 0) ? hash : href.length)),
			    query = query >= 0 ? href.substr(query + 1, hash >= 0 ? hash - query - 1 : href.length).split('&') : [],
			    querystring = {};
			for (key in query) {
				querystring[query[key].split('=')[0]] = query[key].split('=')[1];
			}
			querystring.mode = 'design';
			query = [];
			for (key in querystring) {
				query.push(key+'='+querystring[key]);
			}
			return uri + '?' + query.join('&') + (hash >= 0 ? href.substr(hash) : '');
		};

		// find all links and forms on page
		doc.find('a').each(function () {
			this.href = addDesignMode(this.href);
		});
		doc.find('form').each(function () {
			if (this.method === 'get') {
				$(this).append($('<input/>', {type: 'hidden', name: 'mode', value: 'design'}));
			} else {
				this.action = addDesignMode(this.action);
			}
		})

	});


	// prime module list
	// -----------------
	$('.prime-module-list')
	.find('.list-group > .list-group-item')
	.draggable($.extend({}, page.draggableConfig, {
		helper: function (event) {
			var helper = $('<div/>').text($(event.currentTarget).find('.list-group-item-heading').text())
			.css({
				fontWeight: 'bold',
				padding: '4px 10px',
				backgroundColor: '#ffffff',
				border: '1px solid #d5d5d5',
				boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
				height: 28,
				width: 150,
				textAlign: 'center',
				zIndex: 1000
			});

			return helper;
		},
		revert: true,
		revertDuration: 135,
		cursorAt: { left: 0, top: 0 },
		handle: null
	}));

	// mega hack !!
	$(document).on('mouseup', function () {
		prime.active_dropzone = $('.prime-live-iframe').contents().find('.prime-drop-active');
	})

	$('.pchanges')
	.on('click', '.btn', function () {
		var discard = $(this).hasClass('discard'),
		    publish = $(this).hasClass('publish'),
		    element = { href: '/Prime/Page/'+(publish ? 'Publish' : 'Discard')+'/' + prime.page.id }

		// Trigger
		prime.page.publish(element, discard);

		return false;
	});

	frame.trigger('load');

	return page;
});