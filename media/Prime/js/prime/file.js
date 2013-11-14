define(['jquery', 'plupload', 'jqueryUI'], function($, _ace, _emmet, Emmet) {

	var file = {};

	// Create folder
	// -------------
	file.create = function (item) {

		// get node
		var node = $('.has-context').parent(),
		    id = node.children('a').data('id');

		var li = $('<li/>', { class: 'list-group-item' }),
		    b  = $('<b/>', { class: 'caret', onselectstart: 'return false;' }).appendTo(li),
		    a  = $('<a/>', { href: '#', class: 'has-context' }).appendTo(li),
		    span = $('<span/>', { html: '<i class="fa fa-folder"></i> ' + 'Folder name...' }).appendTo(a);

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
			var parent_id = node.children('a').data('id');
			parent_id = parent_id || '';
			$.ajax({
				url: '/Prime/File/Folder_Create/' + parent_id,
				type: 'POST',
				data: {
					name: text
				}
			})
			.done(function (response) {
				$('.panel-left').html(response).find('[data-id=' + id + ']').parent().addClass('open');
			});
		}, function () {
			li.remove();
			if (node.children('ul').children('li').length === 0) {
				node.removeClass('has-children open').children('ul').remove();
			}
		});

		return false;
	};

	file.bytes = function (bytes) {
		var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
		var mod = 1024;
		var power = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(mod)) : 0;

		return Math.round(bytes / Math.pow(mod, power), 2) + ' ' + units[power];
	}

	file.lazyload = function ()
	{
		var scrollable = $('.fullscreen-ui > .scrollable'),
			items = scrollable.find('.grid-group-item img'),
			top;

		// detach events
		scrollable.off('scroll resize');

		// attach scroll event
		scrollable.on('scroll', function () {
			if (scrollable.is(':hidden')) return;
			items.each(function () {
				var img = $(this);
				if (img.is(':hidden') || ! img.data('src')) return;
				if ((scrollable.scrollTop() + top) >= this.top) {
					img.attr('src', img.data('src'));
					img.data('src', false);
				}
			});
		});

		// attach resize event
		$(window).on('resize', function () {

			if (scrollable.is(':hidden')) return;

			var sw = scrollable.width(),
			    c = sw > 1170 ? 6 : (sw > 900 ? 5 : 4),
			    w = Math.floor((sw - 10) / c),
			    h = Math.floor(240 * (w / 243));

			items.each(function () {
				$(this).parents('.grid-group-item').css({ width: w, height: h }).children('span').children('span').css({ width: w })
				$(this).css({ maxWidth: w - 20, maxHeight: h - 20 });
				this.top = $(this).offset().top;
			});
			top = scrollable.height() + 200;

			scrollable.trigger('scroll');
		})
		.trigger('resize');
	}

	file.list = function () {

		var ckbrowser = $('#ckbrowser').length === 1,
		    ckfunc = $('#ckbrowser').data('func');

		if (ckbrowser) {
			var closeBtn = $('<button/>', { text: 'Select file', class: 'btn btn-primary' }).on('click', function () {
				window.close();
			});
			$('.table-bind-template').after(closeBtn).remove();
		}
		else
		{
			$.cookie.json = false;
			$.cookie('prime-files-id', $('.file-list').data('id'));
			$.cookie.json = true;
		}

		// proxy thumbnails click to thumbnail checkbox toggle
		$('.grid-group-item').on('click', function (e) {

			if (e.target.nodeName === 'INPUT'&& e.target.type === 'checkbox')
				return;

			$(this).find('input[type=checkbox]').each(function () {
				this.checked = ! this.checked;

			}).trigger('change');

			return false;
		});

		// proxy thumbnail checkbox to table checkbox
		$('.grid-group-item-selection input[type=checkbox]').on('change', function () {
			var id = $(this).parent().parent().parent().data('id');
			$('.table-selection').find('tr[data-id='+id+'] input[type=checkbox]').each(function () {
				this.checked = ! this.checked;
				$(this).trigger('change');
			});
		});

		// make thumbnails active too
		$('.table-selection tr input[type=checkbox]').on('change', function () {

			if (ckbrowser && this.checked === true) {
				window.opener.CKEDITOR.tools.callFunction(ckfunc, $(this).parent().parent().data('url'));

				$('.table-selection tr input[type=checkbox]:checked').not(this).each(function () {
					this.checked = false;
					$(this).trigger('change');
				});
			}

			$('.grid-group-item[data-id='+$(this).parent().parent().data('id')+']')[this.checked ? 'addClass' : 'removeClass']('selected');
		});

		$('.grid-group-item, .table tr').on('dblclick', function () {
			if (ckbrowser) { window.close(); }
			else { 
				// window.open(, '_blank');
				prime.dialog({
					backdrop: true,
					body: $('<img/>', { src: '/Prime/File/Transform/800x800/' + $(this).data('id'), style: 'max-width:100%;max-height:800px;' }).on('load', function () {
						$(this).closest('.modal-dialog').css({ width: Math.min(800, $(this).width()) });
					})
				}, function (modal) {
					modal.find('.modal-header').css({ border: 'none', position: 'absolute', zIndex: 5, right: 0 });
					modal.find('.modal-body').css({ margin: -20 });
					modal.find('.close').css({ color: '#fff', opacity: 0.9, 'text-shadow': '0px 2px rgba(0,0,0,0.33)' });
					modal.on('click', function () {
						modal.modal('hide');
					});
				});
			}
		})

		$('#ckbrowser').each(function () {
			$('.grid-group-item[data-id="'+this._file+'"]').each(function () {
				$(this).trigger('click');
			});
		});
			
		// initialize uploader dragndrop
		prime.file.upload($(this).data('id'));

		// lazy load images
		file.lazyload();

		// set active in tree
		$('.panel-left').find('.active').removeClass('active');
		$('.panel-left [data-id='+$(this).data('id')+']').parent().addClass('active').parents('.has-children').addClass('open');

		// How about jquery ui selectable
		$('.grid-group, .table-selection').selectable({
			delay: 50,
			selected: function (event, ui) {
				$(ui.selected).filter('.grid-group-item-selection, tr').find('input').each(function () {
					this.checked = true;
					$(this).trigger('change');
				});
			},
			unselected: function (event, ui) {
				$(ui.selected).filter('.grid-group-item-selection, tr').find('input').each(function () {
					this.checked = false;
					$(this).trigger('change');
				});
			}
		});

	};

	file.change_view = function(el)
	{
		var element = $(el),
		    mode = (element.attr('href') + '').replace(/#/, '');

		if (element.hasClass('active')) return;

		element.parent().children().removeClass('active');
		element.addClass('active')

		$.cookie.json = false;
		$.cookie('prime-viewmode', mode);

		$('.grid-group')[mode === 'list' ? 'addClass' : 'removeClass']('hidden')
		$('.table-selection')[mode === 'thumbnails' ? 'addClass' : 'removeClass']('hidden');

		file.lazyload();

		return false;
	}


	file.delete_folder = function (item) {

		// create confirm dialog
		var dialog = prime.dialog({
			backdrop: true,
			title: 'Delete folder',
			body: $(item).data('message'),
			confirm: function () {
				$.ajax({
					url: item.href
				})
				.done(function (response) {
					$('.panel-left').html(response);
				});
			}
		});

		return false;
	};

	/**
	 * Remove files
	 */
	file.delete = function (element) {

		var button = $(element);

		if (button.hasClass('disabled')) return;

		var dialog = prime.dialog({
			title: 'Delete files',
			body: 'Are you sure you want to delete these files?',
			confirm: function () {
				$.ajax({
					url: button.attr('href')
				})
				.done(function (response) {
					prime.reload_view();
					dialog.modal('hide');
				});
			}
		});

		return false;
	};

	// initialize uploader
	file.upload = function (folder) {
		folder = folder || 0;
		if ('uploader' in file) {
			file.uploader.destroy();
		}
		file.uploader = new plupload.Uploader({
			runtimes: 'html5,silverlight,html4',
	        drop_element : $('.panel-center')[0],
			browse_button: document.getElementById('upload_btn'),
			url: '/Prime/File/Upload/' + folder,
			init: {
				PostInit: function (uploader, params) {
					if (uploader.features.dragdrop) {
						var target = $('.panel-center')[0];
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

					if (prime.file.uploader.total.queued === 0) {
						prime.reload_view();
					}
				},
				FilesAdded: function (uploader, files) {

					var process_file = function (i, _file) {
						var tr = $('<tr/>').data('file', _file).appendTo('.uploader tbody');
						_file.tdname    = $('<td/>', { text: _file.name }).appendTo(tr);
						_file.tdpercent = $('<td/>', { text: _file.percent + '%' }).appendTo(tr);
						_file.tdbytes   = $('<td/>', { text: file.bytes(_file.size) }).appendTo(tr);
						_file.tdremove  = $('<td/>', { width: 30 })
						.append($('<a/>', { href: '#', html: '&times;', class: 'btn btn-default btn-xs' }).on('click', function () {
							prime.file.uploader.removeFile(_file);
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
						remote: '/Prime/File/Upload',
						buttons: [browse, cancel, upload]
					},

					function (modal) {

						var _uploader = new plupload.Uploader({
							runtimes: 'html5,silverlight,html4',
					        drop_element : modal[0],
							browse_button: $('.uploader-browse')[0],
							url: '/Prime/File/Upload',
					        init: {
					        	FilesAdded: function (uploader, files) {
					        		$(files).each(function (i, _file) {
					        			_file.external = true;
					        			file.uploader.addFile(_file);
					        		});
					        	}
					        }
					    });
					    _uploader.init();

						// setup dialog
						$(files).each(process_file);

						upload.on('click', function () {
							uploader.start();
						});

						cancel.on('click', function () {

						});
					});
				}
			}
		});

		file.uploader.init();
	};

	/**
	 * Extend elements list
	 */
	prime.elementsExternal.push(function () {
		$(this).find('.file-list').each(file.list);
	});

	$('#ckbrowser').each(function () {
		var imgUrl = window.opener.CKEDITOR.dialog.getCurrent().getValueOf('info', 'txtUrl').split('/');

		this._file  = imgUrl[imgUrl.length - 1];

		if (parseInt(this._file, 0) > 0) {
			prime.view('/Prime/File/List?file=' + this._file);
		}
	});

	if ($('#ckbrowser').length === 0 && parseInt($.cookie('prime-files-id'), 0) > 0) {
		prime.view('/Prime/File/List/' + $.cookie('prime-files-id'));
	}

	return file;
});