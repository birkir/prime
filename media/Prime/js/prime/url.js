define(['jquery'], function($) {

	var url = {};

	/**
	 * Create new URL Mapping item
	 */
	url.create = url.edit = function (element) {

		if (element.tagName === 'TR') {
			var id = $(element).data('id');
			element = document.getElementById('editBtn');
			element.href = '/Prime/Url/Edit/' + id;
		}

		// create buttons
		var save   = $('<button/>', { 'class': 'btn btn-danger',  'text': $(element).data('save') }),
			cancel = $('<button/>', { 'class': 'btn btn-default', 'text': $(element).data('cancel'), 'data-dismiss': 'modal' }),
			form;

		// create dialog
		var dialog = prime.dialog({
			title: $(element).data('title'),
			remote: element.href,
			buttons: [save, cancel]
		},

		// on modal ready
		function (modal) {

			// set form
			form = modal.find('form');

			// validate and handle form submit
			prime.validate(form, function () {

				// hide dialog
				dialog.modal('hide');

				// reload current view (todo!)
				prime.view('/Prime/Url');
			});

			save.on('click', function () {
				form.trigger('submit');
			});
		});

		return false;
	};

	url.delete = function (element) {

		// create confirm dialog
		var dialog = prime.dialog({
			backdrop: true,
			title: $(element).data('title'),
			body: $(element).data('message'),
			confirm: function () {
				$.ajax({
					url: element.href
				})
				.done(function (response) {
					prime.view('/Prime/Url');
				});
			}
		});

		return false;
	};

	return url;
});