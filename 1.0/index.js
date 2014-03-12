/**
 * @fileoverview 
 * @author 昊川<gonghao.gh@alibaba-inc.com>
 * @module KEasyDrag
 **/
KISSY.add(function (S, Node, Base) {
    var EMPTY = '';
    var $ = Node.all;

    // 判断鼠标是否按下
    var isMouseDown = false;

    // 记录目前 drag 的元素
    var currentElement = null;

    // callbacks
    var dropCallbacks = {};
    var dragCallbacks = {};

    // bubbling 状态
    var bubbling = {};

    var lastMouseX;
    var lastMouseY;
    var lastElemTop;
    var lastElemLeft;

    // 记录元素 dragStatus
    var dragStatus = {};

    // 限制元素
    var dragConstrain = {};

    // 历史
    var oldj = {};

    var holdingHandler = false;

    // 获得目前鼠标的位置
    var getMousePosition = function(e) {
        var posx = 0;
        var posy = 0;
        var e = e || window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft;
            posy = e.clientY + document.body.scrollTop;
        }

        return {'x': posx, 'y': posy};
    }

    // 在 drag 后更新当前元素的位置
    var updatePosition = function(e) {
        var pos = getMousePosition(e);

        var spanX = (pos.x - lastMouseX);
        var spanY = (pos.y - lastMouseY);
        if (!oldj) {
            oldj = {}
        }
        if (oldj.stopDragParent) {
            return;
        }

        var top = (lastElemTop + spanY),
            left = (lastElemLeft + spanX);

        var container = dragConstrain[currentElement.id];
        if (container) {
            var offset = container.offset(),
                width = container.width(),
                height = container.height(),
                cwidth = $(currentElement).width(),
                cheight = $(currentElement).height();

            if (left < offset.left) {
                left = offset.left;
            } else if (left + cwidth > offset.left + width) {
                left = offset.left + width - cwidth;
            }

            if (top < offset.top) {
                top = offset.top;
            } else if (top + cheight > offset.top + height) {
                top = offset.top + height - cheight;
            }
        }

        oldj.easydragTop = top;
        oldj.easydragLeft = left;

        $(currentElement).css("top", oldj.easydragTop);
        $(currentElement).css("left", oldj.easydragLeft);
    }

    $(document).on('mousemove', function(e) {
        if (isMouseDown && dragStatus[currentElement.id] != false) {
            updatePosition(e);
            if (dragCallbacks[currentElement.id] != undefined) {
                dragCallbacks[currentElement.id](e, currentElement);
            }
            return false;
        }
    });

    $(document).on('mouseup', function(e) {
        if (isMouseDown && dragStatus[currentElement.id] != false) {
            isMouseDown = false;
            if (dropCallbacks[currentElement.id] != undefined) {
                dropCallbacks[currentElement.id](e, currentElement);
            }
            return false;
        }
    })
    /**
     * 
     * @class KEasyDrag
     * @constructor
     * @extends Base
     */
    function KEasyDrag(comConfig) {
        var self = this;
        //调用父类构造函数
        KEasyDrag.superclass.constructor.call(self, comConfig);
        self.easydrag();
    }
    S.extend(KEasyDrag, Base, /** @lends KEasyDrag.prototype*/{

        ondrag: function(callback) {
            var $el = this.get('elems');

            S.each($el, function(elem) {
                dragCallbacks[elem.id] = callback;
            });
            return this;
        },

        ondrop: function(callback) {
            var $el = this.get('elems');

            S.each($el, function(elem) {
                dropCallbacks[elem.id] = callback;
            });
            return this;
        },

        dragoff: function() {
            var $el = this.get('elems');

            S.each($el, function(elem) {
                dragStatus[elem.id] = 'off';
            });
            return this;
        },

        dragOn: function() {
            var $el = this.get('elems');

            S.each($el, function(elem) {
                dragStatus[elem.id] = 'on';
            });
            return this;
        },

        setHandler: function(handlerId) {

            var $el = this.get('elems');

            S.each($el, function(elem) {
                bubbling[elem.id] = true;
                $(elem).css("cursor", "");
                dragStatus[elem.id] = "handler"
                $(handlerId).css("cursor", "move");
                $(handlerId).on('mousedown', function(e) {
                    holdingHandler = true;
                    $(elem).fire('mousedown', e);
                });
                $(handlerId).on('mouseup', function(e) {
                    holdingHandler = false;
                });
            });
            return this;
        },

        setConstrain: function(container) {
            var $el = this.get('elems');

            S.each($el, function(elem) {
                dragConstrain[elem.id] = $(container);
            });
            return this;
        },

        easydrag: function() {

            var $el = this.get('elems'),
                allowBubbling = this.get('allowBubbling');

            S.each($el, function(elem) {
                if (undefined == elem.id || !elem.id.length) {
                    elem.id = "easydrag" + (+new Date());
                }
                bubbling[elem.id] = allowBubbling ? true : false;
                dragStatus[elem.id] = "on";
                $(elem).css("cursor", "move");
                $(elem).on("mousedown", function(e) {
                    if ((dragStatus[elem.id] == "off") || (dragStatus[elem.id] == "handler" && !holdingHandler)) {
                        return bubbling[elem.id];
                    }
                    $(elem).css("position", "absolute");
                    $(elem).css("z-index", parseInt(new Date().getTime() / 1000));

                    isMouseDown = true;
                    currentElement = this;

                    var pos = getMousePosition(e);
                    lastMouseX = pos.x;
                    lastMouseY = pos.y;

                    lastElemTop = elem.offsetTop;
                    lastElemLeft = elem.offsetLeft;

                    updatePosition(e);
                });
            });
            return this;
        }

    }, {
        ATTRS : /** @lends KEasyDrag*/{
            elems: {
                value: '',
                setter: function(el) {
                    return $(el);
                }
            },

            allowBubbling: {
                value: false
            }
        }
    });
    return KEasyDrag;
}, {
    requires:[
        'node',
        'base'
    ]
});



