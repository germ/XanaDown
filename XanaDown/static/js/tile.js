/**
 * tile.js
 *
 * A module for tiling interact.js clients
 */
'use strict';

/* Synchronize animation period across the module */
var _duration = 200;

/* On interaction, elements are moved to the front */
var _max_zindex = 1;

/* Module container */
/** @namespace */
var tile = { };

tile._active;          // Current active strategy
tile.listeners = [];   // Listener functions, to be notified on strategy change

/**
 * @summary Tiling strategies.
 *
 * @description
 * A strategy must provide four functions:
 * <ul>
 * <li> apply, called when the strategy is first activated,
 * <li> update, called whenever elements need to be checked,
 * <li> show_doc, called when a hidden document is made visible, and
 * <li> hide_doc, called when a visible document is hidden
 * </ul>
 *
 * @typedef {object} strategy
 * @namespace tile.strategies
 */
tile.strategies = {};

/**
 * @summary Float strategy
 *
 * @description No layout authority, just drag n' drop wherever.
 * Documents can be resized with handles.
 *
 * @type {strategy}
 */
tile.strategies.float = {
    'apply': function() {
        interact('.document')
            .draggable({
                onstart: _to_front,
                onmove: _drag_move,
            })
            .resizable({
                edges: { left: true,
                         right: true,
                         bottom: true,
                         top: false
                       },
            })
            .on('resizemove', _resize_move)
            .ignoreFrom('.wrapper');
    },
    'update': function() {},
    'add_doc': function(doc) {
        /* Add to a random spot in the window */
        var top = $('#top')[0].getBoundingClientRect();
        var x = Math.random() * (top.width - 400);
        var y = Math.random() * (top.height - 400);
        _update_location(doc, x, y);
        doc.css('z-index', 0).appendTo('#top');
    },
    /* Documents fade in and out */
    'show_doc': function(doc, cb) {
        $(doc).fadeIn(_duration, cb);
    },
    'hide_doc': function(doc, cb) {
        $(doc).fadeOut(_duration, cb);
    }
}

/**
 * @summary Stack strategy
 *
 * @description The screen is split into left and right columns, with a gap
 * in-between. Xanadocs are stacked on the left, sourcedocs on the
 * right. Stacked documents have equal size, and may be re-ordered by
 * dragging. The divider gap may also be dragged and resized.
 *
 * @type {strategy}
 */
