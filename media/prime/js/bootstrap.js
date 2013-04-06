/* ===========================================================
 * bootstrap-tooltip.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut
        , triggers
        , trigger
        , i

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      triggers = this.options.trigger.split(' ')

      for (i = triggers.length; i--;) {
        trigger = triggers[i]
        if (trigger == 'click') {
          this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
        } else if (trigger != 'manual') {
          eventIn = trigger == 'hover' ? 'mouseenter' : 'focus'
          eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'
          this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
          this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
        }
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options)

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var defaults = $.fn[this.type].defaults
        , options = {}
        , self

      this._options && $.each(this._options, function (key, value) {
        if (defaults[key] != value) options[key] = value
      }, this)

      self = $(e.currentTarget)[this.type](options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) return self.show()

      clearTimeout(this.timeout)
      self.hoverState = 'in'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp
        , e = $.Event('show')

      if (this.hasContent() && this.enabled) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block' })

        this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

        pos = this.getPosition()

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        this.applyPlacement(tp, placement)
        this.$element.trigger('shown')
      }
    }

  , applyPlacement: function(offset, placement){
      var $tip = this.tip()
        , width = $tip[0].offsetWidth
        , height = $tip[0].offsetHeight
        , actualWidth
        , actualHeight
        , delta
        , replace

      $tip
        .offset(offset)
        .addClass(placement)
        .addClass('in')

      actualWidth = $tip[0].offsetWidth
      actualHeight = $tip[0].offsetHeight

      if (placement == 'top' && actualHeight != height) {
        offset.top = offset.top + height - actualHeight
        replace = true
      }

      if (placement == 'bottom' || placement == 'top') {
        delta = 0

        if (offset.left < 0){
          delta = offset.left * -2
          offset.left = 0
          $tip.offset(offset)
          actualWidth = $tip[0].offsetWidth
          actualHeight = $tip[0].offsetHeight
        }

        this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
      } else {
        this.replaceArrow(actualHeight - height, actualHeight, 'top')
      }

      if (replace) $tip.offset(offset)
    }

  , replaceArrow: function(delta, dimension, position){
      this
        .arrow()
        .css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()
        , e = $.Event('hide')

      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.detach()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.detach()

      this.$element.trigger('hidden')

      return this
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function () {
      var el = this.$element[0]
      return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
        width: el.offsetWidth
      , height: el.offsetHeight
      }, this.$element.offset())
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , arrow: function(){
      return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function (e) {
      var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this
      self.tip().hasClass('in') ? self.hide() : self.show()
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tooltip

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }


 /* TOOLTIP NO CONFLICT
  * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);

/* ===========================================================
 * bootstrap-popover.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* POPOVER PUBLIC CLASS DEFINITION
  * =============================== */

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }


  /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
     ========================================== */

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {

    constructor: Popover

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()
        , content = this.getContent()

      $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
      $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

      $tip.removeClass('fade top bottom left right in')
    }

  , hasContent: function () {
      return this.getTitle() || this.getContent()
    }

  , getContent: function () {
      var content
        , $e = this.$element
        , o = this.options

      content = (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)
        || $e.attr('data-content')

      return content
    }

  , tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
      }
      return this.$tip
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  })


 /* POPOVER PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('popover')
        , options = typeof option == 'object' && option
      if (!data) $this.data('popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover

  $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


 /* POPOVER NO CONFLICT
  * =================== */

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(window.jQuery);

