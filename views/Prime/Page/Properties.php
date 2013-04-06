<?=Form::open(NULL, array('style' => 'margin: 0px'));?>
	<div class="tabbable tabs-left">
		<ul class="nav nav-tabs" style="height: 360px;">
			<li class="active"><a href="#propertiesGeneral" data-toggle="tab"><?=__('General');?></a></li>
			<li><a href="#propertiesForwarding" data-toggle="tab"><?=__('Forwarding');?></a></li>
			<li><a href="#propertiesMeta" data-toggle="tab"><?=__('Meta tags');?></a></li>
			<li><a href="#propertiesAccessControl" data-toggle="tab">Access Control</a></li>
		</ul>
		<div class="tab-content">
			<div class="tab-pane active modal-body" id="propertiesGeneral" style="height: 320px;">
				<div class="control-group">
					<?=Form::label('propertiesName', __('Name'), array('class' => 'control-label'));?>
					<?=Form::input('name', $item->name, array('class' => 'input-block-level', 'id' => 'propertiesName'));?>
				</div>

				<div class="control-group">
					<?=Form::label('propertiesTitle', __('Title'), array('class' => 'control-label'));?>
					<?=Form::input('title', $item->title, array('class' => 'input-block-level', 'id' => 'propertiesTitle'));?>
				</div>

				<div class="control-group">
					<?=Form::label('propertiesAlias', __('Alias'), array('class' => 'control-label'));?>
					<div class="input-append">
						<?=Form::input('alias', $item->alias, array('class' => 'input-block-level', 'id' => 'propertiesAlias'));?>
						<?=Form::button('generate', __('Generate'), array('class' => 'btn', 'onclick' => 'return aliasGenerate()'));?>
					</div>
				</div>

				<div class="control-group">
					<?=Form::label('propertiesTemplate', __('Template'), array('class' => 'control-label'));?>
					<?=Form::select('template', array(1,2,3,4,5), 1, array('class' => 'select input-block-level'));?>
				</div>
			</div>
			<div class="tab-pane modal-body" id="propertiesForwarding">
				<div class="control-group">
					<label for="propertiesForwardingEnabled" class="checkbox">
						<input type="checkbox" name="forwarding" id="propertiesForwardingEnabled" onchange="enableForwarding(this.checked)"> <?=__('Enable forwarding'); ?>
					</label>
				</div>

				<div class="control-group">
					<?=Form::label('propertiesForwardingURL', __('URL'), array('class' => 'control-label'));?>
					<input type="text" class="input-block-level" id="propertiesForwardingURL" value="<?=$item->forward_url;?>" <?=($item->forward === 1 ? '' : ' disabled="disabled"');?>>
				</div>
			</div>
			<div class="tab-pane modal-body" id="propertiesMeta">
				<div class="control-group">
					<label for="propertiesDescription">Description</label>
					<textarea name="description" id="propertiesDescription" cols="30" rows="3" class="input-block-level" style="max-width: 100%; min-width: 100%; max-height: 120px;"></textarea>
				</div>
				<div class="control-group">
					<label for="propertiesKeywords">Keywords</label>
					<textarea name="keywords" id="propertiesKeywords" cols="30" rows="3" class="input-block-level" style="max-width: 100%; min-width: 100%; max-height: 120px;"></textarea>
				</div>
			</div>
			<div class="tab-pane modal-body" id="propertiesAccessControl">
				In development
			</div>
		</div>
	</div>
	<div class="modal-footer" style="margin-top: -3px; position: relative;">
		<button class="btn btn-danger" data-dismiss="modal" aria-hidden="true"><?=__('Cancel');?></button>
		<button class="btn btn-primary" type="submit"><?=__('Save changes');?></button>
	</div>
<?=Form::close();?>
<script>
	app.selects();
	function enableForwarding(value) {
		document.getElementById('propertiesForwardingURL').disabled = (value === false ? 'disabled' : '');
	}
	function aliasGenerate(val) {
		var name = document.getElementById('propertiesName').value;
		$.ajax({
			url: '/prime/page/generate_alias',
			data: { input: name },
			success: function (data) {
				document.getElementById('propertiesAlias').value = data;
			}
		});
		return false;
	}
</script>