tile.strategies.stack = {
    'apply': function() {
        /* Create tiling infrastructure */
        $('#tiling').append(
            $('<div class="tile-col-wrap">').append(
                $('<div id="col-left" class="tile-col">')
            )
        ).append(
            $('<div class="tile-col-gap tile-interact">')
        ).append(
            $('<div class="tile-col-wrap">').append(
                $('<div id="col-right" class="tile-col">')
            )
        );

        /* Tile gap is resizable */
        interact('.tile-col-gap')
            .draggable({
                onmove: function(event) {
                    var left = $('#col-left').parent()[0];
                    var right = $('#col-right').parent()[0];

                    /* Why divide by 1.3? Not sure, but the tracking is off if you don't. */
                    left.style.flex = (left.offsetWidth + event.dx/1.3) + 'px';
                    right.style.flex = (right.offsetWidth - event.dx/1.3) + 'px';
                    tile.update();
                }
            })
            .resizable({
                edges: {
                    left:   true,
                    right:  true,
                    top:    false,
                    bottom: false
                },
                restrictSize: {
                    min: {
                        width:  20,
                        height: 20
                    }
                }
            }).on('resizemove', function(event) {
                var target = event.target;
                target.style.flex = Math.max(event.rect.width, 20) + 'px';
                tile.update();
            });

        /* Sourcedocs can be dragged to tiles */
        interact('#col-right .stack-tile')
            .dropzone({
                accept: '.document.sourcedoc',
                overlap: '0.5',

                ondragenter: function(event) {
                    var dragged = event.relatedTarget,
                        zone = event.target;
                    if (zone !== dragged._tile) {
                        var swapping = zone._doc;
                        var old_tile = dragged._tile;
                        dragged._tile = zone;
                        zone._doc = dragged;
                        swapping._tile = old_tile;
                        old_tile._doc = swapping;
                        swapping._tile_snap();
                    }
                },
            });
        interact('.document.sourcedoc')
            .draggable({
                onstart: _to_front,
                onmove: _drag_move,
                onend: tile.update
            })
            .ignoreFrom('.wrapper');

        /* Create tiles for visible documents */
        _stack($('.document.xanadoc:visible'), $('#col-left'));
        _stack($('.document.sourcedoc:visible'), $('#col-right'));
    },
    'update': function() {
        /* Snap all visible tiles */
        $('.tiled:visible').each(function() {
            this._tile_snap();
        });
    },
    'add_doc': function(doc) {
        doc.css('z-index', 0).appendTo('#top');
    },
    'show_doc': function(doc, cb) {
        /* Create tile for doc */
        if ($(doc).is('.document.xanadoc')) {
            _stack($(doc), $('#col-left'));
        } else {
            _stack($(doc), $('#col-right'));
        }

        var col = $(doc._tile).closest('.tile-col');
        if (col.children().length === 1) {
            /* If only one tile is in the column, detach and animate in-place */
            _resize_move({
                target: doc._tile,
                rect: doc._tile.getBoundingClientRect()
            });
            $(doc._tile)
                .appendTo('#top')
                .css('position', 'absolute');
        }

        /* Transition in */
        $(doc._tile)
            .stop()
            .hide()
            .slideDown({
                duration: _duration,
                progress: tile.update,
                complete: function() {
                    /* In case we detached this before */
                    $(this)
                        .removeAttr('style')
                        .appendTo(col);
                    cb();
                }
            });
        $(doc).show();

    },
    'hide_doc': function(doc, cb) {
        if ($(doc._tile).closest('.tile-col').children().length === 1) {
            /* If only one tile is in the column, detach and animate in-place */
            _resize_move({
                target: doc._tile,
                rect: doc._tile.getBoundingClientRect()
            });
            $(doc._tile)
                .appendTo('#top')
                .css('position', 'absolute');
        }

        /* Remove tile and transition out */
        $(doc._tile)
            .stop()
            .slideUp({
                duration: _duration,
                progress: tile.update,
                complete: function() {
                    $(doc).hide();
                    $(doc).removeClass('tiled');
                    $(this).remove();
                    cb();
                }
            });
    }
}

/**
 * @summary Create tiling elements for each selected element
 *
 * @description This does book-keeping for the stack strategy.
 *
 * @param {selector} sel - jQuery selector of elements.
 * @param {selector} col - jQuery selector of the column to which the selected
 * elements should be added.
 */
function _stack(sel, col) {
    /* Append tiles for each selected element */
    sel.each(function() {
        var div = $('<div class="tile stack-tile tile-interact">');
        this._tile = div[0];
        this._tile._doc = this;
        this._tile_snap = function() {
            _resize_move({
                'target' : this,
                'rect'   : this._tile.getBoundingClientRect()
            });
        };
        col.append(div);
        $(this).addClass('tiled');
    });
}

/**
 * @summary Move an element to the maximum z-index
 *
 * @param {Object} event - interact.js event object
 */
function _to_front(event) {
    $(event.target).css('z-index', _max_zindex++);
    $('.tile-fg').css('z-index', _max_zindex);
}

/**
 * @summary Event listener for drag-motion events
 *
 * @param {Object} event - interact.js event object
 */
function _drag_move(event) {
    var target = $(event.target),
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.attr('data-x')) || 0) + event.dx,
        y = (parseFloat(target.attr('data-y')) || 0) + event.dy;

    _update_location(target, x, y);

    update();
}

/**
 * @summary Event listener for resize events
 *
 * @param {Object} event - interact.js event object
 */