/* ==========================================================
 * bootstrap-alert.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#alerts
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* ALERT CLASS DEFINITION
  * ====================== */

  var dismiss = '[data-dismiss="alert"]'
    , Alert = function (el) {
        $(el).on('click', dismiss, this.close)
      }

  Alert.prototype.close = function (e) {
    var $this = $(this)
      , selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = $(selector)

    e && e.preventDefault()

    $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent())

    $parent.trigger(e = $.Event('close'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent
        .trigger('closed')
        .remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent.on($.support.transition.end, removeElement) :
      removeElement()
  }


 /* ALERT PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('alert')
      if (!data) $this.data('alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


 /* ALERT NO CONFLICT
  * ================= */

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


 /* ALERT DATA-API
  * ============== */

  $(document).on('click.alert.data-api', dismiss, Alert.prototype.close)

}(window.jQuery);
/* ==========================================================
 * bootstrap-affix.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#affix
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* AFFIX CLASS DEFINITION
  * ====================== */

  var Affix = function (element, options) {
    this.options = $.extend({}, $.fn.affix.defaults, options)
    this.$window = $(window)
      .on('scroll.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.affix.data-api',  $.proxy(function () { setTimeout($.proxy(this.checkPosition, this), 1) }, this))
    this.$element = $(element)
    this.checkPosition()
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
      , scrollTop = this.$window.scrollTop()
      , position = this.$element.offset()
      , offset = this.options.offset
      , offsetBottom = offset.bottom
      , offsetTop = offset.top
      , reset = 'affix affix-top affix-bottom'
      , affix

    if (typeof offset != 'object') offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function') offsetTop = offset.top()
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom()

    affix = this.unpin != null && (scrollTop + this.unpin <= position.top) ?
      false    : offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ?
      'bottom' : offsetTop != null && scrollTop <= offsetTop ?
      'top'    : false

    if (this.affixed === affix) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? position.top - scrollTop : null

    this.$element.removeClass(reset).addClass('affix' + (affix ? '-' + affix : ''))
  }


 /* AFFIX PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('affix')
        , options = typeof option == 'object' && option
      if (!data) $this.data('affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix

  $.fn.affix.defaults = {
    offset: 0
  }


 /* AFFIX NO CONFLICT
  * ================= */

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


 /* AFFIX DATA-API
  * ============== */

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
        , data = $spy.data()

      data.offset = data.offset || {}

      data.offsetBottom && (data.offset.bottom = data.offsetBottom)
      data.offsetTop && (data.offset.top = data.offsetTop)

      $spy.affix(data)
    })
  })


}(window.jQuery);
/* ============================================================
 * bootstrap-dropdown.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle=dropdown]'
    , Dropdown = function (element) {
        var $el = $(element).on('click.dropdown.data-api', this.toggle)
        $('html').on('click.dropdown.data-api', function () {
          $el.parent().removeClass('open')
        })
      }

  Dropdown.prototype = {

    constructor: Dropdown

  , toggle: function (e) {
      var $this = $(this)
        , $parent
        , isActive

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      clearMenus()

      if (!isActive) {
        $parent.toggleClass('open')
      }

      $this.focus()

      return false
    }

  , keydown: function (e) {
      var $this
        , $items
        , $active
        , $parent
        , isActive
        , index

      if (!/(38|40|27)/.test(e.keyCode)) return

      $this = $(this)

      e.preventDefault()
      e.stopPropagation()

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      if (!isActive || (isActive && e.keyCode == 27)) {
        if (e.which == 27) $parent.find(toggle).focus()
        return $this.click()
      }

      $items = $('[role=menu] li:not(.divider):visible a', $parent)

      if (!$items.length) return

      index = $items.index($items.filter(':focus'))

      if (e.keyCode == 38 && index > 0) index--                                        // up
      if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
      if (!~index) index = 0

      $items
        .eq(index)
        .focus()
    }

  }

  function clearMenus() {
    $(toggle).each(function () {
      getParent($(this)).removeClass('open')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = selector && $(selector)

    if (!$parent || !$parent.length) $parent = $this.parent()

    return $parent
  }


  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('dropdown')
      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


 /* DROPDOWN NO CONFLICT
  * ==================== */

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(document)
    .on('click.dropdown.data-api', clearMenus)
    .on('click.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.dropdown-menu', function (e) { e.stopPropagation() })
    .on('click.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(window.jQuery);

/* =============================================================
 * bootstrap-collapse.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning || this.$element.hasClass('in')) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')
      $.support.transition && this.$element[dimension](this.$element[0][scroll])
    }

  , hide: function () {
      var dimension
      if (this.transitioning || !this.$element.hasClass('in')) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            that.transitioning = 0
            that.$element.trigger(completeEvent)
          }

      this.$element.trigger(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSE PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = $.extend({}, $.fn.collapse.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSE NO CONFLICT
  * ==================== */

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


 /* COLLAPSE DATA-API
  * ================= */

  $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href
      , target = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
      , option = $(target).data('collapse') ? 'toggle' : $this.data()
    $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    $(target).collapse(option)
  })

}(window.jQuery);
/* =============================================================
 * bootstrap-scrollspy.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#scrollspy
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* SCROLLSPY CLASS DEFINITION
  * ========================== */

  function ScrollSpy(element, options) {
    var process = $.proxy(this.process, this)
      , $element = $(element).is('body') ? $(window) : $(element)
      , href
    this.options = $.extend({}, $.fn.scrollspy.defaults, options)
    this.$scrollElement = $element.on('scroll.scroll-spy.data-api', process)
    this.selector = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.$body = $('body')
    this.refresh()
    this.process()
  }

  ScrollSpy.prototype = {

      constructor: ScrollSpy

    , refresh: function () {
        var self = this
          , $targets

        this.offsets = $([])
        this.targets = $([])

        $targets = this.$body
          .find(this.selector)
          .map(function () {
            var $el = $(this)
              , href = $el.data('target') || $el.attr('href')
              , $href = /^#\w/.test(href) && $(href)
            return ( $href
              && $href.length
              && [[ $href.position().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]] ) || null
          })
          .sort(function (a, b) { return a[0] - b[0] })
          .each(function () {
            self.offsets.push(this[0])
            self.targets.push(this[1])
          })
      }

    , process: function () {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
          , scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
          , maxScroll = scrollHeight - this.$scrollElement.height()
          , offsets = this.offsets
          , targets = this.targets
          , activeTarget = this.activeTarget
          , i

        if (scrollTop >= maxScroll) {
          return activeTarget != (i = targets.last()[0])
            && this.activate ( i )
        }

        for (i = offsets.length; i--;) {
          activeTarget != targets[i]
            && scrollTop >= offsets[i]
            && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
            && this.activate( targets[i] )
        }
      }

    , activate: function (target) {
        var active
          , selector

        this.activeTarget = target

        $(this.selector)
          .parent('.active')
          .removeClass('active')

        selector = this.selector
          + '[data-target="' + target + '"],'
          + this.selector + '[href="' + target + '"]'

        active = $(selector)
          .parent('li')
          .addClass('active')

        if (active.parent('.dropdown-menu').length)  {
          active = active.closest('li.dropdown').addClass('active')
        }

        active.trigger('activate')
      }

  }


 /* SCROLLSPY PLUGIN DEFINITION
  * =========================== */

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('scrollspy')
        , options = typeof option == 'object' && option
      if (!data) $this.data('scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy

  $.fn.scrollspy.defaults = {
    offset: 10
  }


 /* SCROLLSPY NO CONFLICT
  * ===================== */

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


 /* SCROLLSPY DATA-API
  * ================== */

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(window.jQuery);
/* =============================================================
 * bootstrap-typeahead.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    this.source = this.options.source
    this.$menu = $(this.options.menu)
    this.shown = false
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      var val = this.$menu.find('.active').attr('data-value')
      this.$element
        .val(this.updater(val))
        .change()
      return this.hide()
    }

  , updater: function (item) {
      return item
    }

  , show: function () {
      var pos = $.extend({}, this.$element.position(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu
        .insertAfter(this.$element)
        .css({
          top: pos.top + pos.height
        , left: pos.left
        })
        .show()

      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var items

      this.query = this.$element.val()

      if (!this.query || this.query.length < this.options.minLength) {
        return this.shown ? this.hide() : this
      }

      items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source

      return items ? this.process(items) : this
    }

  , process: function (items) {
      var that = this

      items = $.grep(items, function (item) {
        return that.matcher(item)
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item)
        i.find('a').html(that.highlighter(item))
        return i[0]
      })

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
        .on('mouseleave', 'li', $.proxy(this.mouseleave, this))
    }

  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;')
        isSupported = typeof this.$element[eventName] === 'function'
      }
      return isSupported
    }

  , move: function (e) {
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27])
      this.move(e)
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return
      this.move(e)
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , focus: function (e) {
      this.focused = true
    }

  , blur: function (e) {
      this.focused = false
      if (!this.mousedover && this.shown) this.hide()
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
      this.$element.focus()
    }

  , mouseenter: function (e) {
      this.mousedover = true
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  , mouseleave: function (e) {
      this.mousedover = false
      if (!this.focused && this.shown) this.hide()
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  var old = $.fn.typeahead

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , minLength: 1
  }

  $.fn.typeahead.Constructor = Typeahead


 /* TYPEAHEAD NO CONFLICT
  * =================== */

  $.fn.typeahead.noConflict = function () {
    $.fn.typeahead = old
    return this
  }


 /* TYPEAHEAD DATA-API
  * ================== */

  $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
    var $this = $(this)
    if ($this.data('typeahead')) return
    $this.typeahead($this.data())
  })

}(window.jQuery);

/* ========================================================
 * bootstrap-tab.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#tabs
 * ========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TAB CLASS DEFINITION
  * ==================== */

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype = {

    constructor: Tab

  , show: function () {
      var $this = this.element
        , $ul = $this.closest('ul:not(.dropdown-menu)')
        , selector = $this.attr('data-target')
        , previous
        , $target
        , e

      if (!selector) {
        selector = $this.attr('href')
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
      }

      if ( $this.parent('li').hasClass('active') ) return

      previous = $ul.find('.active:last a')[0]

      e = $.Event('show', {
        relatedTarget: previous
      })

      $this.trigger(e)

      if (e.isDefaultPrevented()) return

      $target = $(selector)

      this.activate($this.parent('li'), $ul)
      this.activate($target, $target.parent(), function () {
        $this.trigger({
          type: 'shown'
        , relatedTarget: previous
        })
      })
    }

  , activate: function ( element, container, callback) {
      var $active = container.find('> .active')
        , transition = callback
            && $.support.transition
            && $active.hasClass('fade')

      function next() {
        $active
          .removeClass('active')
          .find('> .dropdown-menu > .active')
          .removeClass('active')

        element.addClass('active')

        if (transition) {
          element[0].offsetWidth // reflow for transition
          element.addClass('in')
        } else {
          element.removeClass('fade')
        }

        if ( element.parent('.dropdown-menu') ) {
          element.closest('li.dropdown').addClass('active')
        }

        callback && callback()
      }

      transition ?
        $active.one($.support.transition.end, next) :
        next()

      $active.removeClass('in')
    }
  }


 /* TAB PLUGIN DEFINITION
  * ===================== */

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tab')
      if (!data) $this.data('tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


 /* TAB NO CONFLICT
  * =============== */

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


 /* TAB DATA-API
  * ============ */

  $(document).on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);
