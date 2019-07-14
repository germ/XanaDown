/**
 * app.js
 *
 * Wormwood Xanaviewer application logic
 */
'use strict';

/* Time to display information alerts before removing */
var _info_life_ms = 2000;

var _docid = 0;

/**
 * @summary Construct a new UI alert element.
 *
 * @description Use {@link show_info} and {@show_error} instead.
 *
 * @param {string} text - The text of the alert.
 * @param {string} level - Alert level ("info", "warning", "alert")
 */
function _make_alert(text, level) {
    var template = Handlebars.compile($('#alert-template').html());
    var alert = $(template({
        text:  text,
        level: level
    }));
    return alert;
}

/**
 * @summary Display a UI alert element to the user in the alerts area.
 *
 * @description Use {@link show_info} and {@show_error} instead.
 *
 * @param {Object} alert - The alert to show.
 * @see _make_alert
 */
  function _show_alert(alert) {
    alert.hide().appendTo('#alerts').fadeIn(100);
}

/**
 * @summary Display a new UI info alert in the alerts area.
 *
 * @description Info alerts are "low-priority" and will automatically fade out
 * after a short period.
 *
 * @param {string} text - The alert message.
 */
function show_info(text) {
    var alert = _make_alert(text, 'info');
    _show_alert(alert);
    alert.delay(_info_life_ms).fadeOut(400, function() { $(this).remove(); });
}

/**
 * @summary Display a new UI error alert in the alerts area.
 *
 * @description Info alerts are "high-priority" and will remain until manually
 * dismissed by the user.
 *
 * @param {string} text - The alert message.
 */
function show_error(text) {
    _show_alert(_make_alert(text, 'danger'));
}

/**
 * @summary Update the displays of visible bridges.
 *
 * @description This is called periodically. If you find that bridges are
 * "sticking," you should probably be calling this somewhere you aren't. Note
 * that this will redraw bridges for all elements, <b>which may be
 * expensive!</b>
 */
function update() {
    $('.xan-bridge:visible').each(function() {
        update_bridge(this);
    });
}

/**
 * @summary Draw the bridge between two xanadoc elements, e.g. a transclusion
 * and its source.
 *
 * @description The path of the bridge is computed from the bounding boxes of
 * the source and destination elements, then drawn to an svg path element. The
 * path is actually drawn twice: once for the outline, and once for the fill --
 * as far as I can tell, there's no way to just show the top and bottom strokes
 * of the path without screwing with the fill. This behavior could be
 * optimized...
 *
 * @param {g} bridge - The svg <g> element of the bridge to redraw.
 */
function update_bridge(bridge) {
    var points = []

    var h1 = $(bridge.getAttribute('data-bridge-src'))[0];
    var h2 = $(bridge.getAttribute('data-bridge-dest'))[0];

    if ( !(h1 && h2) ) {
        return;  // because we skipped the large document
    }

    var rect1 = h1.getBoundingClientRect();
    var rect2 = h2.getBoundingClientRect();

    var h1_x_center = rect1.right - rect1.width / 2;
    var h2_x_center = rect2.right - rect2.width / 2;

    var h_l, h_r, rect_l, rect_r;
    if (h1_x_center < h2_x_center) {
        h_l = h1;
        h_r = h2;
        rect_l = rect1;
        rect_r = rect2;
    } else {
        h_l = h2;
        h_r = h1;
        rect_l = rect2;
        rect_r = rect1;
    }
    h_l.setAttribute('data-bridge-side', 'left');
    h_r.setAttribute('data-bridge-side', 'right');

    var body_l = $(h_l).closest(".body").get(0).getBoundingClientRect();
    var body_r = $(h_r).closest(".body").get(0).getBoundingClientRect();

    var left_bottom = rect_l.bottom - 1;
    if(left_bottom < body_l.top) {
        left_bottom = body_l.top;
    } else if (left_bottom > body_l.bottom) {
        left_bottom = body_l.bottom;
    }

    var left_top = rect_l.top + 1;
    if(left_top < body_l.top) {
        left_top = body_l.top;
    } else if (left_top > body_l.bottom) {
        left_top = body_l.bottom;
    }

    var right_bottom = rect_r.bottom - 1;
    if(right_bottom < body_r.top) {
        right_bottom = body_r.top;
    } else if (right_bottom > body_r.bottom) {
        right_bottom = body_r.bottom;
    }

    var right_top = rect_r.top + 1;
    if(right_top < body_r.top) {
        right_top = body_r.top;
    } else if (right_top > body_r.bottom) {
        right_top = body_r.bottom;
    }

    var gap = Math.abs(rect_r.left - rect_l.right) / 1.8;
    var x2 = rect_l.right + gap;
    var x3 = rect_r.left - gap;

    var curve1 = rect_l.right + ',' + left_top
        + 'C' + x2 + ',' + left_top
        + ' ' + x3 + ',' + right_top
        + ' ' + rect_r.left + ',' + right_top;
    var curve2 = rect_r.left + ',' + right_bottom
        + 'C' + x3 + ',' + right_bottom
        + ' ' + x2 + ',' + left_bottom
        + ' ' + rect_l.right + ',' + left_bottom;

    $(bridge).children('.bridge-stroke').attr('d', `M${curve1}M${curve2}`);
    $(bridge).children('.bridge-fill').attr('d', `M${curve1}L${curve2}Z`);
}

