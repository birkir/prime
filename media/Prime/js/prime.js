var prime = (function () {

	// public app
	var app = {};

	/**
	 * Start or stop loading notification
	 *
	 * @param  bool Loading state
	 * @return void
	 */
	app.loading = function (loading) {

		// set loading state
		loading = loading || false;

		// create loader on first call
		if ( ! this.loader) {

			// create dom
			this.loader = $('<div/>')
			.addClass('alert alert-warning top-center')
			.text('Loading...')
			.hide()
			.appendTo('body');

			// set margin left offset
			this.loader.css({ marginLeft: -(this.loader.width() / 2) });
		}

		// show or hide
		this.loader[loading ? 'fadeIn' : 'fadeOut'](175);
	};

	/**
	 * Create bootstrap modal dialog
	 *
	 * @param  array options
	 * @return DOM
	 **/
	app.dialog = function (options, callback) {

		// setup default options
		var defaults = {
			backdrop: false,
			animate: false,
			closeButton: true,
			keyboard: true,
			title: null,
			confirm: false,
			alert: false,
			buttons: [],
			remote: null,
			body: ''
		};

		// extend options
		options = $.extend({}, defaults, options);

		// define and create DOM
		var modal        = $('<div/>', { class: 'modal' + (options.animate === true ? ' fade' : '')    }).appendTo('body'),
			modalDialog  = $('<div/>', { class: 'modal-dialog'  }).appendTo(modal),
			modalContent = $('<div/>', { class: 'modal-content' }).appendTo(modalDialog),
			modalHeader  = $('<div/>', { class: 'modal-header'  }).appendTo(modalContent),
			modalTitle   = $('<h4/>',  { class: 'modal-title', text: options.title }),
			modalBody    = $('<div/>', { class: 'modal-body'    }).appendTo(modalContent),
			modalFooter  = $('<div/>', { class: 'modal-footer'  }).appendTo(modalContent),
			modalBtnYes  = $('<button/>', { class: 'btn btn-primary', 'data-dismiss': 'modal', html: 'Ok' }),
			modalBtnNo   = $('<button/>', { class: 'btn btn-default', 'data-dismiss': 'modal', html: 'Cancel' });

		// append title if set
		if (options.title && options.title !== undefined || options.closeButton === false) {
			modalTitle.appendTo(modalHeader);
		}

		// attach close button if wanted
		if (options.closeButton === true) {
			$('<button/>', { class: 'close', html: '&times;', 'data-dismiss': 'modal', 'aria-hidden': 'true' }).prependTo(modalHeader);
		}

		// if confirm is not false
		if (options.confirm !== false || options.alert === true) {

			// append confirm button
			options.buttons.push(modalBtnYes);

			// check for confirm
			if (options.confirm !== false) {
				// append Cancel button
				options.buttons.push(modalBtnNo);
			}
		}

		// append buttons to footer
		for (var i = 0; i < options.buttons.length; i++) {
			modalFooter.append(options.buttons[i]);
		}

		// remove footer or header if empty
		if (modalHeader.children().length === 0) modalHeader.remove();
		if (modalFooter.children().length === 0) modalFooter.remove();

		// setup bootstrap modal
		var modalDone = function (body) {

			// hide old modals
			$('body .modal:hidden').remove();

			// add body to modal
			modalBody.append(body);

			// setup bootstrap modal and proxy options
			modal.modal({
				backdrop: options.backdrop,
				keyboard: true,
				show: true
			});

			if (options.confirm !== false) {
				modalBtnYes.on('click', options.confirm);
			}

			// do callback if set
			if (callback !== undefined) {
				callback(modal);
			}

			// elements
			modal.each(prime.elements);
		};

		// remotely get modal body with ajax
		if (options.remote !== null) {
			$.ajax(typeof options.remote === 'string' ? {url: options.remote} : options.remote)
			.done(modalDone);
		} else {
			modalDone(options.body);
		}

		return modal;
	};

	/**
	 * Validation for forms with callback
	 */
	app.validate = function (form, callback) {

		// create validation object
		var validate = {};

		// messages
		validate.messages = {
			required: "This field is required.",
			remote: "Please fix this field.",
			email: "Please enter a valid email address.",
			url: "Please enter a valid URL.",
			date: "Please enter a valid date.",
			dateISO: "Please enter a valid date (ISO).",
			number: "Please enter a valid number.",
			digits: "Please enter only digits.",
			creditcard: "Please enter a valid credit card number.",
			matches: "Please enter the same value again.",
			maxlength: "Please enter no more than {0} characters.",
			minlength: "Please enter at least {0} characters.",
			rangelength: "Please enter a value between {0} and {1} characters long.",
			range: "Please enter a value between {0} and {1}.",
			max: "Please enter a value less than or equal to {0}.",
			min: "Please enter a value greater than or equal to {0}."
		}

		// format message with variables
		validate.format = function (str, args) {
			args = args || [];
			for (var i = 0; i < args.length; i++) {
				str = str.replace('\{'+i+'\}', args[i]);
			}
			return str;
		}

		// check for validation rule
		validate.rule = function (name, rule, messageArgs) {
			return function () {
				var element = $(this);
				messageArgs = messageArgs || [];
				for (var i = 0; i < messageArgs.length; i++) {
					messageArgs[i] = element.attr(messageArgs[i]);
				}
				if (typeof rule === 'function') {
					if (rule(element.val(), element)) {
						element.data('valid', false);
						element.data('message', validate.format(validate.messages[name], messageArgs));
					}
				}
			};
		}

		// validate specific field
		validate.field = function () {

			// get element
			var element = $(this),
				groupValid = true;

			// check if other elements in form group are invalid
			element.parents('.form-group').find('input, textarea, select').not(element).each(function () {
				if ($(this).data('valid') === false) {
					groupValid = false;
				}
			});

			// disable has-error and remove message
			if (groupValid)
				element.parents('.form-group').removeClass('has-error').find('.help-block.validate').remove();

			// check for empty flag
			if (element.data('empty') && element.val() === '') return;

			// validate emails
			element.filter('[type=email]').each(validate.rule('email', function (value) {
				return ! /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
			}));

			// validate URLs
			element.filter('[type=url]').each(validate.rule('url', function (value) {
				return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
			}));

			element.filter('[maxlength][minlength]').each(validate.rule('rangelength', function (value, element) {
				return (value.length > parseInt(element.attr('minlength'), 0) && value.length < parseInt(element.attr('maxlength'), 0));
			}, ['minlength', 'maxlength']));

			// max value length
			element.filter('[maxlength]').not('[minlength]').each(validate.rule('maxlength', function (value, element) {
				return value.length > parseInt(element.attr('maxlength'), 0);
			}, ['maxlength']));

			// max value length
			element.filter('[minlength]').not('[maxlength]').each(validate.rule('minlength', function (value, element) {
				return value.length < parseInt(element.attr('minlength'), 0);
			}, ['minlength']));

			// validate required fields
			element.filter('[required]').each(validate.rule('required', function (value) {
				return value.length === 0;
			}));

			// matches another field
			element.filter('[data-matches]').each(validate.rule('matches', function (value, element) {
				return value !== form.find(element.data('matches')).val();
			}));

			// check if element is valid
			if ( ! element.data('valid') && groupValid)
			{
				// form is not valid
				form.data('valid', false);

				// add has-error and message
				element.parents('.form-group').addClass('has-error').append(
					$('<span/>', { class: 'help-block validate', html: element.data('message') })
				);

				// validate tab panes
				element.parents('.tab-pane').addClass('validation-error');
			}

			return;
		};

		// defaults to valid
		form.data('valid', true);

		// validate on blur
		form.find('input, select, textarea').on('blur', function () {
			var element = $(this);

			// innocent until proved guilty
			element.data('valid', true);

			// filter remote elements
			element.filter('[data-remote]').each(function () {

				// do a remote call
				$.getJSON(element.data('remote')+'?value='+element.val(), function (data) {

					// check if is valid
					if (data.valid !== true)
						element.data('valid', false).data('message', data.message);

					// continue validation
					element.each(validate.field);
				});
			});

			// validate non-remote fields
			element.not('[data-remote]').each(validate.field);
		});

		// attach submit event handler to form
		form.on('submit', function () {

			// defaults to valid
			form.data('valid', true);

			// no tabs have error yet!
			form.find('.tab-pane, [data-toggle=tab]').removeClass('validation-error');

			// validate fields in form
			form.find('input, select, textarea').data('valid', true).each(validate.field);

			// check if form is valid
			if (form.data('valid')) {

				// do ajax call to form action
				$.ajax({
					url: form.attr('action'),
					type: 'POST',
					data: form.serialize(),
					dataType: 'json'
				})
				.done(function (response) {

					// check if errors were found in json data
					if (response.success === false) {

						// loop through errors
						for (var key in response.data) {

							// set error classes and message
							form.find('[name=' + key + ']').parents('.form-group').addClass('has-error').append(
								$('<span/>', { class: 'help-block validate', html: response.data[key] })
							);
						}

						return;
					}

					// do a callback with data object
					callback(response);
				});
			}
			else
			{
				// find all panes in tabbable
				var panes = form.find('.tab-pane.validation-error');

				// loop through panes
				panes.each(function () {

					// add class to tab
					var tab = form.find('[href=#'+this.id+']').addClass('validation-error');

					// if only one pane has error
					if (panes.length === 1) {

						// click the pane
						tab.trigger('click');

						// check if only one form group has error
						if (form.find('.has-error').length === 1) {

							// focus first field in group
							form.find('.has-error').find('input, textare, select').eq(0).trigger('focus');
						}
					}
				});
			}

			return false;
		});
	};

	/**
	 * Field configuration
	 *
	 * @return void
	 */
	app.field = {};
	app.field.properties = function(item, id) {

		// dialog buttons
		var create = $('<button/>', { class: 'btn btn-success btn-sm ', html: 'Add field' }),
		    edit   = $('<button/>', { class: 'btn btn-default btn-sm disabled pull-left', html: 'Edit' }),
		    remove = $('<button/>', { class: 'btn btn-default btn-sm disabled pull-left', html: 'Delete' });

		// setup dialog
		var dialog = prime.dialog({
			title:  $(item).text(),
			remote: item.href,
			buttons: [edit, remove, create]
		}, function (modal) {

			var resource_id = dialog.find('[data-resource-id]').data('resource-id'),
			    resource_type = dialog.find('[data-resource-type]').data('resource-type'),
			    selected = [],
			    changedFn = function () {
					var which = (this.selected.length === 0 ? 'addClass' : 'removeClass');
					edit[which]('disabled');
					remove[which]('disabled');
					if (this.selected.length > 1) {
						edit.addClass('disabled');
					}
					selected = [];
					$(this.selected).each(function () {
						selected.push($(this).data('id'));
					});
				};

			var fieldsetEvent = function () {

				// dialog2 buttons
				var save = $('<button/>', { class: 'btn btn-primary', text: 'Save' }),
					cancel = $('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' }),
					edit = ! $(this).hasClass('btn-success'),
					sel = $(this).data('id') || selected[0];

				// setup dialog
				var dialog2 = prime.dialog({
					title: edit ? 'Edit field' : 'Create field',
					remote: edit ? '/Prime/Field/Edit/' + sel : '/Prime/Field/Create/' + resource_type + ':' + resource_id,
					buttons: [save, cancel]
				}, function (modal) {

					modal.find('#fieldOptions').on('keyup', function () {
						var value = $(this).val(),
						    formGroup = $(this).parents('.form-group');
						try {
							if (value !== '') JSON.parse(value);
							formGroup.removeClass('has-error').addClass('has-success');
						} catch (e) {
							formGroup.removeClass('has-success').addClass('has-error');
						}
					}).on('blur', function () {
						$(this).parents('.form-group').removeClass('has-success');
					});

					// attach save button event
					save.on('click', function () {
						$.ajax({
							url: dialog2.find('form').attr('action'),
							type: 'POST',
							data: dialog2.find('form').serialize()
						})
						.done(function (response) {
							dialog.find('.modal-body').html(response);
							dialog.each(prime.elements);
							dialog.find('table').on('changed', changedFn);
							dialog2.modal('hide');
						});
					});
				});
			};

			// table changed
			dialog.find('table').on('changed', changedFn);

			// attach create button event
			create.on('click', fieldsetEvent);

			// attach edit button event
			edit.on('click', fieldsetEvent);

			// attach doubleclick event
			dialog.find('table tbody tr').on('dblclick', fieldsetEvent);

			// attach remove button event
			remove.on('click', function () {
				if ($(this).hasClass('disabled')) return;

				var dialog2 = prime.dialog({
					title: 'Delete fields',
					body: 'Are you sure you want to delete these ' + selected.length + ' fields?',
					confirm: function () {
						$.ajax({
							url: '/Prime/Field/Delete/' + selected.join(':')
						})
						.done(function (response) {
							dialog.find('.modal-body').html(response);
							dialog.each(prime.elements);
							dialog.find('table').on('changed', changedFn);
							dialog2.modal('hide');
						});
					}
				});
			});
		});

		return false;
	};

	/**
	 * Load remote view to specific destination in DOM
	 *
	 * @return object
	 */
	app.view = function (url, destination) {

		// set last view
		app.last_view = [url, destination];

		// get absolute destination
		destination = destination || $('.panel-center');

		// attach url or ajax configuration object
		$.ajax(typeof url === 'string' ? { url: url } : url)

		// when done loading
		.done(function (response) {

			// attach response to destination and process its elements
			destination
			.html(response)
			.each(prime.elements);
		});

		//return false for direct onclick in anchors
		return false;
	};

	app.reload_view = function () {
		return app.view(app.last_view[0], app.last_view[1]);
	}

	/**
	 * TODO!
	 * Manage all ajax calls that change history URL and
	 * repeat them on back / forward buttons.
	 */
	app.history = function () {
		// yes sir!
		// console.log(History.getState());
	};

	/**
	 * We should move this elsewhere
	 */
	app.select_tree = function (el, url, nothing_selected) {

		// setup variables with objects and dom
		var group    = $(el).parents('.form-group'),
            selected = group.find('input[type=hidden]'),
		    visual   = group.find('.form-control'),
		    clear    = $('<button/>', { class: 'btn btn-default btn-sm pull-left', 'data-dismiss': 'modal', text: 'Clear' }),
		    select   = $('<button/>', { class: 'btn btn-primary btn-sm', 'data-dismiss': 'modal', text: 'Select' }),
		    cancel   = $('<button/>', { class: 'btn btn-default btn-sm', 'data-dismiss': 'modal', text: 'Cancel' });

		// setup ajax dialog with page tree
		var dialog = prime.dialog({
			remote: url,
			buttons: [clear, select, cancel]
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

			// attach click handler to tree nodes
			modal.find('.nav-tree a').on('click', function () {

				if ($(this).attr('unselectable') === 'on') return false;

				// find active link in tree and remove its state
				modal.find('.nav-tree li').removeClass('active');

				// add active state to this item
				$(this).parent('li').addClass('active');
				
				return false;
			});

			// open all parents of active node
			modal.find('.nav-tree [data-id=' + (selected.val()) + ']').each(function () {
				$(this).parents('.list-group-item').addClass('open');
				$(this).trigger('click');
			});

			// attach event handler to clear button
			clear.on('click', function () {

				// set selected page value to null
				selected.val('');

				// set visually no page selected
				visual.html('<span class="text-muted">' + nothing_selected + '</span>');
			});

			// attach click handler to select button
			select.on('click', function () {

				// set selected page id as value
				selected.val(modal.find('.active > a').data('id'));

				// visually set icon and node name
				visual.html('<i class="icon-file" style="font-size: 14px; color: #555;"></i> ' + modal.find('.active > a').text().trim());
			});
		});
	};

	/**
	 * Bind document events
	 *
	 * @return void
	 */
	app.events = function () {

		$(this)

		// tree node click
		// ---------------
		.on('click', '.nav-tree a:not([unselectable])', function () {
			$(this).closest('.nav-tree').find('li').removeClass('active');
			$(this).parent('li').addClass('active');
		})

		// tree caret click
		// ----------------
		.on('click', '.nav-tree b.caret', function () {

			// set json cookies flag
			$.cookie.json = true;

			// setup variables
			var identifier = 'tree-' + $(this).closest('.nav-tree').data('identifier'),
				openNodes  = $.cookie(identifier) || {},
				currentNode = $(this).parent('li'),
				key = $(this).next('a').data('id');

			// delete or set key in object
			if (currentNode.hasClass('open')) {
				delete openNodes[key];
			} else {
				openNodes[key] = true;
			}

			// reset cookie to object
			$.cookie(identifier, openNodes);

			// toggle the open node class
			$(this).parent('li').toggleClass('open');
		})

		// tree node context
		// -----------------
		.on('contextmenu', '.nav-tree a', function (e) {
			if ($(this).parents('.nav-tree:eq(0)').find('.context').length === 0) return;

			var source = $(this).parents('.nav-tree').find('.context').html(),
				template = Handlebars.compile(source),
				node = $(this).data(),
				context = template(node);
			$('.has-context').removeClass('open has-context').each(function () {
				this.context.remove();
				this.context = null;
			});

			this.context = $('<div/>')
			.css({ top: e.clientY, left: e.clientX, position: 'fixed', zIndex: 123 })
			.addClass('open tree-context')
			.append(context)
			.appendTo('body');

			$(this).addClass('open has-context');

			return false;
		})

		// document click
		// --------------
		.on('click', function () {

			// find any open context menus
			$('.has-context').removeClass('open has-context').each(function () {

				// remove and null the context element
				this.context.remove();
				this.context = null;
			});
		});

		// always indicate loading while ajaxing
		jQuery.ajaxSetup({
			beforeSend: function (xhr) {
				prime.loading(true);
				xhr.always(function() {
					prime.loading(false);
				});
			}
		});
	};

	/**
	 * Rename node in tree
	 *
	 * @param  object
	 * @return void
	 */
	app.rename = function (element, success, fail) {
		var node = $('.has-context'),
			text = node.children('span').text().trim(),
			icon = node.children('span').children('i'),
			input = $('<input/>', { type: 'text', value: text}).css({ display: 'inline', width: '75%', border: 'none', marginLeft: '4px', padding: 0 }).data('changed', false);

		success = success || function (response) {
			var active = $('.panel-left .active').children('a').data('id')
			$('.panel-left').html(response).find('[data-id='+active+']').addClass('active');
		};

		// add icon and input
		node.children('span').empty().append(icon).append(input);

		input
		.on('blur', function () {
			if ( ! $(this).data('changed') && fail !== undefined) fail(text);
			$(this).data('changed', false);
			node.children('span').empty().append(icon).append(' ' + text);
		})
		.on('keyup', function (e) {
			if (e.keyCode === 13) {
				var newText = $(this).val().trim();
				if (newText !== text) {
					if (element.href) {
						$.ajax({ url: element.href, type: 'POST', data: { name: newText }})
						.done(success);
					} else {
						success(newText);
					}
					text = newText;
				}
				$(this).data('changed', true).trigger('blur');
			}
			if (e.keyCode === 27) {
				$(this).trigger('blur');
			}
		})
		.trigger('focus');

		return false;
	};

	/**
	 * Generate Slug
	 *
	 * @param  string
	 * @return string
	 */
	app.slug = function (str) {

		// setup key value map of foreign characters
		var map = {'Ä':'Ae','ä':'ae','Ö':'Oe','ö':'oe','ü':'ue','Ü':'Ue','ß':'ss','À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'AA','Æ':'AE','Ç':'C','Č':'C','Ď':'D','È':'E','É':'E','Ě':'E','Ê':'E','Ë':'E','Ì':'I','Í':'I','Î':'I','Ï':'I','Ð':'D','Ł':'L','Ň':'N','Ñ':'N','Ò':'O','Ó':'O','Ô':'O','Õ':'O','Ö':'O','Ř':'R','Š':'S','Ť':'T','Ø':'OE','Ù':'U','Ú':'U','Ü':'U','Û':'U','Ý':'Y','Ž':'Z','Þ':'Th','ß':'sz','à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'aa','æ':'ae','ç':'c','č':'c','ď':'d','è':'e','é':'e','ê':'e','ě':'e','ë':'e','ì':'i','í':'i','î':'i','ï':'i','ð':'d','ł':'l','ñ':'n','ń':'n','ň':'n','ò':'o','ó':'o','ô':'o','õ':'o','ō':'o','ö':'o','ø':'oe','ř':'r','š':'s','ś':'s','ť':'t','ù':'u','ú':'u','û':'u','ū':'u','ü':'u','ý':'y','þ':'th','ÿ':'y','ż':'z','ž':'z','Œ':'OE','œ':'oe','&':'and','ı':'i','ş':'s','ğ':'g','Ş':'S','Ğ':'g','İ':'I','а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sh','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya','А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z','И':'I','Й':'J','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'C','Ч':'Ch','Ш':'Sh','Щ':'Sh','Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya'},
		    res = [];

		// lowercase and replaces spaces to dashes
		str = str.toLowerCase().replace(/ /g, '-');

		// loop through string characters
		for (var i = 0; i < str.length; i++) {

			// find character in map
			var repl = map[str[i]];

			// add to result array if found in map, else just old character
			res.push(repl === undefined ? str[i] : repl);
		}

		// join result array, remove non-alphadigit characters, and remove extra- and last dashes
		return res.join('').replace(/[^\w-]+/g,'').replace(/\-+/g, '-').replace(/-$/, '');
	}

	/**
	 * Features for elements
	 *
	 * @return void
	 */
	app.elementsExternal = [];
	app.elements = function () {

		var elements = this;

		// tables
		if ($(this).find('table').length > 0) {
			require(['misc/tables'], function (controller) {
				$(elements).find('table').each(controller);
			});
		}

		// select boxes
		$('select').select2({
			minimumResultsForSearch: 10
		});

		// generate slug
		$('input.generate-slug').each(function () {
			var slug = this;
			$(slug).parents('form').find('[name=name]').on('keyup', function () {
				$(slug).filter(':disabled').val(prime.slug($(this).val()));
			});
			$('#formAutoSlug').on('change', function () {
				$(slug).attr('disabled', $(this).is(':checked') ? 'disabled' : false)
				.parents('form').find('[name=name]').trigger('keyup');
			}).trigger('change');
		});

		// loop through external elements processors
		for (var i = 0; i < prime.elementsExternal.length; i++) {
			$(elements).each(prime.elementsExternal[i]);
		}
	};

	// configure requirejs
	// -------------------
	requirejs.config({
		baseUrl: '/media/Prime/js/prime',
		paths: {
			bootstrap: '../lib/bootstrap-3.0.0',
			jquery: '../lib/jquery-2.0.3.min',
			jqueryUI: '../lib/jquery-ui-1.10.3.min',
			cookie: '../lib/jquery.cookie',
			select2: '../lib/select2.min',
			handlebars: '../lib/handlebars-1.0.0',
			ace: '../lib/ace/ace',
			aceEmmet: '../lib/ace/ext-emmet',
			emmet: '../lib/emmet',
			history: '../lib/history',
			plupload: '../lib/plupload.full.min'
		},
		shim: {
			bootstrap: { deps: ['jquery'] },
			select2: { deps: ['jquery'] },
			aceEmmet: { deps: ['ace'] }
		}
	});

	// run when jquery has loaded
	// --------------------------
	define(['jquery', 'handlebars', 'select2', 'cookie', 'bootstrap', 'history'], function ($) {

		// list available controllers
		var Controllers = ['page', 'module/fieldset', 'user', 'explorer', 'file'];

		// define current controller
		var Controller  = ($('[data-controller]').data('controller') + '').substr(6);

		// loop through controllers
		for (var key in Controllers) {

			// check if he matches current
			if (Controller === Controllers[key]) {

				// get last key after slash
				var name = Controller.split('/')[Controller.split('/').length - 1];

				// use requirejs to fetch controller
				require([Controller], function (innerController) {

					// bind to prime
					app[name] = innerController;
				});
			}
		}

		// elements
		$('body').each(app.elements);

		// always use root path for cookies
		$.cookie.defaults.path = '/';

		// events
		$(document).each(app.events);

		// history adapter
		History.Adapter.bind(window, 'statechange', app.history);
	});

	// return app
	return app;

}());