/* ==========================================================
 * bootstrap-carousel.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#carousel
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* CAROUSEL CLASS DEFINITION
  * ========================= */

  var Carousel = function (element, options) {
    this.$element = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options = options
    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.prototype = {

    cycle: function (e) {
      if (!e) this.paused = false
      if (this.interval) clearInterval(this.interval);
      this.options.interval
        && !this.paused
        && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
      return this
    }

  , getActiveIndex: function () {
      this.$active = this.$element.find('.item.active')
      this.$items = this.$active.parent().children()
      return this.$items.index(this.$active)
    }

  , to: function (pos) {
      var activeIndex = this.getActiveIndex()
        , that = this

      if (pos > (this.$items.length - 1) || pos < 0) return

      if (this.sliding) {
        return this.$element.one('slid', function () {
          that.to(pos)
        })
      }

      if (activeIndex == pos) {
        return this.pause().cycle()
      }

      return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
    }

  , pause: function (e) {
      if (!e) this.paused = true
      if (this.$element.find('.next, .prev').length && $.support.transition.end) {
        this.$element.trigger($.support.transition.end)
        this.cycle(true)
      }
      clearInterval(this.interval)
      this.interval = null
      return this
    }

  , next: function () {
      if (this.sliding) return
      return this.slide('next')
    }

  , prev: function () {
      if (this.sliding) return
      return this.slide('prev')
    }

  , slide: function (type, next) {
      var $active = this.$element.find('.item.active')
        , $next = next || $active[type]()
        , isCycling = this.interval
        , direction = type == 'next' ? 'left' : 'right'
        , fallback  = type == 'next' ? 'first' : 'last'
        , that = this
        , e

      this.sliding = true

      isCycling && this.pause()

      $next = $next.length ? $next : this.$element.find('.item')[fallback]()

      e = $.Event('slide', {
        relatedTarget: $next[0]
      , direction: direction
      })

      if ($next.hasClass('active')) return

      if (this.$indicators.length) {
        this.$indicators.find('.active').removeClass('active')
        this.$element.one('slid', function () {
          var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
          $nextIndicator && $nextIndicator.addClass('active')
        })
      }

      if ($.support.transition && this.$element.hasClass('slide')) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $next.addClass(type)
        $next[0].offsetWidth // force reflow
        $active.addClass(direction)
        $next.addClass(direction)
        this.$element.one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
      } else {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $active.removeClass('active')
        $next.addClass('active')
        this.sliding = false
        this.$element.trigger('slid')
      }

      isCycling && this.cycle()

      return this
    }

  }


 /* CAROUSEL PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('carousel')
        , options = $.extend({}, $.fn.carousel.defaults, typeof option == 'object' && option)
        , action = typeof option == 'string' ? option : options.slide
      if (!data) $this.data('carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.defaults = {
    interval: 5000
  , pause: 'hover'
  }

  $.fn.carousel.Constructor = Carousel


 /* CAROUSEL NO CONFLICT
  * ==================== */

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }

 /* CAROUSEL DATA-API
  * ================= */

  $(document).on('click.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this = $(this), href
      , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      , options = $.extend({}, $target.data(), $this.data())
      , slideIndex

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('carousel').pause().to(slideIndex).cycle()
    }

    e.preventDefault()
  })

}(window.jQuery);
/* ===================================================
 * bootstrap-transition.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


  /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
   * ======================================================= */

  $(function () {

    $.support.transition = (function () {

      var transitionEnd = (function () {

        var el = document.createElement('bootstrap')
          , transEndEventNames = {
               'WebkitTransition' : 'webkitTransitionEnd'
            ,  'MozTransition'    : 'transitionend'
            ,  'OTransition'      : 'oTransitionEnd otransitionend'
            ,  'transition'       : 'transitionend'
            }
          , name

        for (name in transEndEventNames){
          if (el.style[name] !== undefined) {
            return transEndEventNames[name]
          }
        }

      }())

      return transitionEnd && {
        end: transitionEnd
      }

    })()

  })

}(window.jQuery);
/* ============================================================
 * bootstrap-button.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#buttons
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* BUTTON PUBLIC CLASS DEFINITION
  * ============================== */

  var Button = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.button.defaults, options)
  }

  Button.prototype.setState = function (state) {
    var d = 'disabled'
      , $el = this.$element
      , data = $el.data()
      , val = $el.is('input') ? 'val' : 'html'

    state = state + 'Text'
    data.resetText || $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d)
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons-radio"]')

    $parent && $parent
      .find('.active')
      .removeClass('active')

    this.$element.toggleClass('active')
  }


 /* BUTTON PLUGIN DEFINITION
  * ======================== */

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('button')
        , options = typeof option == 'object' && option
      if (!data) $this.data('button', (data = new Button(this, options)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.defaults = {
    loadingText: 'loading...'
  }

  $.fn.button.Constructor = Button


 /* BUTTON NO CONFLICT
  * ================== */

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


 /* BUTTON DATA-API
  * =============== */

  $(document).on('click.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
  })

}(window.jQuery);
/* =========================================================
 * bootstrap-modal.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


!function ($) {

  "use strict"; // jshint ;_;


 /* MODAL CLASS DEFINITION
  * ====================== */

  var Modal = function (element, options) {
    this.options = options
    this.$element = $(element)
      .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
    this.options.remote && this.$element.find('.modal-body').load(this.options.remote)
  }

  Modal.prototype = {

      constructor: Modal

    , toggle: function () {
        return this[!this.isShown ? 'show' : 'hide']()
      }

    , show: function () {
        var that = this
          , e = $.Event('show')

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.escape()

        this.backdrop(function () {
          var transition = $.support.transition && that.$element.hasClass('fade')

          if (!that.$element.parent().length) {
            that.$element.appendTo(document.body) //don't move modals dom position
          }

          that.$element.show()

          if (transition) {
            that.$element[0].offsetWidth // force reflow
          }

          that.$element
            .addClass('in')
            .attr('aria-hidden', false)

          that.enforceFocus()

          transition ?
            that.$element.one($.support.transition.end, function () { that.$element.focus().trigger('shown') }) :
            that.$element.focus().trigger('shown')

        })
      }

    , hide: function (e) {
        e && e.preventDefault()

        var that = this

        e = $.Event('hide')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()

        $(document).off('focusin.modal')

        this.$element
          .removeClass('in')
          .attr('aria-hidden', true)

        $.support.transition && this.$element.hasClass('fade') ?
          this.hideWithTransition() :
          this.hideModal()
      }

    , enforceFocus: function () {
        var that = this
        $(document).on('focusin.modal', function (e) {
          if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
            that.$element.focus()
          }
        })
      }

    , escape: function () {
        var that = this
        if (this.isShown && this.options.keyboard) {
          this.$element.on('keyup.dismiss.modal', function ( e ) {
            e.which == 27 && that.hide()
          })
        } else if (!this.isShown) {
          this.$element.off('keyup.dismiss.modal')
        }
      }

    , hideWithTransition: function () {
        var that = this
          , timeout = setTimeout(function () {
              that.$element.off($.support.transition.end)
              that.hideModal()
            }, 500)

        this.$element.one($.support.transition.end, function () {
          clearTimeout(timeout)
          that.hideModal()
        })
      }

    , hideModal: function () {
        var that = this
        this.$element.hide()
        this.backdrop(function () {
          that.removeBackdrop()
          that.$element.trigger('hidden')
        })
      }

    , removeBackdrop: function () {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
      }

    , backdrop: function (callback) {
        var that = this
          , animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
          var doAnimate = $.support.transition && animate

          this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
            .appendTo(document.body)

          this.$backdrop.click(
            this.options.backdrop == 'static' ?
              $.proxy(this.$element[0].focus, this.$element[0])
            : $.proxy(this.hide, this)
          )

          if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

          this.$backdrop.addClass('in')

          if (!callback) return

          doAnimate ?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (!this.isShown && this.$backdrop) {
          this.$backdrop.removeClass('in')

          $.support.transition && this.$element.hasClass('fade')?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (callback) {
          callback()
        }
      }
  }


 /* MODAL PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.modal

  $.fn.modal = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    })
  }

  $.fn.modal.defaults = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  $.fn.modal.Constructor = Modal


 /* MODAL NO CONFLICT
  * ================= */

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


 /* MODAL DATA-API
  * ============== */

  $(document).on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this)
      , href = $this.attr('href')
      , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
      , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option)
      .one('hide', function () {
        $this.focus()
      })
  })

}(window.jQuery);