/**
 * @summary Construct a container for a new document and add to the DOM.
 *
 * @param {Object} doc - An object specifying the properties of the document to
 * create. Expected fields are:
 * <ul>
 * <li> {string} heading - The header to show on the titlebar of the container.
 * <li> {string} doctype - One of ("sourcedoc", "xanadoc").
 * <li> {string} text    - The text of the document.
 * <li> {string} url - (Optional) The URL from which the document was
 * retrieved. Used to display the source on request.
 * </ul>
 */
function new_document(doc) {
    var template = Handlebars.compile($("#document-template").html());
    _docid++;
    var context  = {
        docid: _docid,
        heading: doc.heading,
        doctype: doc.doctype,
        text: doc.text,
        decorated: doc.doctype === "sourcedoc",
        url: doc.url
    };
    var element = $(template(context));

    $(element).find('a').each(function() {
        var href = this.getAttribute('href');
        if (href.startsWith('#')) {
            // Fragment link -- scroll doc to fragment
            this.setAttribute('onClick', `scroll_doc($('${href}')); return false;`);
        } else {
            // Normal jumplink -- open in new tab
            this.setAttribute('target', '_blank');
        }
    });
    tile.add_doc(element);
}

/**
 * @summary Reset the viewer, removing all displayed documents.
 */
function reset() {
    $(".document").remove();
    $('#svg').children().remove();
}

/**
 * @summary Toggle bridge element display on hover.
 *
 * @description This "fills-in" the display elements of the bridge, its source,
 * and its destination.
 *
 * @param {selector} element - jQuery selector of the hovered element. Should be
 * a sourcedoc or xanadoc link or transclusion, or the bridge between them.
 */
function hover_bridge(element, hover) {
    var bridge = $(element.getAttribute('data-bridge-id'));

    bridge
        .add(bridge.attr('data-bridge-src'))
        .add(bridge.attr('data-bridge-dest'))
        .toggleClass('xan-hover', hover);

}

/**
 * @summary Scroll the body of a document to an element contained within.
 *
 * @param {selector} target - jQuery selector of the element to scroll to.
 */
function scroll_doc(target) {
    var body = target.closest('.body');
    var scroll_offset = target.offset().top - body.offset().top + body.scrollTop();
    if (scroll_offset != 0) {
        body.animate({
            scrollTop: scroll_offset
        }, 400);
    }
}

/**
 * @summary Toggle the display of a document.
 *
 * @param {selector} source - jQuery selector of the .document to toggle.
 * @param {boolean} state - (Optional) Desired visibility state of the
 * @param {function} callback - Callback to call when animation is finished.
 * document. By default, visibility is toggled.
 */
function toggle_doc(source, state, callback) {
    tile.toggle_doc(source, state, callback);
    source.find('.sourcedoc.link,.sourcedoc.transclusion')
        .map(function() {
            return $(this.getAttribute('data-bridge-id'))[0];
        }).stop().fadeToggle(100).each(function() {
            $(this.getAttribute('data-bridge-src'))
                .add(this.getAttribute('data-bridge-dest'))
                .toggleClass('bridged', state);
        });
}

