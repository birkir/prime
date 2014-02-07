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
			.text(prime.strings.loading)
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
		var modal        = $('<div/>', { 'class': 'modal' + (options.animate === true ? ' fade' : '')    }).appendTo('body'),
			modalDialog  = $('<div/>', { 'class': 'modal-dialog'  }).appendTo(modal),
			modalContent = $('<div/>', { 'class': 'modal-content' }).appendTo(modalDialog),
			modalHeader  = $('<div/>', { 'class': 'modal-header'  }).appendTo(modalContent),
			modalTitle   = $('<h4/>',  { 'class': 'modal-title', text: options.title }),
			modalBody    = $('<div/>', { 'class': 'modal-body'    }).appendTo(modalContent),
			modalFooter  = $('<div/>', { 'class': 'modal-footer'  }).appendTo(modalContent),
			modalBtnYes  = $('<button/>', { 'class': 'btn btn-danger', 'data-dismiss': 'modal', 'html': 'Ok' }),
			modalBtnNo   = $('<button/>', { 'class': 'btn btn-default', 'data-dismiss': 'modal', 'html': 'Cancel' });

		// append title if set
		if (options.title && options.title !== undefined || options.closeButton === false) {
			modalTitle.appendTo(modalHeader);
		}

		// attach close button if wanted
		if (options.closeButton === true) {
			$('<button/>', { 'class': 'close', 'html': '&times;', 'data-dismiss': 'modal', 'aria-hidden': 'true' }).prependTo(modalHeader);
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
				modalBtnYes.on('click', options.confirm).trigger('focus');
			}

			// do callback if set
			if (callback !== undefined) {
				callback(modal);
			}

			// elements
			modal.each(prime.elements);

			// add draggable handler to header
			modal.find('.modal-content').draggable({
				handle: '.modal-header'
			});
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
	 * Pretty file bytes
	 */
	app.bytes = function (bytes) {
		var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
		var mod = 1024;
		var power = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(mod)) : 0;

		return Math.round(bytes / Math.pow(mod, power), 2) + ' ' + units[power];
	}

	/**
	 * Upload dialog for prime
	 */
	app.upload = function (url, btn, drop, callback) {

		if ('uploader' in prime) {
			prime.uploader.destroy();
		}

		prime.uploader = new plupload.Uploader({
			runtimes: 'html5,silverlight,html4',
			drop_element : drop,
			browse_button: btn,
			url: url,
			init: {
				PostInit: function (uploader, params) {
					if (uploader.features.dragdrop) {
						var target = drop;
						target.ondragover = function (event) {
							event.dataTransfer.dropEffect = 'copy';
						};
						target.ondragenter = function (event) {
							$(this).addClass('dragdrop');
						};
						target.ondragleave = function (event) {
							$(this).removeClass('dragdrop');
						};
						target.ondrop = function (event) {
							$(this).removeClass('dragdrop');
						}
					}
				},
				UploadProgress: function (uploader, files) {
					$(files).each(function (i, _file) {
						_file.tdpercent.text(_file.percent+'%');
					})
				},
				FileUploaded: function (uploader, _file, info) {
					_file.row.addClass('success');
					_file.tdremove.empty();
					callback(uploader, _file, info);
				},
				FilesAdded: function (uploader, files) {

					var process_file = function (i, _file) {
						var tr = $('<tr/>').data('file', _file).appendTo('.uploader tbody');
						_file.tdname    = $('<td/>', { text: _file.name }).appendTo(tr);
						_file.tdpercent = $('<td/>', { text: _file.percent + '%' }).appendTo(tr);
						_file.tdbytes   = $('<td/>', { text: prime.bytes(_file.size) }).appendTo(tr);
						_file.tdremove  = $('<td/>', { width: 30 })
						.append($('<a/>', { href: '#', html: '&times;', class: 'btn btn-default btn-xs' }).on('click', function () {
							prime.uploader.removeFile(_file);
							tr.remove();
							return false;
						})).appendTo(tr);
						_file.row       = tr;
					};

					if ('external' in files[0]) {
						$(files).each(process_file);
						return;
					}

					// dialog buttons
					var upload = $('<button/>', { class: 'btn btn-danger', html: 'Upload' }),
					    cancel = $('<button/>', { class: 'btn btn-default', html: 'Cancel', 'data-dismiss': 'modal' }),
					    browse = $('<button/>', { class: 'btn btn-primary btn-sm pull-left uploader-browse', html: 'Browse...' });

					var dialog = prime.dialog({
						title: 'Upload files',
						remote: url,
						buttons: [browse, cancel, upload]
					},

					function (modal) {

						var _uploader = new plupload.Uploader({
							runtimes: 'html5,silverlight,html4',
							drop_element : modal[0],
							browse_button: $('.uploader-browse')[0],
							url: url,
							init: {
								FilesAdded: function (uploader, files) {
									$(files).each(function (i, _file) {
										_file.external = true;
										prime.uploader.addFile(_file);
									});
								}
							}
						});

						_uploader.init();

						$(files).each(process_file);

						upload.on('click', function () {
							uploader.start();
						});
					});
				}
			}
		});

		prime.uploader.init();
	}

	/**
	 * Validation for forms with callback
	 */
	app.validate = function (form, callback, beforeSubmit) {

		// create validation object
		var validate = {};


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
						element.data('message', validate.format(prime.strings.validate[name], messageArgs));
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
					$('<span/>', { 'class': 'help-block validate', 'html': element.data('message') })
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
					if (data.status !== true)
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

			// callback before submit
			if (beforeSubmit) beforeSubmit(form);

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

					var m = 0;

					// check if errors were found in json data
					if (response.status === false) {

						// loop through errors
						for (var key in response.data) {

							// set error classes and message
							form.find('[name=' + key + ']').parents('.form-group').addClass('has-error').append(
								$('<span/>', { 'class': 'help-block validate', 'html': response.data[key] })
							);

							if (m === 0) {
								form.find('[name=' + key + ']').closest('.tab-pane').each(function () {
									$(this).parent().parent().find('[data-toggle=tab][href="#'+$(this).attr('id')+'"]').trigger('click');
								});
							}

							m++;
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
		var create  = $('<button/>', { 'class': 'btn btn-danger btn-sm create', 'html': prime.strings.addField }),
		    edit    = $('<button/>', { 'class': 'btn btn-default btn-sm disabled pull-left', 'html': prime.strings.edit }),
		    remove  = $('<button/>', { 'class': 'btn btn-default btn-sm disabled pull-left', 'html': prime.strings.delete }),
		    publish = $('<button/>', { 'class': 'btn btn-default btn-sm disabled pull-left', 'html': 'Publish' });

		// setup dialog
		var dialog = prime.dialog({
			title:  $(item).text(),
			remote: item.href,
			buttons: [edit, remove, publish, create]
		}, function (modal) {

			var resource_id = dialog.find('[data-resource-id]').data('resource-id'),
			    resource_type = dialog.find('[data-resource-type]').data('resource-type'),
			    selected = [],
			    changedFn = function () {
					var which = (this.selected.length === 0 ? 'addClass' : 'removeClass');
					edit[which]('disabled');
					remove[which]('disabled');
					publish[which]('disabled');
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
				var save = $('<button/>', { 'class': 'btn btn-danger', text: prime.strings.save }),
					cancel = $('<button/>', { 'class': 'btn btn-default', text: prime.strings.cancel, 'data-dismiss': 'modal' }),
					sel = $(this).data('id') || selected[0],
					edit = ! $(this).hasClass('create');

				// setup dialog
				var dialog2 = prime.dialog({
					title: edit ? prime.strings.editField : prime.strings.addField,
					remote: edit ? '/Prime/Field/Edit/' + sel : '/Prime/Field/Create/' + resource_type + ':' + resource_id,
					buttons: [save, cancel]
				}, function (modal) {

					modal.find('.field-options').find('input, textarea, select').each(function () {
						$(this).attr('name', 'option-'+$(this).attr('name'));
					});

					modal.find('select[name=field]').on('change', function () {
						var selected = $(this).find('option:selected').text();
						modal.find('.field-options').addClass('hide').find('input, textarea, select').attr('disabled', 'disabled');
						modal.find('.field-options#f' + selected).removeClass('hide').find('input, textarea, select').removeAttr('disabled');
					})
					.trigger('change');

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

					prime.validate(dialog2.find('form'), function (response) {
						dialog.find('.modal-body').html(response.data);
						dialog.each(prime.elements);
						dialog.find('table').on('changed', changedFn)
						.find('tbody tr').on('dblclick', fieldsetEvent);
						dialog2.modal('hide');
					});

					// attach save button event
					save.on('click', function () {
						dialog2.find('form').trigger('submit');
					});
				});

				return false;
			};

			// table changed
			dialog.find('table').on('changed', changedFn);

			// attach create button event
			create.on('click', fieldsetEvent);

			// attach edit button event
			edit.on('click', fieldsetEvent);

			// attach publish button event
			publish.on('click', function () {
				$.ajax({
					url: '/Prime/Field/Publish/' + selected.join(':')
				})
				.done(function (response) {
					// reload view
					dialog.find('.modal-body').html(response);
					dialog.each(prime.elements);
					dialog.find('table').on('changed', changedFn)
				});

				return false;
			});

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
							dialog.find('table').on('changed', changedFn)
							.find('tbody tr').on('dblclick', fieldsetEvent);
							dialog2.modal('hide');
						});
					}
				});
			});
		});

		return false;
	};

	/**
	 * CRC32 used for calculating integer for filename
	 *
	 * @param string
	 * @return integer
	 */
	app.crc32 = function (str) {

	    var crc = 0 ^ (-1),
	        table = [],
	        c;

		for (var n = 0; n < 256; n++) {
			c = n;
			for (var k = 0; k < 8; k++) {
				c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
			}
			table[n] = c;
		}

		for (var i = 0; i < str.length; i++ ) {
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
		}

		return (crc ^ (-1)) >>> 0;
	};

	/**
	 * Calculate password strength score
	 *
	 * @param string String to calculate
	 * @param object Element to attach visual appearence
	 * @return void
	 */
	app.passwordStrength = function (str, element) {

		// setup variables
		var score = 0,
		map = [
			{ score: 1, regex: /[a-z]/ },
			{ score: 3, regex: /[A-Z]/ },
			{ score: 3, regex: /\d+/ },
			{ score: 5, regex: /(.*[0-9].*[0-9].*[0-9])/ },
			{ score: 3, regex: /.[!,@,#,$,%,\^,&,*,?,_,~]/ },
			{ score: 5, regex: /(.*[!,@,#,$,%,\^,&,*,?,_,~].*[!,@,#,$,%,\^,&,*,?,_,~])/ },
			{ score: 2, regex: /([a-z].*[A-Z])|([A-Z].*[a-z])/ }
		];

		// length check
		score += Math.min(Math.pow(str.length, 1.25), 28);

		// loop through regexes and add to score
		for (var i = 0; i < map.length; i++) {
			if (str.match(map[i].regex)) {
				score += map[i].score;
			}
		}

		// get a percentage of one hundred
		score = (score * 2) / 100;

		// when some password is entered
		if (str.length > 0) {

			// create progress bar if not exist
			if ( ! element.progressBar) {
				element.progressBar = $('<div/>', { 'class': 'progress password-strength' }).append($('<div/>', { 'class': 'progress-bar' }));
				$(element).parent().prepend(element.progressBar);
			}

			// get bar
			var bar = element.progressBar.find('.progress-bar');

			// set bar width
			bar.css({ width: score * 100 + '%' });

			// set color
			if (score < 0.26) bar.attr('class', 'progress-bar progress-bar-danger');
			else if (score < 0.50) bar.attr('class', 'progress-bar progress-bar-warning');
			else bar.attr('class', 'progress-bar progress-bar-success');
		}

		// else remove progress bar
		else if (element.progressBar) {
			element.progressBar.remove();
			element.progressBar = null;
		}
	};

	/**
	 * Show profile dialog
	 *
	 * @return void
	 */
	app.profile = function (element) {

		// create buttons
		var save = $('<button/>', { 'class': 'btn btn-danger', text: prime.strings.save }),
			cancel = $('<button/>', { 'class': 'btn btn-default', text: prime.strings.cancel, 'data-dismiss': 'modal' });

		// create dialog
		var dialog = prime.dialog({
			title: $(element).text(),
			remote: element.href,
			buttons: [save, cancel]
		},

		// on modal ready
		function (modal) {

			// set form
			form = modal.find('form');

			// password onkeyup event
			form.find('input[name=password]').on('keyup', function () {

				// setup variables
				var confirm = form.find('input[name=password_confirm]').parent('.collapse'),
				    value = $(this).val();

				// show or hide passwordconfirm
				confirm[value.length > 0 ? 'addClass' : 'removeClass']('in');

				// set password strength
				prime.passwordStrength(value, this);
			});

			// validate and handle form submit
			prime.validate(form, function (response) {

				// hide dialog
				dialog.modal('hide');

				// reload page or not?
				if (response.data === true) {
					window.location.reload();
				}
			});

			save.on('click', function () {
				form.trigger('submit');
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

		if (destination.hasClass('panel-center')) {
			app.changingView = true;
			History.pushState({
				type: 'view'
			}, window.document.title, url);
		}

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

	app.reload_view = function (fallback) {
		if (('last_view' in prime) && prime.last_view.length === 0) {
			return prime.view(prime.last_view[0], prime.last_view[1]);
		}
		return app.view(fallback || window.location.pathname);
	};

	/**
	 * TODO!
	 * Manage all ajax calls that change history URL and
	 * repeat them on back / forward buttons.
	 */
	app.history = function () {
		// yes sir!
		if ( ! app.changingView) {
			var state = History.getState();
			if (state.data.type !== 'page') {
				prime.view(state.url);
			} else if(state.data.type === 'page') {
				prime.loading(true);
				$('.prime-live-iframe').attr('src', state.data.src);
			}
		}

		app.changingView = false;
	};

	/**
	 * We should move this elsewhere
	 */
	app.select_tree = function (el, url, nothing_selected) {

		// setup variables with objects and dom
		var group    = $(el).parents('.form-group'),
		    selected = group.find('input[type=hidden]'),
		    visual   = group.find('.form-control'),
		    clear    = $('<button/>', { 'class': 'btn btn-default btn-sm pull-left', 'data-dismiss': 'modal', text: prime.strings.clear }),
		    select   = $('<button/>', { 'class': 'btn btn-danger btn-sm', 'data-dismiss': 'modal', text: prime.strings.select }),
		    cancel   = $('<button/>', { 'class': 'btn btn-default btn-sm', 'data-dismiss': 'modal', text: prime.strings.cancel }),
		    multiple = !! visual.data('select2');

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
				if ( ! multiple) {
					modal.find('.nav-tree li').removeClass('active');
				}

				// add active state to this item
				$(this).parent('li')[multiple ? 'toggleClass' : 'addClass']('active');
				
				return false;
			});

			// open all parents of active node
			$(multiple ? visual.select2('data') : [{id: selected.val(), text: ''}]).each(function (i, item) {

				// open the nodes
				modal.find('.nav-tree [data-id=' + item.id + ']').each(function () {
					$(this).parents('.list-group-item').addClass('open');
					$(this).trigger('click');
				});
			});

			// attach event handler to clear button
			clear.on('click', function () {

				if (multiple) {

					// set nothing to select2
					visual.select2('data', []);

				} else {

					// set selected page value to null
					selected.val('');

					// set visually no page selected
					visual.html('<span class="text-muted">' + nothing_selected + '</span>');
				}
			});

			// attach click handler to select button
			select.on('click', function () {

				if (multiple) {

					// initialize array of selected values
					var _sel = [];

					modal.find('.active > a').each(function () {

						// append select object to array
						_sel.push({ id: $(this).data('id'), text: $(this).text() })
					});

					// set selected data to select2
					visual.select2('data', _sel);

				} else {

					// set selected page id as value
					selected.val(modal.find('.active > a').data('id'));

					// visually set icon and node name
					visual.html('<i class="icon-file" style="font-size: 14px; color: #555;"></i> ' + modal.find('.active > a').text().trim());
				}
			});
		});
	};

	app.select_list = function (el, url, nothing_selected) {

		// setup variables with objects and dom
		var group    = $(el).parents('.form-group'),
            selected = group.find('input[type=hidden]'),
		    visual   = group.find('.form-control'),
		    clear    = $('<button/>', { 'class': 'btn btn-default btn-sm pull-left', 'data-dismiss': 'modal', text: prime.strings.clear }),
		    filter   = $('<input/>', { 'class': 'form-control input-sm pull-left tablesorter-filter-input', placeholder: prime.strings.filter }).css({ marginLeft: 10, width: 100 }),
		    reset    = $('<button/>', { 'class': 'btn btn-default btn-sm pull-left tablesorter-reset-button', text: prime.strings.reset }),
		    select   = $('<button/>', { 'class': 'btn btn-danger btn-sm', 'data-dismiss': 'modal', text: prime.strings.select }),
		    cancel   = $('<button/>', { 'class': 'btn btn-default btn-sm', 'data-dismiss': 'modal', text: prime.strings.cancel });

		// setup ajax dialog with page tree
		var dialog = prime.dialog({
			remote: url,
			buttons: [clear, filter, reset, select, cancel]
		},

		// process modal once loaded
		function (modal) {

			modal.find('table')

			// set modal dialog width and padding
			modal.find('.modal-dialog').css({
				width: 640,
				paddingTop: 90
			});

			// remove modal header
			modal.find('.modal-header').remove();

			modal.find('tbody tr[data-id=' + (selected.val()) + ']').each(function () {
				$(this).addClass('warning');
			});

			// change item
			modal.find('tbody tr').on('click', function () {
				modal.find('tbody tr.warning').removeClass('warning');
				$(this).addClass('warning');
			})
			.on('dblclick', function () {
				select.trigger('click');
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

				var tr = modal.find('tbody tr.warning'),
				    name = tr.find('td').eq(0).text().trim();

				// set selected page id as value
				selected.val(tr.data('id'));

				// visually set icon and node name
				visual.html('<i class="icon-file" style="font-size: 14px; color: #555;"></i> (id: ' + tr.data('id') + ') ' + name);
			});

			reset.on('click', function () {
				filter.val('');
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
		.on('click', '.nav-tree a:not([unselectable])', function (e) {
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
			$('.tree-context.open').remove();

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
			var active = $('.panel-left .active').children('a').data('id');
			$('.panel-left').html(response).find('[data-id='+active+']').parent().addClass('active');
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
				var newText = $(this).val().trim(),
				    oldText = text;
				if (newText !== text) {
					if (element.href) {
						$.ajax({ url: element.href, type: 'POST', data: { name: newText }})
						.done(function (response) {
							success(response, oldText, newText, node);
						});
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
		.on('click', function (e) {
			e.preventDefault();
			return false;
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
			bootstrap: '../lib/bootstrap-3.1.0',
			jquery: '../lib/jquery-2.0.3.min',
			jqueryUI: '../lib/jquery-ui-1.10.3.min',
			cookie: '../lib/jquery.cookie',
			select2: '../lib/select2.min',
			handlebars: '../lib/handlebars-1.0.0',
			ace: '../lib/ace/ace',
			aceEmmet: '../lib/ace/ext-emmet',
			emmet: '../lib/emmet',
			history: '../lib/history',
			plupload: '../lib/plupload.full.min',
			autoNumeric: '../lib/autoNumeric-1.9.18',
			translation: '/Prime/Account/Translation?noext'
		},
		shim: {
			bootstrap: { deps: ['jquery'] },
			jqueryUI:  { deps: ['jquery'] },
			select2:   { deps: ['jquery'] },
			aceEmmet:  { deps: ['ace'] }
		}
	});

	// run when jquery has loaded
	// --------------------------
	define(['jquery', 'translation', 'jqueryUI', 'handlebars', 'select2', 'cookie', 'bootstrap', 'history', 'autoNumeric'], function ($, translation) {

		// list available controllers
		var Controllers = ['page', 'module/fieldset', 'module/store', 'user', 'explorer', 'file', 'url'];

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

		// translation strings
		prime.strings = translation;
	});

	// return app
	return app;

}());