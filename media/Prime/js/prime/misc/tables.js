define(['jquery'], function($) {
	return function () {
		var table = $(this);

		if (table.hasClass('table-selection')) {

			table.find('tbody tr').each(function () {
				var row = this;
				$(this).children('td:eq(0)').find('input[type=checkbox]').on('change', function () {
					$(row)[$(this).attr('checked') === true ? 'addClass' : 'removeClass']('warning');
				});
			});

		}

		if ( ! table.hasClass('skip-fixed-header') && table.parents('.modal-body').length === 0) {
			var thead = table.children('thead').css({ opacity: 0 }),
				containment = table.parent(),
				fixed = thead
			.clone()
			.css({ top: containment.offset().top})
			.addClass('header-fixed')
			.appendTo(table);
			containment.on('scroll', function () {
				if (containment.scrollTop() > 0) table.addClass('scrolled');
				else table.removeClass('scrolled');
			});
			$(window).on('resize', function () {
				fixed
				.find('tr > th')
				.each(function (i, item) {
					$(this).css('width', thead.find('tr > th:eq(' + i + ')').outerWidth());
				});
			}).trigger('resize');
		}

		// enable sortable rows
		// --------------------
		if (table.hasClass('table-sortable')) {
			require(['../lib/tablesorter.min'], function (tablesorter) {
				table.tablesorter({
					headerTemplate: '{content} {icon}',
					selectorHeaders: 'thead.header-fixed tr th',
					tableClass: 'table-sortable',
					cssAsc: 'table-header-asc',
					cssDesc: 'table-header-desc',
					cssIcon: 'icon-chevron-down pull-right'
				});
			});
		}

		// enable drag and drop rows
		// -------------------------
		if (table.hasClass('table-dnd')) {
			require(['tablednd'], function (tablednd) {
				table.tableDnD({
					onDrop: function (table, row) {
						$.ajax({
							url: $(table).data('reorder-api'),
							type: 'POST',
							data: { id: $(row).data('id'), ref: $(row).prev().data('id') || 0 }
						});
					}
				});
			});
		}
	};
});
