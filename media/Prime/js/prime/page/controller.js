define(['jquery'], function($) {

	return function () {

		// page, frame and doc
		var page = {},
		    frame = $('.prime-live-iframe'),
		    doc = frame.contents();

		// find current page id
		page.id = doc.find('[data-pageid]:eq(0)').data('pageid');

		// create page dialog
		page.create = function (element) {

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
						url: '/Prime/Page/Create',
						type: 'POST',
						data: $(this).serialize()
					})
					.done(function (response) {
						$('.panel-left').html(response);
						dialog.modal('hide');
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
					return false;
				});
				save.on('click', function () {
					form.trigger('submit');
				});
			});

			return false;
		};

		// region object
		page.region = {
			add: function(id, droppable) {
				$.ajax({
					url: '/Prime/Region/Add',
					type: 'GET',
					data: {
						position: droppable.data('position'),
						ref: droppable.parent('.prime-region-item').data('id'),
						module: id,
						region: droppable.parents('.prime-region:eq(0)').data('name'),
						page: page.id
					}
				})
				.done(function (response) {
					droppable.before($(response).trigger('click'));
				});
			},
			remove: function (id) {
				prime.dialog({
					title: 'Remove region',
					body:  'Are you sure you want to delete this item?',
					confirm: function () {
						$.ajax({
							url: '/Prime/Page/DeleteRegion/' + id
						})
						.done(function (response) {
							doc.find('.prime-region-item[data-id=' + id + ']').remove();
						});
					}
				});
			},
			settings: function (id) {
				var save = $('<button/>').addClass('btn btn-primary').text('Save'),
				    cancel = $('<button/>').addClass('btn btn-default').text('Cancel').attr('data-dismiss', 'modal');

				prime.dialog({
					title: 'Settings',
					remote: '/Prime/Page/RegionSettings/' + id,
					buttons: [save, cancel]
				});
			}
		};

		return page;
	};
});