/**
 * Table row selection for Twitter Bootstrap
 * 
 * @author Birkir Gudjonsson (birkir.gudjonsson@gmail.com)
 * @copyright (c) 2013
 * @licence http://www.apache.org/licenses/LICENSE-2.0
 */
(function ($) {

    'use strict';

    var old,
        TableSelect = function (element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.tableselect.defaults, options);
            this.rows = [];
            this.lastSelected = null;
            this.eventListen();
            this.$element.attr('tabindex', '10').css({ outline: 'none' });
        };

    /* TABLESELECT CLASS DEFINITION
     * ============================ */
    TableSelect.prototype = {

        constructor: TableSelect,

		getRows: function () {
			return this.rows;
		},

        eventClick: function (e) {

            var row = $(e.target).parent('tr'),
                els = this.$element.children('tbody').children('tr');

            if (this.keyCtrl !== true && this.keyShift !== true) {
                this.clearSelection();
            }

            if (this.keyShift === true && this.lastSelected !== null) {
                if (this.lastSelected > row.index()) {
                    this.eventSelect(els.filter(':lt(' + this.lastSelected + '):gt(' + row.index() + ')'));
                } else {
                    this.eventSelect(els.filter(':lt(' + row.index() + '):gt(' + this.lastSelected + ')'));
                }
            }

            this.eventSelect(row);

            // set last selected
            this.lastSelected = row.index();
        },

		eventDoubleClick: function (evt) {
			var e = $.Event('tableselect.dblclick');
			this.$element.trigger(e, [$(evt.target).parent('tr')]);
		},

        clearSelection: function () {
            this.$element.children('tbody').children('tr').removeClass(this.options.activeClass);
            this.rows = [];
        },

        eventSelect: function (elm) {
            var that = this,
                e = $.Event('select');
            elm.each(function () {
                $(this).addClass(that.options.activeClass);
                that.rows.push($(this));
            });
            this.$element.trigger(e, [this.rows]);
        },

        eventListen: function () {
            var that = this;

            this.$element
                .on('click', this.$element.children('tbody').children('tr'), $.proxy(this.eventClick, this))
                .on('dblclick', this.$element.children('tbody').children('tr'), $.proxy(this.eventDoubleClick, this));

            this.$element.on('keydown keyup', function (e) {

                if (e.type === 'keydown') {
                    that.$element.attr('unselectable', 'on').on('selectstart', false);
                }

                if (e.type === 'keyup') {
                    that.$element.attr('unselectable', 'off').off('selectstart');
                }

                if (e.keyCode === 16) {
                    that.keyShift = (e.type === 'keydown');
                }

                if (e.keyCode === 17) {
                    that.keyCtrl = (e.type === 'keydown');
                }

                if (e.type === 'keydown' && e.keyCode === 65) {
                    that.eventSelect(that.$element.children('tbody').children('tr'));
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            });
        }
    };

    /* TABLESELECT PLUGIN DEFINITION
     * ============================= */

    old = $.fn.tableselect;

    $.fn.tableselect = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('tableselect'),
                options = $.extend({}, $.fn.tableselect.defaults, $this.data(), typeof option === 'object' && option);

            if (!data) {
                $this.data('tableselect', (data = new TableSelect(this, options)));
            }
        });
    };

    $.fn.tableselect.defaults = {
        multiple: true,
        activeClass: 'warning' // success, error, warning, info
    };

    /* TABLESELECT NO CONFLICT
     * ======================= */

    $.fn.tableselect.Constructor = TableSelect;

    $.fn.tableselect.noConflict = function () {
        $.fn.tableselect = old;
        return this;
    };

}(window.jQuery));

