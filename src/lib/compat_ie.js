/* eslint-disable */
export default function compat_ie() {
  /**
   *作用：兼容dataset
   *问题：[Vue warn]: Error in directive transfer-dom inserted hook: "TypeError: 无法获取未定义或 null 引用的属性“transfer”"
   *说明：ie10及以下不支持dataset，以下代码处理兼容
   * */
  if (window.HTMLElement) {
    if (
      Object.getOwnPropertyNames(HTMLElement.prototype).indexOf("dataset") ===
      -1
    ) {
      Object.defineProperty(HTMLElement.prototype, "dataset", {
        get: function() {
          var attributes = this.attributes; // 获取节点的所有属性
          var name = [];
          var value = []; // 定义两个数组保存属性名和属性值
          var obj = {}; // 定义一个空对象
          for (var i = 0; i < attributes.length; i++) {
            // 遍历节点的所有属性
            if (attributes[i].nodeName.slice(0, 5) === "data-") {
              // 如果属性名的前面5个字符符合"data-"
              // 取出属性名的"data-"的后面的字符串放入name数组中
              name.push(attributes[i].nodeName.slice(5));
              // 取出对应的属性值放入value数组中
              value.push(attributes[i].nodeValue);
            }
          }
          for (var j = 0; j < name.length; j++) {
            // 遍历name和value数组
            obj[name[j]] = value[j]; // 将属性名和属性值保存到obj中
          }
          return obj; // 返回对象
        },
      });
    }
  }

  /**
   *作用：兼容requestAnimationFrame（ie9）
   *问题：
   *说明：ie9是不支持requestAnimationFrame的，以下代码处理兼容
   * */
  (function() {
    var lastTime = 0;
    var vendors = ["ms", "moz", "webkit", "o"];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame =
        window[vendors[x] + "RequestAnimationFrame"];
      window.cancelAnimationFrame =
        window[vendors[x] + "CancelAnimationFrame"] ||
        window[vendors[x] + "CancelRequestAnimationFrame"];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  })();

  /**
   *作用：兼容classList（ie9）
   *错误信息： 无法获取未定义或 null 引用的属性“add”/  无法获取未定义或 null 引用的属性“remove”
   *说明：ie9以下代码处理兼容
   * */
  if (!("classList" in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, "classList", {
      get: function() {
        var self = this;
        function update(fn) {
          return function(value) {
            var classes = self.className.split(/s+/g);
            var index = classes.indexOf(value);

            fn(classes, index, value);
            self.className = classes.join(" ");
          };
        }

        return {
          add: update(function(classes, index, value) {
            if (!~index) classes.push(value);
          }),

          remove: update(function(classes, index) {
            if (~index) classes.splice(index, 1);
          }),

          toggle: update(function(classes, index, value) {
            if (~index) {
              classes.splice(index, 1);
            } else {
              classes.push(value);
            }
          }),

          contains: function(value) {
            return !!~self.className.split(/s+/g).indexOf(value);
          },

          item: function(i) {
            return self.className.split(/s+/g)[i] || null;
          },
        };
      },
    });
  }
}
