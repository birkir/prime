define(['jquery'], function($) {
	return function () {

		var table = $(this);

		// find reorder handle
		if (table.hasClass('table-dnd')) {
			table.data('reorder', table.find('tbody > tr td.reorder-handle').index());
		}

		// selectable rows
		// ---------------
		if (table.hasClass('table-selection')) {

			// some variables
			var thbox = table.find('thead tr input[type=checkbox].s'),
			    tbbox = table.find('tbody tr input[type=checkbox].s'),
			    t = table[0],
			    selected;

			// initialize selected list
			t.selected = [];

			// check all
			thbox.on('change', function () {
				var that = this;
				tbbox.each(function () { this.checked = that.checked; }).eq(0).trigger('change');
			});

			// on checkbox change
			tbbox.on('change', function () {
				t.selected = tbbox.filter(':checked').parent('td').parent('tr');
				table.trigger('changed');
				selected = [];
				$(t.selected).each(function () {
					selected.push($(this).data('id'));
				});

				// bind template on change
				if (table.data('bind-template') && table.data('bind')) {
					var source = $(table.data('bind-template')).html(),
						template = Handlebars.compile(source),
						data = {
							id: selected.join(':'),
							zero: t.selected.length === 0,
							one: t.selected.length === 1,
							more: t.selected.length > 1
						};
					$(table.data('bind')).html(template(data));
				}
			})
			.eq(0)
			.trigger('change');

			table.find('tbody tr').on('click', function (e) {
				if (e.target.nodeName === 'INPUT'&& e.target.type === 'checkbox')
					return;
				$(this).find('td:first-child input[type=checkbox]').each(function () {
					this.checked = ! this.checked;
				}).trigger('change');
			})
		}

		table.bind('sortEnd', function (e, table) {
			var sort = table.config.sortList[0],
				index = $(table).data('reorder');

			if (sort[0] === index && sort[1] === 0) {
				$(table).find('tbody .noreorder').removeClass('noreorder').addClass('reorder-handle');
			} else {
				$(table).find('tbody .reorder-handle').removeClass('reorder-handle').addClass('noreorder');
			}
		});

		// enable sortable rows
		// --------------------
		if (table.hasClass('table-sortable')) {

			if (table.parents('.modal-body').length === 0) {
				var thead = table.children('thead').css({ opacity: 0 }),
					containment = table.parent(),
					fixed = thead
				.clone()
				.css({ top: containment.offset().top})
				.addClass('header-fixed')
				.on('change', 'input[type=checkbox].s', function () {
					var checkbox = thead.find('input[type=checkbox].s');
					checkbox[0].checked = this.checked;
					checkbox.trigger('change');
				})
				.appendTo(table);
				containment.on('scroll', function () {
					if (containment.scrollTop() > 0) table.addClass('scrolled');
					else table.removeClass('scrolled');
				});
				fixed.find('input[type=checkbox]').on('click', function () {
					console.log('foobar');
				});
				$(window).on('resize', function () {
					fixed
					.find('tr > th')
					.each(function (i, item) {
						$(this).css('width', thead.find('tr > th:eq(' + i + ')').outerWidth());
					});
				}).trigger('resize');
			}

			require(['../lib/tablesorter.min'], function (tablesorter) {
				table.tablesorter({
					headerTemplate: '{content} {icon}',
					selectorHeaders: 'thead.header-fixed tr th',
					tableClass: 'table-sortable',
					cssAsc: 'table-header-asc',
					cssDesc: 'table-header-desc',
					cssIcon: 'fa fa-chevron-down pull-right'
				});
			});
		}

		// enable drag and drop rows
		// -------------------------
		if (table.hasClass('table-dnd')) {
			require(['../lib/jquery.tablednd'], function (tablednd) {
				table.tableDnD({
					onDrop: function (table, row) {
						$.ajax({
							url: $(table).data('reorder-api') + '/' + $(row).data('id') + ':' + $(row).next().data('id')
						});
					}
				});

				if (table.hasClass('table-sortable'))
				{
					table.trigger('sorton', [[[table.data('reorder'), 0]], null]);
				}
			});
		}
	};
});