/*!
* TableSorter 2.7.3 min - Client-side table sorting with ease!
* Copyright (c) 2007 Christian Bach
*/
!function(j){j.extend({tablesorter:new function(){function e(c){"undefined"!==typeof console&&"undefined"!==typeof console.log?console.log(c):alert(c)}function u(c,d){e(c+" ("+((new Date).getTime()-d.getTime())+"ms)")}function p(c,d,a){if(!d)return"";var b=c.config,g=b.textExtraction,f="",f="simple"===g?b.supportsTextContent?d.textContent:j(d).text():"function"===typeof g?g(d,c,a):"object"===typeof g&&g.hasOwnProperty(a)?g[a](d,c,a):b.supportsTextContent?d.textContent:j(d).text();return j.trim(f)} function h(c){var d=c.config,a=d.$tbodies,b,q,f,l,j,n,k="";if(0===a.length)return d.debug?e("*Empty table!* Not building a parser cache"):"";a=a[0].rows;if(a[0]){b=[];q=a[0].cells.length;for(f=0;f<q;f++){l=d.$headers.filter(":not([colspan])");l=l.add(d.$headers.filter('[colspan="1"]')).filter('[data-column="'+f+'"]:last');j=d.headers[f];n=g.getParserById(g.getData(l,j,"sorter"));d.empties[f]=g.getData(l,j,"empty")||d.emptyTo||(d.emptyToBottom?"bottom":"top");d.strings[f]=g.getData(l,j,"string")|| d.stringTo||"max";if(!n)a:{l=c;j=a;n=-1;for(var u=f,x=void 0,t=g.parsers.length,y=!1,m="",x=!0;""===m&&x;)n++,j[n]?(y=j[n].cells[u],m=p(l,y,u),l.config.debug&&e("Checking if value was empty on row "+n+", column: "+u+": "+m)):x=!1;for(x=1;x<t;x++)if(g.parsers[x].is(m,l,y)){n=g.parsers[x];break a}n=g.parsers[0]}d.debug&&(k+="column:"+f+"; parser:"+n.id+"; string:"+d.strings[f]+"; empty: "+d.empties[f]+"\n");b.push(n)}}d.debug&&e(k);return b}function s(c){var d=c.tBodies,a=c.config,b,q,f=a.parsers,l, v,n,k,h,x,t,m=[];a.cache={};if(!f)return a.debug?e("*Empty table!* Not building a cache"):"";a.debug&&(t=new Date);a.showProcessing&&g.isProcessing(c,!0);for(k=0;k<d.length;k++)if(a.cache[k]={row:[],normalized:[]},!j(d[k]).hasClass(a.cssInfoBlock)){b=d[k]&&d[k].rows.length||0;q=d[k].rows[0]&&d[k].rows[0].cells.length||0;for(v=0;v<b;++v)if(h=j(d[k].rows[v]),x=[],h.hasClass(a.cssChildRow))a.cache[k].row[a.cache[k].row.length-1]=a.cache[k].row[a.cache[k].row.length-1].add(h);else{a.cache[k].row.push(h); for(n=0;n<q;++n)if(l=p(c,h[0].cells[n],n),l=f[n].format(l,c,h[0].cells[n],n),x.push(l),"numeric"===(f[n].type||"").toLowerCase())m[n]=Math.max(Math.abs(l),m[n]||0);x.push(a.cache[k].normalized.length);a.cache[k].normalized.push(x)}a.cache[k].colMax=m}a.showProcessing&&g.isProcessing(c);a.debug&&u("Building cache for "+b+" rows",t)}function m(c,d){var a=c.config,b=c.tBodies,q=[],f=a.cache,e,v,n,k,h,p,m,y,s,r,E;if(f[0]){a.debug&&(E=new Date);for(y=0;y<b.length;y++)if(e=j(b[y]),!e.hasClass(a.cssInfoBlock)){h= g.processTbody(c,e,!0);e=f[y].row;v=f[y].normalized;k=(n=v.length)?v[0].length-1:0;for(p=0;p<n;p++)if(r=v[p][k],q.push(e[r]),!a.appender||!a.removeRows){s=e[r].length;for(m=0;m<s;m++)h.append(e[r][m])}g.processTbody(c,h,!1)}a.appender&&a.appender(c,q);a.debug&&u("Rebuilt table",E);d||g.applyWidget(c);j(c).trigger("sortEnd",c)}}function F(c){var d,a,b,g=c.config,f=g.sortList,e=[g.cssAsc,g.cssDesc],h=j(c).find("tfoot tr").children().removeClass(e.join(" "));g.$headers.removeClass(e.join(" "));b=f.length; for(d=0;d<b;d++)if(2!==f[d][1]&&(c=g.$headers.not(".sorter-false").filter('[data-column="'+f[d][0]+'"]'+(1===b?":last":"")),c.length))for(a=0;a<c.length;a++)c[a].sortDisabled||(c.eq(a).addClass(e[f[d][1]]),h.length&&h.filter('[data-column="'+f[d][0]+'"]').eq(a).addClass(e[f[d][1]]))}function G(c){var d=0,a=c.config,b=a.sortList,g=b.length,f=c.tBodies.length,e,h,n,k,p,m,t,r,s;if(!a.serverSideSorting&&a.cache[0]){a.debug&&(e=new Date);for(n=0;n<f;n++)p=a.cache[n].colMax,s=(m=a.cache[n].normalized)&& m[0]?m[0].length-1:0,m.sort(function(f,e){for(h=0;h<g;h++){k=b[h][0];r=b[h][1];t=/n/i.test(a.parsers&&a.parsers[k]?a.parsers[k].type||"":"")?"Numeric":"Text";t+=0===r?"":"Desc";/Numeric/.test(t)&&a.strings[k]&&(d="boolean"===typeof a.string[a.strings[k]]?(0===r?1:-1)*(a.string[a.strings[k]]?-1:1):a.strings[k]?a.string[a.strings[k]]||0:0);var l=j.tablesorter["sort"+t](c,f[k],e[k],k,p[k],d);if(l)return l}return f[s]-e[s]});a.debug&&u("Sorting on "+b.toString()+" and dir "+r+" time",e)}}function C(c, d){c.trigger("updateComplete");"function"===typeof d&&d(c[0])}function H(c,d,a){!1!==d?c.trigger("sorton",[c[0].config.sortList,function(){C(c,a)}]):C(c,a)}var g=this;g.version="2.7.3";g.parsers=[];g.widgets=[];g.defaults={theme:"default",widthFixed:!1,showProcessing:!1,headerTemplate:"{content}",onRenderTemplate:null,onRenderHeader:null,cancelSelection:!0,dateFormat:"mmddyyyy",sortMultiSortKey:"shiftKey",sortResetKey:"ctrlKey",usNumberFormat:!0,delayInit:!1,serverSideSorting:!1,headers:{},ignoreCase:!0, sortForce:null,sortList:[],sortAppend:null,sortInitialOrder:"asc",sortLocaleCompare:!1,sortReset:!1,sortRestart:!1,emptyTo:"bottom",stringTo:"max",textExtraction:"simple",textSorter:null,widgets:[],widgetOptions:{zebra:["even","odd"]},initWidgets:!0,initialized:null,tableClass:"tablesorter",cssAsc:"tablesorter-headerAsc",cssChildRow:"tablesorter-childRow",cssDesc:"tablesorter-headerDesc",cssHeader:"tablesorter-header",cssHeaderRow:"tablesorter-headerRow",cssIcon:"tablesorter-icon",cssInfoBlock:"tablesorter-infoOnly", cssProcessing:"tablesorter-processing",selectorHeaders:"> thead th, > thead td",selectorSort:"th, td",selectorRemove:".remove-me",debug:!1,headerList:[],empties:{},strings:{},parsers:[]};g.benchmark=u;g.construct=function(c){return this.each(function(){if(!this.tHead||0===this.tBodies.length||!0===this.hasInitialized)return this.config.debug?e("stopping initialization! No thead, tbody or tablesorter has already been initialized"):"";var d=j(this),a=this,b,q,f,l="",v,n,k,C,x=j.metadata;a.hasInitialized= !1;a.config={};b=j.extend(!0,a.config,g.defaults,c);j.data(a,"tablesorter",b);b.debug&&j.data(a,"startoveralltimer",new Date);b.supportsTextContent="x"===j("<span>x</span>")[0].textContent;b.supportsDataObject=1.4<=parseFloat(j.fn.jquery);b.string={max:1,min:-1,"max+":1,"max-":-1,zero:0,none:0,"null":0,top:!0,bottom:!1};/tablesorter\-/.test(d.attr("class"))||(l=""!==b.theme?" tablesorter-"+b.theme:"");b.$table=d.addClass(b.tableClass+l);b.$tbodies=d.children("tbody:not(."+b.cssInfoBlock+")");var t= [],y={},Q=j(a).find("thead:eq(0), tfoot").children("tr"),K,E,z,A,O,D,L,R,S,I;for(K=0;K<Q.length;K++){O=Q[K].cells;for(E=0;E<O.length;E++){A=O[E];D=A.parentNode.rowIndex;L=D+"-"+A.cellIndex;R=A.rowSpan||1;S=A.colSpan||1;"undefined"===typeof t[D]&&(t[D]=[]);for(z=0;z<t[D].length+1;z++)if("undefined"===typeof t[D][z]){I=z;break}y[L]=I;j(A).attr({"data-column":I});for(z=D;z<D+R;z++){"undefined"===typeof t[z]&&(t[z]=[]);L=t[z];for(A=I;A<I+S;A++)L[A]="x"}}}var M,B,P,T,N,J,U,w=a.config;w.headerList=[];w.headerContent= [];w.debug&&(U=new Date);T=w.cssIcon?'<i class="'+w.cssIcon+'"></i>':"";t=j(a).find(w.selectorHeaders).each(function(a){B=j(this);M=w.headers[a];w.headerContent[a]=this.innerHTML;N=w.headerTemplate.replace(/\{content\}/g,this.innerHTML).replace(/\{icon\}/g,T);w.onRenderTemplate&&(P=w.onRenderTemplate.apply(B,[a,N]))&&"string"===typeof P&&(N=P);this.innerHTML='<div class="tablesorter-header-inner">'+N+"</div>";w.onRenderHeader&&w.onRenderHeader.apply(B,[a]);this.column=y[this.parentNode.rowIndex+"-"+ this.cellIndex];var b=g.getData(B,M,"sortInitialOrder")||w.sortInitialOrder;this.order=/^d/i.test(b)||1===b?[1,0,2]:[0,1,2];this.count=-1;"false"===g.getData(B,M,"sorter")?(this.sortDisabled=!0,B.addClass("sorter-false")):B.removeClass("sorter-false");this.lockedOrder=!1;J=g.getData(B,M,"lockedOrder")||!1;"undefined"!==typeof J&&!1!==J&&(this.order=this.lockedOrder=/^d/i.test(J)||1===J?[1,1,1]:[0,0,0]);B.addClass((this.sortDisabled?"sorter-false ":" ")+w.cssHeader);w.headerList[a]=this;B.parent().addClass(w.cssHeaderRow)}); a.config.debug&&(u("Built headers:",U),e(t));b.$headers=t;b.parsers=h(a);b.delayInit||s(a);b.$headers.find("*").andSelf().filter(b.selectorSort).unbind("mousedown.tablesorter mouseup.tablesorter").bind("mousedown.tablesorter mouseup.tablesorter",function(c,e){var h=(this.tagName.match("TH|TD")?j(this):j(this).parents("th, td").filter(":last"))[0];if(1!==(c.which||c.button))return!1;if("mousedown"===c.type)return C=(new Date).getTime(),"INPUT"===c.target.tagName?"":!b.cancelSelection;if(!0!==e&&250< (new Date).getTime()-C)return!1;b.delayInit&&!b.cache&&s(a);if(!h.sortDisabled){d.trigger("sortStart",a);l=!c[b.sortMultiSortKey];h.count=c[b.sortResetKey]?2:(h.count+1)%(b.sortReset?3:2);b.sortRestart&&(q=h,b.$headers.each(function(){if(this!==q&&(l||!j(this).is("."+b.cssDesc+",."+b.cssAsc)))this.count=-1}));q=h.column;if(l){b.sortList=[];if(null!==b.sortForce){v=b.sortForce;for(f=0;f<v.length;f++)v[f][0]!==q&&b.sortList.push(v[f])}k=h.order[h.count];if(2>k&&(b.sortList.push([q,k]),1<h.colSpan))for(f= 1;f<h.colSpan;f++)b.sortList.push([q+f,k])}else if(b.sortAppend&&1<b.sortList.length&&g.isValueInArray(b.sortAppend[0][0],b.sortList)&&b.sortList.pop(),g.isValueInArray(q,b.sortList))for(f=0;f<b.sortList.length;f++)n=b.sortList[f],k=b.headerList[n[0]],n[0]===q&&(n[1]=k.order[k.count],2===n[1]&&(b.sortList.splice(f,1),k.count=-1));else if(k=h.order[h.count],2>k&&(b.sortList.push([q,k]),1<h.colSpan))for(f=1;f<h.colSpan;f++)b.sortList.push([q+f,k]);if(null!==b.sortAppend){v=b.sortAppend;for(f=0;f<v.length;f++)v[f][0]!== q&&b.sortList.push(v[f])}d.trigger("sortBegin",a);setTimeout(function(){F(a);G(a);m(a)},1)}});b.cancelSelection&&b.$headers.each(function(){this.onselectstart=function(){return!1}});d.unbind("sortReset update updateCell addRows sorton appendCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave").bind("sortReset",function(){b.sortList=[];F(a);G(a);m(a)}).bind("update",function(c,f,g){j(b.selectorRemove,a).remove();b.parsers=h(a);s(a);H(d,f,g)}).bind("updateCell",function(c,f,g, e){var q,h,l;q=d.find("tbody");c=q.index(j(f).parents("tbody").filter(":last"));var k=j(f).parents("tr").filter(":last");f=j(f)[0];q.length&&0<=c&&(h=q.eq(c).find("tr").index(k),l=f.cellIndex,q=a.config.cache[c].normalized[h].length-1,a.config.cache[c].row[a.config.cache[c].normalized[h][q]]=k,a.config.cache[c].normalized[h][l]=b.parsers[l].format(p(a,f,l),a,f,l),H(d,g,e))}).bind("addRows",function(c,g,e,q){var j=g.filter("tr").length,l=[],k=g[0].cells.length,n=d.find("tbody").index(g.closest("tbody")); b.parsers||(b.parsers=h(a));for(c=0;c<j;c++){for(f=0;f<k;f++)l[f]=b.parsers[f].format(p(a,g[c].cells[f],f),a,g[c].cells[f],f);l.push(b.cache[n].row.length);b.cache[n].row.push([g[c]]);b.cache[n].normalized.push(l);l=[]}H(d,e,q)}).bind("sorton",function(b,c,f,g){d.trigger("sortStart",this);var e,q,l,h=a.config;b=c||h.sortList;h.sortList=[];j.each(b,function(a,b){e=[parseInt(b[0],10),parseInt(b[1],10)];if(l=h.headerList[e[0]])h.sortList.push(e),q=j.inArray(e[1],l.order),l.count=0<=q?q:e[1]%(h.sortReset? 3:2)});F(a);G(a);m(a,g);"function"===typeof f&&f(a)}).bind("appendCache",function(b,c,d){m(a,d);"function"===typeof c&&c(a)}).bind("applyWidgetId",function(c,d){g.getWidgetById(d).format(a,b,b.widgetOptions)}).bind("applyWidgets",function(b,c){g.applyWidget(a,c)}).bind("refreshWidgets",function(b,c,d){g.refreshWidgets(a,c,d)}).bind("destroy",function(b,c,d){g.destroy(a,c,d)});b.supportsDataObject&&"undefined"!==typeof d.data().sortlist?b.sortList=d.data().sortlist:x&&(d.metadata()&&d.metadata().sortlist)&& (b.sortList=d.metadata().sortlist);g.applyWidget(a,!0);0<b.sortList.length?d.trigger("sorton",[b.sortList,{},!b.initWidgets]):b.initWidgets&&g.applyWidget(a);if(a.config.widthFixed&&0===j(a).find("colgroup").length){var V=j("<colgroup>"),W=j(a).width();j("tr:first td",a.tBodies[0]).each(function(){V.append(j("<col>").css("width",parseInt(1E3*(j(this).width()/W),10)/10+"%"))});j(a).prepend(V)}b.showProcessing&&d.unbind("sortBegin sortEnd").bind("sortBegin sortEnd",function(b){g.isProcessing(a,"sortBegin"=== b.type)});a.hasInitialized=!0;b.debug&&g.benchmark("Overall initialization time",j.data(a,"startoveralltimer"));d.trigger("tablesorter-initialized",a);"function"===typeof b.initialized&&b.initialized(a)})};g.isProcessing=function(c,d,a){var b=c.config;c=a||j(c).find("."+b.cssHeader);d?(0<b.sortList.length&&(c=c.filter(function(){return this.sortDisabled?!1:g.isValueInArray(parseFloat(j(this).attr("data-column")),b.sortList)})),c.addClass(b.cssProcessing)):c.removeClass(b.cssProcessing)};g.processTbody= function(c,d,a){if(a)return d.before('<span class="tablesorter-savemyplace"/>'),c=j.fn.detach?d.detach():d.remove();c=j(c).find("span.tablesorter-savemyplace");d.insertAfter(c);c.remove()};g.clearTableBody=function(c){c.config.$tbodies.empty()};g.destroy=function(c,d,a){if(c.hasInitialized){g.refreshWidgets(c,!0,!0);var b=j(c),e=c.config,f=b.find("thead:first"),h=f.find("tr."+e.cssHeaderRow).removeClass(e.cssHeaderRow),u=b.find("tfoot:first > tr").children("th, td");f.find("tr").not(h).remove();b.removeData("tablesorter").unbind("sortReset update updateCell addRows sorton appendCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave"); e.$headers.add(u).removeClass(e.cssHeader+" "+e.cssAsc+" "+e.cssDesc).removeAttr("data-column");h.find(e.selectorSort).unbind("mousedown.tablesorter mouseup.tablesorter");h.children().each(function(a){j(this).html(e.headerContent[a])});!1!==d&&b.removeClass(e.tableClass+" tablesorter-"+e.theme);c.hasInitialized=!1;"function"===typeof a&&a(c)}};g.regex=[/(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,/(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/, /^0x[0-9a-f]+$/i];g.sortText=function(c,d,a,b){if(d===a)return 0;var e=c.config,f=e.string[e.empties[b]||e.emptyTo],h=g.regex;if(""===d&&0!==f)return"boolean"===typeof f?f?-1:1:-f||-1;if(""===a&&0!==f)return"boolean"===typeof f?f?1:-1:f||1;if("function"===typeof e.textSorter)return e.textSorter(d,a,c,b);c=d.replace(h[0],"\\0$1\\0").replace(/\\0$/,"").replace(/^\\0/,"").split("\\0");b=a.replace(h[0],"\\0$1\\0").replace(/\\0$/,"").replace(/^\\0/,"").split("\\0");d=parseInt(d.match(h[2]),16)||1!==c.length&& d.match(h[1])&&Date.parse(d);if(a=parseInt(a.match(h[2]),16)||d&&a.match(h[1])&&Date.parse(a)||null){if(d<a)return-1;if(d>a)return 1}e=Math.max(c.length,b.length);for(d=0;d<e;d++){a=isNaN(c[d])?c[d]||0:parseFloat(c[d])||0;h=isNaN(b[d])?b[d]||0:parseFloat(b[d])||0;if(isNaN(a)!==isNaN(h))return isNaN(a)?1:-1;typeof a!==typeof h&&(a+="",h+="");if(a<h)return-1;if(a>h)return 1}return 0};g.sortTextDesc=function(c,d,a,b){if(d===a)return 0;var e=c.config,f=e.string[e.empties[b]||e.emptyTo];return""===d&& 0!==f?"boolean"===typeof f?f?-1:1:f||1:""===a&&0!==f?"boolean"===typeof f?f?1:-1:-f||-1:"function"===typeof e.textSorter?e.textSorter(a,d,c,b):g.sortText(c,a,d)};g.getTextValue=function(c,d,a){if(d){var b=c.length,e=d+a;for(d=0;d<b;d++)e+=c.charCodeAt(d);return a*e}return 0};g.sortNumeric=function(c,d,a,b,e,f){if(d===a)return 0;c=c.config;b=c.string[c.empties[b]||c.emptyTo];if(""===d&&0!==b)return"boolean"===typeof b?b?-1:1:-b||-1;if(""===a&&0!==b)return"boolean"===typeof b?b?1:-1:b||1;isNaN(d)&& (d=g.getTextValue(d,e,f));isNaN(a)&&(a=g.getTextValue(a,e,f));return d-a};g.sortNumericDesc=function(c,d,a,b,e,f){if(d===a)return 0;c=c.config;b=c.string[c.empties[b]||c.emptyTo];if(""===d&&0!==b)return"boolean"===typeof b?b?-1:1:b||1;if(""===a&&0!==b)return"boolean"===typeof b?b?1:-1:-b||-1;isNaN(d)&&(d=g.getTextValue(d,e,f));isNaN(a)&&(a=g.getTextValue(a,e,f));return a-d};g.characterEquivalents={a:"\u00e1\u00e0\u00e2\u00e3\u00e4\u0105\u00e5",A:"\u00c1\u00c0\u00c2\u00c3\u00c4\u0104\u00c5",c:"\u00e7\u0107\u010d", C:"\u00c7\u0106\u010c",e:"\u00e9\u00e8\u00ea\u00eb\u011b\u0119",E:"\u00c9\u00c8\u00ca\u00cb\u011a\u0118",i:"\u00ed\u00ec\u0130\u00ee\u00ef\u0131",I:"\u00cd\u00cc\u0130\u00ce\u00cf",o:"\u00f3\u00f2\u00f4\u00f5\u00f6",O:"\u00d3\u00d2\u00d4\u00d5\u00d6",ss:"\u00df",SS:"\u1e9e",u:"\u00fa\u00f9\u00fb\u00fc\u016f",U:"\u00da\u00d9\u00db\u00dc\u016e"};g.replaceAccents=function(c){var d,a="[",b=g.characterEquivalents;if(!g.characterRegex){g.characterRegexArray={};for(d in b)"string"===typeof d&&(a+=b[d],g.characterRegexArray[d]= RegExp("["+b[d]+"]","g"));g.characterRegex=RegExp(a+"]")}if(g.characterRegex.test(c))for(d in b)"string"===typeof d&&(c=c.replace(g.characterRegexArray[d],d));return c};g.isValueInArray=function(c,d){var a,b=d.length;for(a=0;a<b;a++)if(d[a][0]===c)return!0;return!1};g.addParser=function(c){var d,a=g.parsers.length,b=!0;for(d=0;d<a;d++)g.parsers[d].id.toLowerCase()===c.id.toLowerCase()&&(b=!1);b&&g.parsers.push(c)};g.getParserById=function(c){var d,a=g.parsers.length;for(d=0;d<a;d++)if(g.parsers[d].id.toLowerCase()=== c.toString().toLowerCase())return g.parsers[d];return!1};g.addWidget=function(c){g.widgets.push(c)};g.getWidgetById=function(c){var d,a,b=g.widgets.length;for(d=0;d<b;d++)if((a=g.widgets[d])&&a.hasOwnProperty("id")&&a.id.toLowerCase()===c.toLowerCase())return a};g.applyWidget=function(c,d){var a=c.config,b=a.widgetOptions,e=a.widgets.sort().reverse(),f,h,m,n=e.length;h=j.inArray("zebra",a.widgets);0<=h&&(a.widgets.splice(h,1),a.widgets.push("zebra"));a.debug&&(f=new Date);for(h=0;h<n;h++)(m=g.getWidgetById(e[h]))&& (!0===d&&m.hasOwnProperty("init")?m.init(c,m,a,b):!d&&m.hasOwnProperty("format")&&m.format(c,a,b));a.debug&&u("Completed "+(!0===d?"initializing":"applying")+" widgets",f)};g.refreshWidgets=function(c,d,a){var b,h=c.config,f=h.widgets,l=g.widgets,m=l.length;for(b=0;b<m;b++)if(l[b]&&l[b].id&&(d||0>j.inArray(l[b].id,f)))h.debug&&e("Refeshing widgets: Removing "+l[b].id),l[b].hasOwnProperty("remove")&&l[b].remove(c,h,h.widgetOptions);!0!==a&&g.applyWidget(c,d)};g.getData=function(c,d,a){var b="";c=j(c); var e,f;if(!c.length)return"";e=j.metadata?c.metadata():!1;f=" "+(c.attr("class")||"");"undefined"!==typeof c.data(a)||"undefined"!==typeof c.data(a.toLowerCase())?b+=c.data(a)||c.data(a.toLowerCase()):e&&"undefined"!==typeof e[a]?b+=e[a]:d&&"undefined"!==typeof d[a]?b+=d[a]:" "!==f&&f.match(" "+a+"-")&&(b=f.match(RegExp(" "+a+"-(\\w+)"))[1]||"");return j.trim(b)};g.formatFloat=function(c,d){if("string"!==typeof c||""===c)return c;var a;c=(d&&d.config?!1!==d.config.usNumberFormat:"undefined"!==typeof d? d:1)?c.replace(/,/g,""):c.replace(/[\s|\.]/g,"").replace(/,/g,".");/^\s*\([.\d]+\)/.test(c)&&(c=c.replace(/^\s*\(/,"-").replace(/\)/,""));a=parseFloat(c);return isNaN(a)?j.trim(c):a};g.isDigit=function(c){return isNaN(c)?/^[\-+(]?\d+[)]?$/.test(c.toString().replace(/[,.'"\s]/g,"")):!0}}});var h=j.tablesorter;j.fn.extend({tablesorter:h.construct});h.addParser({id:"text",is:function(){return!0},format:function(e,u){var p=u.config;e=j.trim(p.ignoreCase?e.toLocaleLowerCase():e);return p.sortLocaleCompare? h.replaceAccents(e):e},type:"text"});h.addParser({id:"currency",is:function(e){return/^\(?\d+[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]|[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]\d+\)?$/.test(e)},format:function(e,j){return h.formatFloat(e.replace(/[^\w,. \-()]/g,""),j)},type:"numeric"});h.addParser({id:"ipAddress",is:function(e){return/^\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}$/.test(e)},format:function(e,j){var p,r=e.split("."),s="",m=r.length;for(p=0;p<m;p++)s+=("00"+r[p]).slice(-3);return h.formatFloat(s,j)}, type:"numeric"});h.addParser({id:"url",is:function(e){return/^(https?|ftp|file):\/\//.test(e)},format:function(e){return j.trim(e.replace(/(https?|ftp|file):\/\//,""))},type:"text"});h.addParser({id:"isoDate",is:function(e){return/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(e)},format:function(e,j){return h.formatFloat(""!==e?(new Date(e.replace(/-/g,"/"))).getTime()||"":"",j)},type:"numeric"});h.addParser({id:"percent",is:function(e){return/(\d\s?%|%\s?\d)/.test(e)},format:function(e,j){return h.formatFloat(e.replace(/%/g, ""),j)},type:"numeric"});h.addParser({id:"usLongDate",is:function(e){return/^[A-Z]{3,10}\.?\s+\d{1,2},?\s+(\d{4})(\s+\d{1,2}:\d{2}(:\d{2})?(\s+[AP]M)?)?$/i.test(e)},format:function(e,j){return h.formatFloat((new Date(e.replace(/(\S)([AP]M)$/i,"$1 $2"))).getTime()||"",j)},type:"numeric"});h.addParser({id:"shortDate",is:function(e){return/^(\d{1,2}|\d{4})[\/\-\,\.\s+]\d{1,2}[\/\-\.\,\s+](\d{1,2}|\d{4})$/.test(e)},format:function(e,j,p,r){p=j.config;var s=p.headerList[r],m=s.shortDateFormat;"undefined"=== typeof m&&(m=s.shortDateFormat=h.getData(s,p.headers[r],"dateFormat")||p.dateFormat);e=e.replace(/\s+/g," ").replace(/[\-|\.|\,]/g,"/");"mmddyyyy"===m?e=e.replace(/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/,"$3/$1/$2"):"ddmmyyyy"===m?e=e.replace(/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/,"$3/$2/$1"):"yyyymmdd"===m&&(e=e.replace(/(\d{4})[\/\s](\d{1,2})[\/\s](\d{1,2})/,"$1/$2/$3"));return h.formatFloat((new Date(e)).getTime()||"",j)},type:"numeric"});h.addParser({id:"time",is:function(e){return/^(([0-2]?\d:[0-5]\d)|([0-1]?\d:[0-5]\d\s?([AP]M)))$/i.test(e)}, format:function(e,j){return h.formatFloat((new Date("2000/01/01 "+e.replace(/(\S)([AP]M)$/i,"$1 $2"))).getTime()||"",j)},type:"numeric"});h.addParser({id:"digit",is:function(e){return h.isDigit(e)},format:function(e,j){return h.formatFloat(e.replace(/[^\w,. \-()]/g,""),j)},type:"numeric"});h.addParser({id:"metadata",is:function(){return!1},format:function(e,h,p){e=h.config;e=!e.parserMetadataName?"sortValue":e.parserMetadataName;return j(p).metadata()[e]},type:"numeric"});h.addWidget({id:"zebra", format:function(e,u,p){var r,s,m,F,G,C,H=RegExp(u.cssChildRow,"i"),g=u.$tbodies;u.debug&&(G=new Date);for(e=0;e<g.length;e++)r=g.eq(e),C=r.children("tr").length,1<C&&(m=0,r=r.children("tr:visible"),r.each(function(){s=j(this);H.test(this.className)||m++;F=0===m%2;s.removeClass(p.zebra[F?1:0]).addClass(p.zebra[F?0:1])}));u.debug&&h.benchmark("Applying Zebra widget",G)},remove:function(e,h){var p,r,s=h.$tbodies,m=(h.widgetOptions.zebra||["even","odd"]).join(" ");for(p=0;p<s.length;p++)r=j.tablesorter.processTbody(e, s.eq(p),!0),r.children().removeClass(m),j.tablesorter.processTbody(e,r,!1)}})}(jQuery);
(function(e){e.extend({tablesorterPager:new function(){function t(t){var n=e(t.cssPageDisplay,t.container).val(t.page+1+t.seperator+t.totalPages).trigger('change');}function n(e,t){var n=e.config;n.size=t;n.totalPages=Math.ceil(n.totalRows/n.size);n.pagerPositionSet=false;a(e);r(e)}function r(t){var n=t.config;if(!n.pagerPositionSet&&n.positionFixed){var n=t.config,r=e(t);if(r.offset){n.container.css({top:r.offset().top+r.height()+"px",position:"absolute"})}n.pagerPositionSet=true}}function i(e){var t=e.config;t.page=0;a(e)}function s(e){var t=e.config;t.page=t.totalPages-1;a(e)}function o(e){var t=e.config;t.page++;if(t.page>=t.totalPages-1){t.page=t.totalPages-1}a(e)}function u(e){var t=e.config;t.page--;if(t.page<=0){t.page=0}a(e)}function a(e){var t=e.config;if(t.page<0||t.page>t.totalPages-1){t.page=0}f(e,t.rowsCopy)}function f(n,i){var o=n.config;var u=i.length;var a=o.page*o.size;var f=a+o.size;if(f>i.length){f=i.length}var l=e(n.tBodies[0]);e.tablesorter.clearTableBody(n);for(var c=a;c<f;c++){var h=i[c];var u=h.length;for(var p=0;p<u;p++){l[0].appendChild(h[p])}}r(n,l);e(n).trigger("applyWidgets");if(o.page>=o.totalPages){s(n)}t(o)}this.appender=function(e,t){var n=e.config;n.rowsCopy=t;n.totalRows=t.length;n.totalPages=Math.ceil(n.totalRows/n.size);f(e,t)};this.defaults={size:10,offset:0,page:0,totalRows:0,totalPages:0,container:null,cssNext:".next",cssPrev:".prev",cssFirst:".first",cssLast:".last",cssPageDisplay:".pagedisplay",cssPageSize:".pagesize",seperator:"/",positionFixed:true,appender:this.appender};this.construct=function(t){return this.each(function(){config=e.extend(this.config,e.tablesorterPager.defaults,t);var r=this,a=config.container;e(this).trigger("appendCache");config.size=parseInt(e(".pagesize",a).val());e(config.cssFirst,a).click(function(){i(r);return false});e(config.cssNext,a).click(function(){o(r);return false});e(config.cssPrev,a).click(function(){u(r);return false});e(config.cssLast,a).click(function(){s(r);return false});e(config.cssPageSize,a).change(function(){n(r,parseInt(e(this).val()));return false})})}}});e.fn.extend({tablesorterPager:e.tablesorterPager.construct})})(jQuery);