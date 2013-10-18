<?=Form::open(NULL, ['role' => 'form']);?>
	<div class="tabbable tabs-left">
		<ul class="nav nav-tabs">
			<li class="active"><?=HTML::anchor('#create_page_tab1', __('General'), ['data-toggle' => 'tab']);?></li>
		</ul>
		<div class="tab-content">
			<div class="tab-pane active" id="create_page_tab1">

					<input type="hidden" name="parent_id" value="<?=$page->id;?>">

					<div class="form-group">
						<?=Form::label('formName', __('Page name'), ['class' => 'control-label']);?>
						<?=Form::input('name', NULL, ['class' => 'form-control', 'id' => 'formName']);?>
					</div>

					<div class="form-group">
						<?=Form::label('formTemplate', __('Template'), ['class' => 'control-label']);?>
						<?=Form::select('template', $templates, NULL, ['class' => 'form-control']);?>
					</div>

					<div class="form-group">
						<?=Form::label('formName', __('Page slug'), ['class' => 'control-label']);?>
						<?=Form::input('slug', NULL, ['class' => 'form-control generate-slug', 'id' => 'formSlug', 'disabled' => 'disabled']);?>
					</div>

					<div class="form-group">
						<label for="formAutoSlug" class="checkbox">
							<?=Form::checkbox('slug_auto', 1, TRUE, ['id' => 'formAutoSlug']);?>
							<?=__('Generate slug automatically');?>
						</label>
					</div>

			</div>
		</div>
	</div>
	<input type="submit" class="hidden" />
<?=Form::close();?>