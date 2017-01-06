/* @flow */

import Vue from './web-runtime'
import { warn, cached } from 'core/util/index'
import { query } from 'web/util/index'
import { shouldDecodeNewlines } from 'web/util/compat'
import { compileToFunctions } from 'web/compiler/index'

//
// 根据id查询elem并缓存
// @return 对应元素的html
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 此处的mount在src/entries/web-runtime.js中定义
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  debugger;
  // 如果el存在，则query获取或者创建元素
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) { // 如果设置了template
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) { // 如果没设置tempalte，并且el有值
      template = getOuterHTML(el)
    }
    if (template) {
      debugger;
      // src/platforms/web/compiler/index.js-->compileToFunctions
      const { render, staticRenderFns } = compileToFunctions(template, {
        warn,
        shouldDecodeNewlines,
        delimiters: options.delimiters
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
