define(['jquery'], function($) {

	var exports = {};

	exports.edit = function (region) {

		// setup buttons and scope form
		var save = $('<button/>', { class: 'btn btn-danger', text: 'Save' }),
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
				width: 720
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
					editor_data = modal.find('.ace_editor')[0].env.editor.getValue();
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
					page.unpublished();
				});
			});
		});
	};

	return exports;
});