function _resize_move(event) {
    var target = $(event.target),
            x = (parseFloat(target.attr('data-x')) || 0),
            y = (parseFloat(target.attr('data-y')) || 0);

    // update the element's style
    target
        .css('width', `${event.rect.width}px`)
        .css('height', `${event.rect.height}px`);

    if (event.deltaRect) {
        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;
    } else {
        // absolute positioning
        x = event.rect.x;
        y = event.rect.y;
    }

    _update_location(target, x, y);

    update();
}

/**
 * @summary Update a draggable element's location (tracked for interact.js)
 *
 * @param {selector} target - jQuery selector for the element to update
 * @param {numeric} x - New screen x-coordinate of element.
 * @param {numeric} y - New screen y-coordinate of element.
 */
function _update_location(target, x, y) {
    target
        .attr('data-x', x)
        .attr('data-y', y)
        .css('transform', `translate(${x}px,${y}px)`);
}

/**
 * Activate the next strategy.
 */
tile.next_strategy = function() {
    var keys = Object.keys(tile.strategies);
    var idx = keys.indexOf(
        keys.find(key => tile.strategies[key] === tile._active)
    );
    tile.set_strategy(tile.strategies[keys[(idx + 1) % keys.length]]);
}

/**
 * Switch to a new strategy.
 * @param {strategy} strategy - The strategy to activate.
 */
tile.set_strategy = function(strategy) {
    interact('.document').unset();
    interact('.tile-interact').unset();
    $('#tiling').children().remove();
    tile._active = strategy;
    strategy.apply();
    strategy.update();
    update();
    var label = Object.keys(tile.strategies).find(k => tile.strategies[k] === strategy);
    $('#tile-strat-ctl')
        .attr('title', "Layout: " + label)
        .attr('data-tile-layout', label);
    tile.listeners.forEach(fn => fn(label));
}

/**
 * Add a listener function to be notified after the tiling strategy changes.
 * @param {strategy_listener} listener - A function to call with the name of the new strategy.
 */
tile.add_strategy_listener = function(listener) {
    tile.listeners.push(listener);
}
/**
 * Called after the tiling strategy changes. See `tile.add_strategy_listener`.
 * @callback strategy_listener
 * @param {string} name - The name of the new tiling strategy.
 */

/**
 * Add a new document to the active tiling strategy
 */
tile.add_doc = function(doc) {
    tile._active.add_doc(doc);
}

/**
 * Notify the active tiling strategy that elements have been moved or resized.
 * For instance, after the window is resized, or after a tiled element has been
 * dragged to a new tile.
 */
tile.update = function() {
    tile._active.update();
}

/**
 * Display or hide a document using the active tiling strategy.
 * @param {Object} doc - DOM element representing the document.
 * @param {boolean} [state] - Use `true` to show the document or `false` to hide it. Defaults to toggling.
 * @param {callback} [callback] - Callback function to call when toggle animation is complete.
 */
tile.toggle_doc = function(doc, state, callback) {
    /* If passed a selector, dereference first object */
    doc = $(doc).get(0);
    var cb = function() {
        tile.update();
        if(callback) {
            callback();
        }
    };
    if ($(doc).is(':hidden')) {
        if (state === false) {
            cb();
        } else {
            tile._active.show_doc(doc, cb);
        }
    } else {
        if (state === true) {
            cb();
        } else {
            tile._active.hide_doc(doc, cb);
        }
    }
}

/* Default tiling strategy. Will be applied on call to init() */
var _default_strategy = tile.strategies.stack;

/**
 * Initialize the tiling module.
 * Sets the default strategy and shows the strategy control widget.
 * Call this when the document is loaded.
 */
tile.init = function() {
    $('#tile-strat-ctl').click(tile.next_strategy);
    tile.set_strategy(_default_strategy);
}

/* Module exports */
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = tile;
    }
    exports.tile = tile;
}
