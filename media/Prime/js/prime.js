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
	 * Handle all custom elements on page controller
	 *
	 * @return object
	 */
	app.page = function () {
		return require(['page/controller', 'page/modules', 'page/frame'], function (controller, modules, frame) {

			// Scope our page
			app.page = controller();

			// Run module lists draggable elements
			$('.prime-module-list').each(modules);

			// Run live frame scripts
			$('.prime-live-iframe').each(frame);
		});
	};

	/**
	 * Handle all custom elements on fieldset controller
	 *
	 * @return object
	 */
	app.fieldset = function () {
		require(['module/fieldset'], function (controller) {
			app.fieldset = controller;
		});
	};

	/**
	 * Load remote view to specific destination in DOM
	 *
	 * @return object
	 */
	app.view = function (url, destination) {

		destination = destination || $('.panel-center');

		$.ajax(typeof url === 'string' ? { url: url } : url)

		.done(function (response) {
			destination
			.html(response)
			.each(prime.elements);

			var obj = {};
			obj.controller = $('[data-controller]').data('controller');
			obj.url = url;
			window.history.pushState(obj, null, url);
		});

		return false;
	};

	/**
	 * Bind document events
	 *
	 * @return void
	 */
	app.events = function () {
		$(this)
		.on('click', '.nav-tree a:not([unselectable])', function () {
			$(this).closest('.nav-tree').find('li').removeClass('active');
			$(this).parent('li').addClass('active');
		})
		.on('click', '.nav-tree b.caret', function () {
			$.cookie.json = true;
			var ident = 'tree-'+$(this).closest('.nav-tree').data('identifier'),
				curr = $.cookie(ident) || {};
			if ($(this).parent('li').hasClass('open')) {
				delete curr[$(this).next('a').attr('href')];
			} else {
				curr[$(this).next('a').attr('href')] = true;
			}
			$.cookie(ident, curr);
			$(this).parent('li').toggleClass('open');
		})
		.on('contextmenu', '.nav-tree a', function (e) {
			var source = $(this).closest('.nav-tree').find('.context').html(),
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
		.on('click', function () {
			$('.has-context').removeClass('open has-context').each(function () {
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
	app.rename = function (element) {
		var node = $('.has-context'),
			text = node.children('span').text().trim(),
			icon = node.children('span').children('i'),
			input = $('<input/>', { type: 'text', value: text}).css({ display: 'inline', width: '75%', border: 'none', marginLeft: '4px', padding: 0 });

		// add icon and input
		node.children('span').empty().append(icon).append(input);

		input.on('blur', function () {
			node.children('span').empty().append(icon).append(' ' + text);
		})
		.on('keyup', function (e) {
			if (e.keyCode === 13) {
				var newText = $(this).val().trim();
				if (newText !== text) {
					$.ajax({ url: element.href, type: 'POST', data: { name: newText }});
					text = newText;
				}
				$(this).trigger('blur');
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
		var nonAscii = 'ãàáäâẽèéëêìíïîýÿõòóöôùúüûñçþð·/_,:;',
			   ascii = 'aaaaaeeeeeiiiiyyooooouuuunctd------';
		str = str.toLowerCase().replace(/ /g, '-');
		for (var i = 0; i < nonAscii.length; i++)
			str = str.replace(new RegExp(nonAscii.charAt(i), 'g'), ascii.charAt(i));
		return str.replace(/[^\w-]+/g,'').replace(/\-+/g, '-').replace(/-$/, '');
	}

	/**
	 * Features for elements
	 *
	 * @return void
	 */
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
		})
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
			handlebars: '../lib/handlebars-1.0.0'
		},
		shim: {
			bootstrap: { deps: ['jquery'] },
			select2: { deps: ['jquery'] }
		}
	});

	// run when jquery has loaded
	// --------------------------
	define(['jquery', 'handlebars', 'select2', 'cookie', 'bootstrap'], function ($) {

		// page controller
		$('[data-controller=page]').each(app.page);

		// fieldset controller
		$('[data-controller=fieldset]').each(app.fieldset);

		// elements
		$('body').each(app.elements);

		// events
		$(document).each(app.events);
	});

	// return app
	return app;

}());