<?php $i = 0; ?>
<?php $path = isset($path) ? $path : NULL; ?>
<?php $epath = empty($path) ? '' : '['.$path.']'; ?>

<?php foreach ($table as $name => $value): ?>

	<?php if ( ! is_array($value)): ?>

		<div class="row" style="margin-bottom: 10px;">
			<div class="col-xs-6">
				<?=Form::input('table'.$epath.'['.$i.'][key]', $path.(empty($path) ? NULL : '.').$name, ['class' => 'form-control', 'readonly' => 'readonly']);?>
			</div>
			<div class="col-xs-6">
				<?php if (is_bool($value)): ?>
					<label for="<?=sha1($path.$i);?>false" class="radio-inline">
						<?=Form::radio('table'.$epath.'['.$i.'][val]', 0, ! $value, ['id' => sha1($path.$i).'false']);?> False
					</label>
					<label for="<?=sha1($path.$i);?>true" class="radio-inline">
						<?=Form::radio('table'.$epath.'['.$i.'][val]', 1, $value, ['id' => sha1($path.$i).'true']);?> True
					</label>
				<?php else: ?>
					<?=Form::input('table'.$epath.'['.$i.'][val]', $value, ['class' => 'form-control']);?>
				<?php endif; ?>
			</div>
		</div>

	<?php elseif (sizeof($value) > 0): ?>

		<?php $_path = $path.(empty($path) ? NULL : '.').$name; ?>

		<div class="row" style="margin-bottom: 10px; ">
			<div class="col-xs-12">
				<?=Form::input('table['.$_path.']', $_path, ['class' => 'form-control', 'readonly' => 'readonly']);?>
			</div>
		</div>

		<div class="row" style="margin-bottom: 10px;">
			<div class="col-sm-offset-1 col-xs-11">
				<?=View::factory('Prime/Explorer/Arritor/Editor')->set('path', $_path)->set('table', $value);?>
			</div>
		</div>

	<?php endif; ?>

<?php $i++; ?>

<?php endforeach; ?>

<div class="row" style="margin-bottom: 10px;">
	<div class="col-xs-6">
		<?=Form::input('table'.$epath.'[-1][key]', $path.'.', ['class' => 'form-control']);?>
	</div>
	<div class="col-xs-6">
		<?=Form::input('table'.$epath.'[-1][val]', NULL, ['class' => 'form-control']);?>
	</div>
</div>