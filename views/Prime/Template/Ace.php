<div class="data-grid with-navbar onload">
	<div class="navbar navbar-static-top">
		<div class="navbar-inner">
			<div class="btn-toolbar">
				<div class="btn-group">
					<?=Form::input('filename', Arr::get($item, 'filename'), array('class' => 'pull-left', 'style' => 'padding: 2px 6px; margin-bottom: 0;', 'readonly' => 'readonly'));?>
				</div>
				<div class="btn-group">
					<a href="#save" class="btn btn-success action-save"><?=__('Save changes');?></a>
				</div>
				<div class="pull-right">
					<?=Form::open(NULL, array('class' => 'form-inline', 'style' => 'margin: 0;'));?>
						<?=Form::label('aceTheme', __('Theme').':', array('style' => 'margin: 4px 8px 0 15px;'));?>
						<?=Form::select(NULL, $themes, $theme, array('id' => 'aceTheme', 'class' => 'select input-medium', 'onchange' => 'changeTheme(this.value);'));?>
						<?=Form::label('aceMode', __('Mode').':', array('style' => 'margin: 4px 8px 0 15px;'));?>
						<?=Form::select(NULL, $modes, Arr::get($item, 'mode', 'php'), array('id' => 'aceMode', 'class' => 'select input-medium', 'onchange' => 'changeMode(this.value);'));?>
					</form>
				</div>
			</div>
		</div>
	</div>
	<div class="tablepanel">
		<div id="editor" class="editor" style="margin: 0; position: absolute; top: 0; bottom: 0; left: 0; right: 0;"><?=htmlentities($item['data']);?></div>
	</div>
</div>
<script>
	app.selects();

	var editor = ace.edit("editor");
	editor.setTheme("ace/theme/" + ($.cookie('ace/theme') === null ? '<?=$theme;?>' : $.cookie('ace/theme')));
	editor.getSession().setMode("ace/mode/<?=Arr::get($item, 'mode', 'php');?>");
	editor.getSession().setFoldStyle('markbegin');
	editor.commands.addCommand({
		name: 'SaveChanges',
		bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
		exec: function(editor) {
			$('.action-save').trigger('click');
		},
		readOnly: true
	});

	$('.action-save').on('click', function() {
		<?=$savemethod;?>
		return false;
	});

	function changeTheme (value) {
		editor.setTheme('ace/theme/' + value);
		$.cookie('ace/theme', value);
	}

	function changeMode (value) {
		editor.getSession().setMode('ace/mode/' + value);
	}

	var emmetAce = (function () {

		var target = editor;

		var _self = {

			setContext: function(_edtr) {
				target = _edtr;
			},

			getContext: function() {
				return target;
			},

			getSelection: function() {
				var ret = target.session.getTextRange(target.getSelectionRange());
				return ret;
			},

			getSelectionRange: function() {

				var doc = target.getSession().doc;
				var sel = target.getSelectionRange();

				return {
					start: doc.positionToIndex(sel.start),
					end: doc.positionToIndex(sel.end)
				};
			},

			createSelection: function(start, end) {

				var doc = target.getSession().doc;

				start = doc.indexToPosition(start);
				end = doc.indexToPosition(end);

				var AceRange = ace.require('ace/range').Range;
				var cursor = target.selection.getCursor();
				var range = new AceRange(start.row, start.column, end.row, end.column);

				target.selection.setSelectionRange(range);
			},

			getCaretPos: function() {
				var session = target.getSession();
				return session.doc.positionToIndex(target.getCursorPosition());
			},

			setCaretPos: function(pos) {
				var doc = target.getSession().doc;
				target.selection.clearSelection();
				target.selection.moveCursorToPosition(doc.indexToPosition(pos));
			},

			getCurrentLine: function() {
				var cursor = target.selection.getCursor();
				var ret = cursor.row;
				return ret;
			},

			getCurrentLineRange: function() {

				var doc = target.getSession().doc;
				var line = this.getCurrentLine();
				var start = { row: line, column: 0 };
				var end = { row: line + 1, column: 0 };

				var ret = {
					start:  doc.positionToIndex(start),
					end:  doc.positionToIndex(end) - 1
				};

				return ret;
			},

			replaceContent: function(value, start, end, noIndent) {

				if (_.isUndefined(start))
					start = 0;

				if (_.isUndefined(end)) 
					end = start;

				var _startPos = start;

				var doc = target.getSession().doc;
				start = doc.indexToPosition(start);
				end = doc.indexToPosition(end);
				var AceRange = ace.require('ace/range').Range;

				var utils = emmet.require('utils');

				if (!noIndent) {
					var currLine = this.getCurrentLineRange();
					var lineBegin = doc.indexToPosition(currLine.start);
					var lineEnd = doc.indexToPosition(currLine.end);
					var _range = new AceRange(lineBegin.row, lineBegin.column, lineEnd.row, lineEnd.column);
					value = utils.padString(value, utils.getLinePadding(target.session.getTextRange(_range)));
				}

				var tabstopData = emmet.require('tabStops').extract(value, {
					escape: function(ch) {
						return ch;
					}
				});

				value = tabstopData.text;

				var cursor = target.selection.getCursor();
				var range = new AceRange(start.row, start.column, end.row, end.column);

				target.getSession().doc.remove(range);

				target.getSession().doc.insert(start, value);

				var firstTabStop = tabstopData.tabstops[0];
				
				if (firstTabStop) {
					firstTabStop.start += _startPos;
					firstTabStop.end += _startPos;
				} else {
					firstTabStop = {
						start: value.length + _startPos,
						end: value.length + _startPos
					};
				}

				this.createSelection(firstTabStop.start, firstTabStop.end);
			},

			getContent: function() {
				return target.getValue();
			},

			getSyntax: function(){
				return (target.getSession().getMode().$id).replace(/ace\/mode\//, '');
			},

			getProfileName: function() {
				return (target.getSession().getMode().$id).replace(/ace\/mode\//, '');
			},

			prompt: function(title) {
				return prompt(title);
			},

			getFilePath: function() {
				return '...file path, why?';
			}
		};

		target.commands.addCommand({
			name: 'ExpandAbbreviation',
			bindKey: {
				win: 'Tab',  mac: 'Tab'},
			exec: function(editor) {
				try {
					emmet.require('actions').run('expand_abbreviation_with_tab', _self);
				} catch (e) {
					editor.indent();
				}
			},
			readOnly: true
		});

		target.commands.addCommand({
			name: 'NextCursor',
			bindKey: { win: 'Ctrl-Alt-Right', mac: 'Ctrl-Alt-Right' },
			exec: function () { emmet.require('actions').run('next_edit_point', _self); }
		});

		target.commands.addCommand({
			name: 'PrevCursor',
			bindKey: { win: 'Ctrl-Alt-Left', mac: 'Ctrl-Alt-Left' },
			exec: function () { emmet.require('actions').run('prev_edit_point', _self); }
		});

		target.commands.addCommand({
			name: 'PrevItem',
			bindKey: { win: 'Ctrl-Shift-.', mac: 'Ctrl-Alt-Left' },
			exec: function () { emmet.require('actions').run('select_next_item', _self); }
		});

		target.commands.addCommand({
			name: 'NextItem',
			bindKey: { win: 'Ctrl-Shift-,', mac: 'Ctrl-Alt-Right' },
			exec: function () { emmet.require('actions').run('select_previous_item', _self); }
		});

		return _self;
	}());
</script>