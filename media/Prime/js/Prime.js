var Prime = (function () {

	var app = {};

	app.Resize = function () {

	};

	app.StartLoading = function () {
		app.Loading = app.Alert({
			html: 'Loading...'
		});
	};

	app.StopLoading = function () {
		if (app.Loading)
			app.Loading.fadeOut(330);
	};

	/**
	 * Confirm 
	 */
	app.Confirm = function (title, message, onConfirm) {

		var body = $('<div/>')
		.append(message)
		.append(
			$('<div />', { class: 'btn-toolbar' })
			.append($('<button/>', { class: 'btn btn-primary', text: 'Ok' }).on('click', function () {
				if (onConfirm(modal)) {
					modal.hide();
				}
			}))
			.append($('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' }))
		);

		var modal = app.Modal({
			title: title,
			body: body
		});

		modal.find('.btn-primary').trigger('focus');

		return modal;
	};

	/**
	 * Modal
	 */
	app.Modal = function (opts) {

		opts = $.extend({}, {
			title: null,
			body: null,
			close: true
		}, opts);

		var modal = $('<div/>', { class: 'modal', 'data-backdrop': 'false' })
		.append(
			$('<div/>', { class: 'modal-dialog' })
			.append(
				$('<div/>', { class: 'modal-content' })
				.append($('<div/>', { class: 'modal-body' }))
			)
		),
		content = modal.find('.modal-body');

		if (opts.close === true) {
			content.append($('<button/>', { type: 'button', class: 'close', html: '&times;', 'data-dismiss': 'modal', 'aria-hidden': 'true' }));
		}

		if (opts.title && opts.title !== null) {
			content.append($('<h5/>', { class: 'modal-title', text: opts.title }));
		}

		if (opts.body && opts.body !== null) {
			content.append(opts.body);
		}

		modal
		.on('shown.bs.modal', function () {
			var dialog = $(this).find('.modal-dialog');
			dialog.css({
				paddingTop: 0,
				marginTop: ($(window).height() / 2) - dialog.height()
			});
		})
		.modal({
			show: true,
			keyboard: true
		})
		.appendTo('.alert-container');

		return modal;
	};

	/**
	 * Alert
	 */
	app.Alert = function (opts) {

		opts = $.extend({}, {
			type: 'warning',
			position: 'top-center',
			html: '',
			title: null,
			timeout: null,
			confirm: false
		}, opts);

		var alert = $('<div/>', { 'class': 'alert alert-' + opts.type })
		.css({
			display: 'inline-block',
			position: 'absolute',
			fontSize: '13px',
			padding: '3px 12px'
		});

		$('.alert-container').append(alert).find(':hidden').remove();

		if (opts.position === 'top-center') {
			alert.css({
				top: 30,
				left: '50%',
				marginLeft: -alert.width() / 2,
				'border-top-left-radius': 0,
				'border-top-right-radius': 0,
				'border-top-width': 0
			});
		}

		if (opts.confirm === true) {
			alert.append($('<button/>', { type: 'button', 'class': 'close', 'data-dismiss': 'alert', html: '&times;'}));
		}

		if (opts.title) {
			alert.append($('<h4/>').text(opts.title));
		}

		if (opts.html !== '') {
			alert.append(opts.html);
		}

		// then show
		alert.css({ zIndex: 50 });

		return alert;
	};

	app.TreeView = function () {
		// scope the tree
		var allItems = $(this).find('.list-group-item'),
			groups = $(this).find('.list-group'),
			treeRecursive = function (items, level) {
				level = level || 0;
				items.each(function (i, item) {
					treeRecursive($(this).children('.list-group').children('.list-group-item'), level + 1);
					if (level > 0)
					$(item).prepend($('<b/>', { class: 'caret', onselectstart: 'return false;' }).on('click', function () {
						$(item).toggleClass('open');
					}).css({ marginLeft: ((10 * level) + 3 - 5) }));
					$(item).children('a').wrapInner($('<span/>').css({ marginLeft: level > 0 ? (10 * level) + 18 - 5 : 7 }));
				});
			};

		$(document).on('click', '.nav-tree a:not([unselectable])', function () {
			$('.nav-tree li').removeClass('active');
			$(this).parent('li').addClass('active');
		});

		// recursivly position nodes left offset
		treeRecursive($(this).children('.list-group-item'), 0);
	};

	/**
	 * Element Helpers for Live Frame
	 */
	app.LiveFrameElement = {
		Droppables: function () {
			$(this)
			.droppable({
				greedy: true,
				hoverClass: 'ui-state-active',
				drop: function (e, ui) {
					Prime.Page.RegionItemAdd($(ui.draggable).data('id'), $(this));
					return true;
				}
			});
		},
		RegionItem: function () {
			$(this)
			.on('click', function () {
				$(this).addClass('prime-region-item-active');
				// Prime.Page.RegionItemSettings($(this).data('id'));
			})
			.draggable({
				cursorAt: { top: 0, left: 0 },
				revert: true,
				revertDuration: 135,
				iframeFix: true,
				handle: '.prime-move-handle'
			});
		},

		/**
		 * @category Prime/Module/Html
		 */
		ContentEditable: function () {
			$(this)
			.on('focus', function () {
				this.cacheData = app.LiveFrameContainer.contentWindow.CKEDITOR.dom.element.get(this).getEditor().getData();
			})
			.on('blur', function () {
				var content = app.LiveFrameContainer.contentWindow.CKEDITOR.currentInstance.getData();
				if (content === this.cacheData) return;
				$.ajax({
					url: '/Prime/Page/EditContent/' + $(this).parents('.prime-region-item').data('id'),
					type: 'POST',
					data: { content: content }
				});
			});
		}
	};

	/**
	 * Live Frame
	 */
	app.LiveFrame = function () {

		// find all links that target the frame
		$('[target = ' + $(this).attr('name') + ']').on('click', app.StartLoading);

		// on iframe load
		$(this).on('load', function () {

			app.StopLoading();

			var CKEditor = document.createElement('script'),
				frame = this;
			CKEditor.src = '/media/Prime/js/ckeditor/ckeditor.js';
			frame.contentWindow.document.body.appendChild(CKEditor);

			var frameDoc = $(this).contents();

			frameDoc
			.find('head:eq(0)')
			.append($('<link/>', { href: '/media/Prime/css/Frontend.css', rel: 'stylesheet' }));

			frameDoc
			.find('body')
			.on('click', function (e) {
				var me = $(e.target).hasClass('prime-region-item') ? $(e.target) : $(e.target).parents('.prime-region-item').eq(0);
				$(this).find('.prime-region-item-active').not(me).removeClass('prime-region-item-active');
				$('#rightPanelRegion').html('<p class="text-muted">No region selected</p>');
				$('.panel-right .page-tab').trigger('click');
				$('body').trigger('click'); // proxy click to parent window
			})

			// prime region items
			.find('.prime-region-item')
			.each(app.LiveFrameElement.RegionItem);

			frameDoc
			.find('.prime-drop')
			.each(app.LiveFrameElement.Droppables);

			/**
			 * @category Prime/Module/Html
			 */
			frameDoc.
			find('[contenteditable]')
			.each(app.LiveFrameElement.ContentEditable);

			// set page id
			app.pageid = $(this).contents().find('[data-pageid]:eq(0)').data('pageid');
			app.LiveFrameContainer = this;
		});
	};

	/**
	 * Module List
	 */
	app.ModuleList = function () {
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

	/**
	 * Scope Page object
	 */
	app.Page = {};

	app.Page.TreeSortable = function () {
	};

	/**
	 * Edit Content

	 * @category Prime/Module/Html
	 * @param integer
	 */
	app.Page.EditContent = function (ItemID) {
		$.ajax({
			url: '/Prime/Page/GetContent/' + ItemID
		})
		.done(function (response) {
			var richtext = $('<textarea/>', {
				rows: 10,
				cols: 10,
				html: response
			})[0],
			modal = app.Confirm(null, $(richtext), function () {
				var editordata = CKEDITOR.dom.element.get(richtext).getEditor().getData();
				$.ajax({
					url: '/Prime/Page/EditContent/' + ItemID,
					type: 'POST',
					data: {
						content: editordata
					}
				})
				.done(function (response) {
					$('iframe').contents()
					.find('.prime-region-item[data-id='+ItemID+']')
					.children('[contenteditable]')
					.each(function () {
						app.LiveFrameContainer.contentWindow.CKEDITOR.dom.element.get(this).getEditor().setData(editordata);
					});
				});

				return true;
			})
			.find('.modal-dialog').css({
				width: 800,
				marginLeft: -400
			})
			.find('.close')
			.hide();
			CKEDITOR.replace(richtext);
		});
	};

	/**
	 * Delete Region Item
	 * @param integer
	 */
	app.Page.RegionItemDelete = function (ItemID) {
		app.Confirm('Region Item', 'Are you sure you want to delete this item?', function () {
			$.ajax({
				url: '/Prime/Page/DeleteRegion/' + ItemID
			})
			.done(function (response) {
				$('.prime-live-iframe').contents().find('.prime-region-item[data-id=' + ItemID + ']').remove();
			});
			return true;
		});
	};

	/**
	 * Add Region Item to Page
	 */
	app.Page.RegionItemAdd = function (ModuleID, drop) {
		$.ajax({
			url: '/Prime/Page/AddRegion',
			type: 'GET',
			data: {
				position: drop.data('position'),
				ref: drop.parent('.prime-region-item').data('id'),
				module: ModuleID,
				region: drop.parents('.prime-region:eq(0)').data('name'),
				page: app.pageid
			}
		})
		.done(function (response) {
			var dom = $(response);
			dom
			.each(app.LiveFrameElement.RegionItem)
			.find('[contenteditable]')
			.each(function () {
				app.LiveFrameContainer.contentWindow.CKEDITOR.inline(this);
			})
			.each(app.LiveFrameElement.ContentEditable);
			dom
			.find('.prime-drop')
			.each(app.LiveFrameElement.Droppables);
			drop.before(dom);
			dom
			.find('.prime-region-item-content')
			.focus();
			dom.trigger('click');
		});
	};

	app.Page.RegionItemSettings = function(ModuleID, drop) {
		$.ajax({
			url: '/Prime/Page/RegionSettings/' + ModuleID
		})
		.done(function (response) {
			$('#rightPanelRegion').html(response);
			$('.panel-right .region-tab').trigger('click');
			$('.alert.alert-warning').remove();
			$('#rightPanelRegion').find('form').on('submit', function () {
				// do a update
				return false;
			});
		});
	};

	/** Module SCOPE **/
	app.Module = {
		Fieldset: {}
	};

	/**
	 * Fieldset Save Item
	 */
	app.Module.Fieldset.SaveItem = function (form) {
		$.ajax({
			url: '/Prime/Module/Fieldset/ItemSave',
			type: 'POST',
			data: $(form).serialize()
		})
		.done(function (response) {
			Prime.LoadView('/Prime/Module/Fieldset/Detail/' + $(form).find('input[name=_fieldset_id]').val());
		});
		return false;
	};



	/**
	 * Selectable tables
	 */
	app.Tables = function () {

		// FIXED HEADER
		if ($(this).hasClass('table') && $(this).parents('.modal-body').length === 0) {

			var table = $(this),
				thead = table.children('thead'),
				containment = table.parent(),
				fixed = thead
			.clone()
			.css({
				top: containment.offset().top
			})
			.addClass('header-fixed')
			.appendTo(table);

			containment.on('scroll', function () {
				if (containment.scrollTop() > 0) table.addClass('scrolled');
				else table.removeClass('scrolled');
			});
			// calculate new widths on copied thead
			$(window).on('resize', function () {
				fixed
				.find('tr > th')
				.each(function (i, item) {
					$(this).css({
						width: thead.find('tr > th:eq(' + i + ')').outerWidth()
					});
				});
			}).trigger('resize');

			// visibility hide original theader
			thead.css({ opacity: 0 });
		}


		// TABLE-SELECTION
		if ($(this).hasClass('table-selection')) {

			var table = $(this).data('selected', {}),
				allCheckbox = table.find('thead th:first-child input'),
				lastRow;

			$(document)
			.on('keydown', function (e) {
				if (e.keyCode === 16) table.shiftKey = true;
			})
			.on('keyup', function (e) {
				if (e.keyCode === 16) table.shiftKey = false;
			});

			allCheckbox
			.on('change', function () {
				table.find('tbody td:first-child input').prop('checked', $(this).prop('checked')).trigger('change');
			});

			table.find('tbody tr')
			.attr('onselectstart', 'return false;')
			.on('click', function (e) {
				var inp = $(this).find('td:first-child input');
				if (e.target == inp[0]) return;
				inp.prop('checked', ! inp.prop('checked')).trigger('change');
			});

			table
			.find('tbody tr td:first-child input')
			.on('change', function (e) {
				$(this).parents('tr')[($(this).prop('checked') ? 'addClass' : 'removeClass')]('active');
				var indexRow = $(this).parents('tr'),
					selectedCount = table.find('tbody tr td:first-child input:checked').length,
					totalCount = table.find('tbody tr td:first-child input').length;

				if (table.shiftKey && lastRow.length === 1 && indexRow[0] !== lastRow[0]) {
					var until = (indexRow.index() > lastRow.index() ? 'prevUntil' : 'nextUntil');
					indexRow[until](lastRow)
					.find('td:first-child input')
					.prop('checked', lastRow.find('td:first-child input').prop('checked'))
					.trigger('change');
				}

				if (selectedCount === totalCount) {
					allCheckbox.prop('checked', true);
				} else if (selectedCount !== totalCount) {
					allCheckbox.prop('checked', false);
				}

				if ($(this).prop('checked')) {
					table.data('selected')[indexRow.index()] = true;
				} else {
					delete table.data('selected')[indexRow.index()];
				}

				table.trigger('selectionchange');

				lastRow = indexRow;
			})
			.trigger('change');
		}

		// TABLE-SORTER
		if ($(this).hasClass('table-sortable')) {
			$(this).tablesorter({
				headerTemplate: '{content} {icon}',
				selectorHeaders: 'thead.header-fixed tr th',
				tableClass: 'table-sortable',
				cssAsc: 'table-header-asc',
				cssDesc: 'table-header-desc',
				cssIcon: 'icon-chevron-down pull-right'
			});
		}

		// TABLE-DND
		if ($(this).hasClass('table-dnd')) {
			$(this).tableDnD({
				onDrop: function (table, row) {
					$.ajax({
						url: $(table).data('reorder-api'),
						type: 'POST',
						data: {
							id: $(row).data('id'),
							ref: $(row).prev().data('id') || 0
						}
					});
				}
			});
		}
	};

	app.Elements = function () {
		$(this).find('select').select2({
			placeholder: 'Please select something',
			minimumResultsForSearch: 100
		});
		$(this).find('table').each(app.Tables);
	};

	/**
	 * Load View
	 */
	app.LoadView = function (href, whereto) {
		whereto = whereto === undefined ? $('.panel-center') : whereto;

		whereto.empty();
		$.ajax({
			url: href
		})
		.done(function (response) {
			whereto.html(response);

			// wat table test
			whereto.each(app.Elements);
		});
		return false;
	};

	app.LoadPopup = function (href) {
		$.ajax({
			url: href
		})
		.done(function (response) {
			Prime.Modal({
				title: 'Configure Fields',
				close: true,
				body: '<section class="popup">' + response + '</section>'
			});
			$('section.popup').each(Prime.Elements);
		});

		return false;
	};

	/**
	 * Initialize the application
	 */
	app.Initialize = function () {

		// visualize ajax requests
		jQuery.ajaxSetup({
			beforeSend: function (xhr) {
				app.StartLoading();
				xhr.always(function (xhr) {
					app.StopLoading();
				});
				xhr.fail(function (xhr) {
					setTimeout(function () {
						app.Alert({
							type: 'danger',
							html: xhr.statusText
						});
					}, 110);
				});
			}
		});

		// live frame edit
		$('.prime-live-iframe').each(app.LiveFrame);

		// module list
		$('.prime-module-list').each(app.ModuleList);

		// wat table test
		$(document).each(app.Elements);
	};

	// scope app for later use (and API)
	return app;
}());

$(document).on('ready', Prime.Initialize);
$(window).on('resize', Prime.Resize);