/**
 * @summary Send a request for a xanadoc to the server.
 *
 * @description This will query the server with some form of xanadoc
 * specification/markup -- see the server documentation for more info. On
 * success, the xanadoc contained in the response will be prepared for viewing
 * and inserted into the DOM.
 *
 * @param {Object} data - Request object. Valid requests include:
 * <ul>
 * <li> `url`
 * <li> `edl`
 * </ul>
 * But this is subject to change.
 */
function fulfil(data) {
    /* Clear all documents and bridges */
    reset();

    /* Show a loading message */
    var msg;
    if ('url' in data) {
        msg = "Loading xanadoc from " + data['url'] + "...";
    } else {
        msg = "Loading xanadoc...";
    }
    var alert = _make_alert(msg, 'info');
    alert.attr('id', 'loading-alert').addClass('lbl-loading');
    _show_alert(alert);

    /* Make the query */
    $.getJSON(fulfil_edl_path, data, function(data) {
        /* Initialize tiling */
        tile.init();
        tile.add_strategy_listener(function(strat) {
            show_info(`Switched to "${strat}" layout.`);
        });

        /* Display an error alert for each compilation error */
        data.errors.forEach(function(err, idx) {
            show_error(err);
        });

        /* Build bridges for each transclusion and each xanalink */
        function make_bridge() {
            return $(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
                .hide()
                .addClass('xan-bridge')
                .mouseover(function(e) {
                    hover_bridge(this, true);
                })
                .mouseout(function(e) {
                    hover_bridge(this, false);
                })
                .append(
                    $(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
                        .addClass('bridge-stroke')
                )
                .append(
                    $(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
                        .addClass('bridge-fill')
                )
                .appendTo($('#svg'));
        }

        for(var i = 0; i < data.span_count; i++) {
            make_bridge()
                .addClass('bridge')
                .attr('id', `bridge${i}`)
                .attr('data-bridge-src', `#span${i}`)
                .attr('data-bridge-dest', `#transclusion${i}`);
        }

        for(var i = 0; i < data.link_count; i++) {
            make_bridge()
                .addClass('linkbridge')
                .attr('id', `linkbridge${i}`)
                .attr('data-bridge-src', `#xanalink${i}`)
                .attr('data-bridge-dest', `#link${i}`);
        }

        /* Construct sourcedoc & xanadoc containers */
        data.source.forEach(function(doc) {
            if (doc.text) {
                doc.heading += " (source document)";
                doc.doctype = 'sourcedoc';
                new_document(doc);
            }
        });
        new_document({'heading': 'xanadoc',
                      'text': data.doc,
                      'doctype': 'xanadoc',
                      'url': data.src_url});

        /* Set `data-bridge-id` attr for all elements of each bridge */
        $('.xan-bridge').each(function() {
            $(this.getAttribute('data-bridge-src'))
                .add(this.getAttribute('data-bridge-dest'))
                .add(this)
                .attr('data-bridge-id', '#' + this.id);
        });

        update();

        /* Link & transclusion functionality */
        $('.transclusion,.link')
            .mouseover(function(e) {
                hover_bridge(this, true);
            })
            .mouseout(function(e) {
                hover_bridge(this, false);
            });

        $('.xanadoc.link,.xanadoc.transclusion')
            .click(function(e) {
                var dest = $($(this.getAttribute('data-bridge-id')).attr('data-bridge-dest'));
                var source = dest.closest(".document.sourcedoc");

                var state = source.is(':visible');
                toggle_doc(source, !state, function() {
                    scroll_doc(dest);
                    update();
                });

            });

        /* Update display on scroll */
        $('.body').bind('scroll', function(event) {
            update();
        });

        /* Hide all documents */
        $('.document').hide();
        /* ... But display the xanadoc */
        tile.toggle_doc($('.document.xanadoc'));

        /* Done loading! */
        $('#loading-alert').fadeOut();
    });
}

$(function() {
    /* Update tiling on window resize */
    $(window).resize(function() {
        tile.update();
    });
});
