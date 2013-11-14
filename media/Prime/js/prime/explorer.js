define(['jquery', 'ace', 'emmet', 'aceEmmet'], function($, _ace, _emmet, Emmet) {

	var explorer = {};

	/**
	 * Setup editor
	 *
	 * @return ace
	 */
	explorer.editor = function () {

		// scope element
		var element = this,
		    editor = {};

		// ace options
		editor.options = $.extend({}, {
			enableEmmet: true,
			softTabs: false,
			showInvisibles: false,
			showIndentGuides: true
		}, $.cookie('ace-options') || {});

		// editor available options
		editor.optionCallbacks = {
			enableEmmet: {
				set: function (flag) { element.ace.setOption('enableEmmet', flag); },
				get: function () { return element.ace.getOption('enableEmmet'); }
			},
			softTabs: {
				set: function (flag) { element.ace.getSession().setUseSoftTabs(flag); },
				get: function () { return element.ace.getSession().getUseSoftTabs(); }
			},
			showInvisibles: {
				set: function (flag) { element.ace.setShowInvisibles(flag); },
				get: function () { return element.ace.getShowInvisibles(); }
			},
			showIndentGuides: {
				set: function (flag) { element.ace.setDisplayIndentGuides(flag); },
				get: function () { return element.ace.getDisplayIndentGuides(); }
			}
		};

		// handle editor saves
		editor.save = function () {

			// get button
			var button = $('.ace-save');

			// set button old text, classes and new text
			button.data('old', button.text())
			.removeClass('btn-danger').addClass('btn-warning')
			.html('Saving... <i class="icon-cog icon-spin" style="color: #fff;"></i>');

			// do the ajax call
			$.ajax({
				url: '/Prime/Explorer/Save/' + $(element).data('id'),
				type: 'PUT',
				contentType: 'plain/text',
				data: element.ace.getValue(),
				dataType: 'json'
			})

			// visual feedback
			.done(function (response) {
				if (response.status === true) {
					button.removeClass('btn-warning').addClass('btn-success').html('Saved');
					ace_editor.saving = setTimeout(function () {
						button.removeClass('btn-success').addClass('btn-danger').html(button.data('old'));
					})
				} else {
					button.removeClass('btn-warning').addClass('btn-danger').html(button.data('old'));
					prime.dialog({
						alert: true,
						title: 'Error',
						body: 'There was an error while saving this file.<br><br><strong>Reason</strong><br>' + response.message
					});
				}
			});
		};

		// attach click event to save button
		$('.ace-save').on('click', editor.save);

		// create editor
		element.ace = ace.edit(element);

		// set emmet
		var Emmet = ace.require('ace/ext/emmet');
		Emmet.setCore(window.emmet);

		// attach editor commands
		element.ace.commands.addCommand({
			name: 'SaveChanges',
			bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
			exec: editor.save,
			readOnly: true
		});

		// attach change event to mode
		$('.ace-mode').on('change', function () {
			element.ace.getSession().setMode('ace/mode/' + $('.ace-mode option:selected').val());
		})
		.trigger('change');

		// attach change event to theme
		$('.ace-theme').on('change', function () {
			$.cookie.json = false;
			$.cookie('ace-theme', $('.ace-theme option:selected').val(), { expires: 365 });
			element.ace.setTheme('ace/theme/' + $('.ace-theme option:selected').val());
		});

		// set ace theme
		element.ace.setTheme('ace/theme/' + $('.ace-theme option:selected').val());

		// process ace options
		$('.ace-options > li > a').each(function () {

			// get name and state
			var name = ($(this).attr('href')).replace(/#/, '');

			// toggle enabled class
			$(this)[editor.options[name] ? 'addClass' : 'removeClass']('enabled');

			// enable or disable
			editor.optionCallbacks[name]['set'](editor.options[name]);
		})

		// attach click event handler to ace options
		.on('click', function () {

			// set variables
			var name = ($(this).attr('href')).replace(/#/, ''),
			  option = editor.optionCallbacks[name],
			    flag = option.get();

			// poll ace options
			editor.options = $.cookie('ace-options') || {};

			// set option in cookie
			editor.options[name] = ! flag;

			// toggle the option
			option.set( ! flag);

			// toggle enabled class
			$(this).toggleClass('enabled');

			// set ace options
			$.cookie.json = true;
			$.cookie('ace-options', editor.options, { expires: 365 });

			return false;
		});

		$('.panel-left').find('.active').removeClass('active');
		$('.panel-left [data-id='+$('.fullscreen-ui').data('id')+']').parent().addClass('active').parents('.has-children').addClass('open');

		// scope editor
		element.editor = editor;
	};

	explorer.create = function (element, type) {

		// get node
		var node = $('.has-context').parent(),
		    id = node.children('a').data('id'),
		    icon = type === 'folder' ? 'icon-folder-close' : 'icon-file';

		var li = $('<li/>', { class: 'list-group-item' }),
		    b  = $('<b/>', { class: 'caret', onselectstart: 'return false;' }).appendTo(li),
		    a  = $('<a/>', { href: '#', class: 'has-context' }).appendTo(li),
		    span = $('<span/>', { html: '<i class="'+icon+'"></i> ' + (type === 'folder' ? 'Folder' : 'File') + ' name...' }).appendTo(a);

		// add ul to node if needed
		if ( ! node.hasClass('has-children')) {
			$('<ul/>', { class: 'list-group' }).appendTo(node);
			node.addClass('has-children');
		}

		// open node
		node.addClass('open');

		// append list item to ul
		node.children('ul').append(li);
		node.children('a').removeClass('has-context');
		$('.open.tree-context').remove();

		// fake context menu
		a[0].context = $();

		prime.rename({ href: null }, function (text) {
			$.ajax({
				url: element.href,
				dataType: 'json',
				type: 'POST',
				data: {
					parent: node.children('a').data('path') || null,
					name: text,
					type: type
				}
			})
			.done(function (response) {
				if (response.status === true) {
					$('.panel-left').html(response.data).find('[data-id=' + id + ']').parent().addClass('open');
				} else {
					li.remove();
					if (node.children('ul').children('li').length === 0) {
						node.removeClass('has-children open').children('ul').remove();
					}
					prime.dialog({
						alert: true,
						title: 'Error',
						body: response.message
					});
				}
			});
		}, function () {
			li.remove();
			if (node.children('ul').children('li').length === 0) {
				node.removeClass('has-children open').children('ul').remove();
			}
		});

		return false;
	};

	explorer.delete = function (item) {

		// create confirm dialog
		var dialog = prime.dialog({
			backdrop: true,
			title: $(item).data('title'),
			body: $(item).data('message'),
			confirm: function () {
				$.ajax({
					url: item.href,
					dataType: 'json'
				})
				.done(function (response) {
					if (response.status === true) {
						$('.panel-left').html(response.data);
					} else {
						prime.dialog({
							alert: true,
							title: 'Error',
							body: response.message
						});
					}
				});
			}
		});

		return false;
	}

	/**
	 * Extend elements list
	 */
	prime.elementsExternal.push(function () {
		$(this).find('.ace-editor').each(explorer.editor);
	});

	// run editors
	$('.ace-editor').each(explorer.editor);

	return explorer;

});