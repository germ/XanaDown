import browser from './browser';
import domObjects from './domObjects';
import * as is from './is';
import win from './window';
export function nodeContains(parent, child) {
    while (child) {
        if (child === parent) {
            return true;
        }
        child = child.parentNode;
    }
    return false;
}
export function closest(element, selector) {
    while (is.element(element)) {
        if (matchesSelector(element, selector)) {
            return element;
        }
        element = parentNode(element);
    }
    return null;
}
export function parentNode(node) {
    let parent = node.parentNode;
    if (is.docFrag(parent)) {
        // skip past #shado-root fragments
        // tslint:disable-next-line
        while ((parent = parent.host) && is.docFrag(parent)) {
            continue;
        }
        return parent;
    }
    return parent;
}
export function matchesSelector(element, selector) {
    // remove /deep/ from selectors if shadowDOM polyfill is used
    if (win.window !== win.realWindow) {
        selector = selector.replace(/\/deep\//g, ' ');
    }
    return element[browser.prefixedMatchesSelector](selector);
}
const getParent = (el) => el.parentNode ? el.parentNode : el.host;
// Test for the element that's "above" all other qualifiers
export function indexOfDeepestElement(elements) {
    let deepestZoneParents = [];
    let dropzoneParents = [];
    let dropzone;
    let deepestZone = elements[0];
    let index = deepestZone ? 0 : -1;
    let parent;
    let child;
    let i;
    let n;
    for (i = 1; i < elements.length; i++) {
        dropzone = elements[i];
        // an element might belong to multiple selector dropzones
        if (!dropzone || dropzone === deepestZone) {
            continue;
        }
        if (!deepestZone) {
            deepestZone = dropzone;
            index = i;
            continue;
        }
        // check if the deepest or current are document.documentElement or document.rootElement
        // - if the current dropzone is, do nothing and continue
        if (dropzone.parentNode === dropzone.ownerDocument) {
            continue;
        }
        // - if deepest is, update with the current dropzone and continue to next
        else if (deepestZone.parentNode === dropzone.ownerDocument) {
            deepestZone = dropzone;
            index = i;
            continue;
        }
        if (!deepestZoneParents.length) {
            parent = deepestZone;
            while (getParent(parent) && getParent(parent) !== parent.ownerDocument) {
                deepestZoneParents.unshift(parent);
                parent = getParent(parent);
            }
        }
        // if this element is an svg element and the current deepest is
        // an HTMLElement
        if (deepestZone instanceof domObjects.HTMLElement &&
            dropzone instanceof domObjects.SVGElement &&
            !(dropzone instanceof domObjects.SVGSVGElement)) {
            if (dropzone === deepestZone.parentNode) {
                continue;
            }
            parent = dropzone.ownerSVGElement;
        }
        else {
            parent = dropzone;
        }
        dropzoneParents = [];
        while (parent.parentNode !== parent.ownerDocument) {
            dropzoneParents.unshift(parent);
            parent = getParent(parent);
        }
        n = 0;
        // get (position of last common ancestor) + 1
        while (dropzoneParents[n] && dropzoneParents[n] === deepestZoneParents[n]) {
            n++;
        }
        const parents = [
            dropzoneParents[n - 1],
            dropzoneParents[n],
            deepestZoneParents[n],
        ];
        child = parents[0].lastChild;
        while (child) {
            if (child === parents[1]) {
                deepestZone = dropzone;
                index = i;
                deepestZoneParents = [];
                break;
            }
            else if (child === parents[2]) {
                break;
            }
            child = child.previousSibling;
        }
    }
    return index;
}
export function matchesUpTo(element, selector, limit) {
    while (is.element(element)) {
        if (matchesSelector(element, selector)) {
            return true;
        }
        element = parentNode(element);
        if (element === limit) {
            return matchesSelector(element, selector);
        }
    }
    return false;
}
export function getActualElement(element) {
    return (element instanceof domObjects.SVGElementInstance
        ? element.correspondingUseElement
        : element);
}
export function getScrollXY(relevantWindow) {
    relevantWindow = relevantWindow || win.window;
    return {
        x: relevantWindow.scrollX || relevantWindow.document.documentElement.scrollLeft,
        y: relevantWindow.scrollY || relevantWindow.document.documentElement.scrollTop,
    };
}
export function getElementClientRect(element) {
    const clientRect = (element instanceof domObjects.SVGElement
        ? element.getBoundingClientRect()
        : element.getClientRects()[0]);
    return clientRect && {
        left: clientRect.left,
        right: clientRect.right,
        top: clientRect.top,
        bottom: clientRect.bottom,
        width: clientRect.width || clientRect.right - clientRect.left,
        height: clientRect.height || clientRect.bottom - clientRect.top,
    };
}
export function getElementRect(element) {
    const clientRect = getElementClientRect(element);
    if (!browser.isIOS7 && clientRect) {
        const scroll = getScrollXY(win.getWindow(element));
        clientRect.left += scroll.x;
        clientRect.right += scroll.x;
        clientRect.top += scroll.y;
        clientRect.bottom += scroll.y;
    }
    return clientRect;
}
export function getPath(node) {
    const path = [];
    while (node) {
        path.push(node);
        node = parentNode(node);
    }
    return path;
}
export function trySelector(value) {
    if (!is.string(value)) {
        return false;
    }
    // an exception will be raised if it is invalid
    domObjects.document.querySelector(value);
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkb21VdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBQzFCLE9BQU8sR0FBRyxNQUFNLFVBQVUsQ0FBQTtBQUUxQixNQUFNLFVBQVUsWUFBWSxDQUFFLE1BQVksRUFBRSxLQUFXO0lBQ3JELE9BQU8sS0FBSyxFQUFFO1FBQ1osSUFBSSxLQUFLLEtBQUssTUFBTSxFQUFFO1lBQ3BCLE9BQU8sSUFBSSxDQUFBO1NBQ1o7UUFFRCxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQTtLQUN6QjtJQUVELE9BQU8sS0FBSyxDQUFBO0FBQ2QsQ0FBQztBQUVELE1BQU0sVUFBVSxPQUFPLENBQUUsT0FBTyxFQUFFLFFBQVE7SUFDeEMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzFCLElBQUksZUFBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRTtZQUFFLE9BQU8sT0FBTyxDQUFBO1NBQUU7UUFFMUQsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUM5QjtJQUVELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQUVELE1BQU0sVUFBVSxVQUFVLENBQUUsSUFBSTtJQUM5QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFBO0lBRTVCLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN0QixrQ0FBa0M7UUFDbEMsMkJBQTJCO1FBQzNCLE9BQU8sQ0FBQyxNQUFNLEdBQUksTUFBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDNUQsU0FBUTtTQUNUO1FBRUQsT0FBTyxNQUFNLENBQUE7S0FDZDtJQUVELE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUUsT0FBTyxFQUFFLFFBQVE7SUFDaEQsNkRBQTZEO0lBQzdELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsVUFBVSxFQUFFO1FBQ2pDLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQTtLQUM5QztJQUVELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzNELENBQUM7QUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQTtBQUVqRSwyREFBMkQ7QUFDM0QsTUFBTSxVQUFVLHFCQUFxQixDQUFFLFFBQVE7SUFDN0MsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUE7SUFDM0IsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFBO0lBQ3hCLElBQUksUUFBUSxDQUFBO0lBQ1osSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdCLElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNoQyxJQUFJLE1BQU0sQ0FBQTtJQUNWLElBQUksS0FBSyxDQUFBO0lBQ1QsSUFBSSxDQUFDLENBQUE7SUFDTCxJQUFJLENBQUMsQ0FBQTtJQUVMLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRXRCLHlEQUF5RDtRQUN6RCxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsS0FBSyxXQUFXLEVBQUU7WUFDekMsU0FBUTtTQUNUO1FBRUQsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNoQixXQUFXLEdBQUcsUUFBUSxDQUFBO1lBQ3RCLEtBQUssR0FBRyxDQUFDLENBQUE7WUFDVCxTQUFRO1NBQ1Q7UUFFRCx1RkFBdUY7UUFDdkYsd0RBQXdEO1FBQ3hELElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxRQUFRLENBQUMsYUFBYSxFQUFFO1lBQ2xELFNBQVE7U0FDVDtRQUNELHlFQUF5RTthQUNwRSxJQUFJLFdBQVcsQ0FBQyxVQUFVLEtBQUssUUFBUSxDQUFDLGFBQWEsRUFBRTtZQUMxRCxXQUFXLEdBQUcsUUFBUSxDQUFBO1lBQ3RCLEtBQUssR0FBRyxDQUFDLENBQUE7WUFDVCxTQUFRO1NBQ1Q7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFO1lBQzlCLE1BQU0sR0FBRyxXQUFXLENBQUE7WUFDcEIsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLE1BQU0sQ0FBQyxhQUFhLEVBQUU7Z0JBQ3RFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFDbEMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTthQUMzQjtTQUNGO1FBRUQsK0RBQStEO1FBQy9ELGlCQUFpQjtRQUNqQixJQUFJLFdBQVcsWUFBWSxVQUFVLENBQUMsV0FBVztZQUM3QyxRQUFRLFlBQVksVUFBVSxDQUFDLFVBQVU7WUFDekMsQ0FBQyxDQUFDLFFBQVEsWUFBWSxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDbkQsSUFBSSxRQUFRLEtBQUssV0FBVyxDQUFDLFVBQVUsRUFBRTtnQkFDdkMsU0FBUTthQUNUO1lBRUQsTUFBTSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUE7U0FDbEM7YUFDSTtZQUNILE1BQU0sR0FBRyxRQUFRLENBQUE7U0FDbEI7UUFFRCxlQUFlLEdBQUcsRUFBRSxDQUFBO1FBRXBCLE9BQU8sTUFBTSxDQUFDLFVBQVUsS0FBSyxNQUFNLENBQUMsYUFBYSxFQUFFO1lBQ2pELGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDL0IsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUMzQjtRQUVELENBQUMsR0FBRyxDQUFDLENBQUE7UUFFTCw2Q0FBNkM7UUFDN0MsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFLLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3pFLENBQUMsRUFBRSxDQUFBO1NBQ0o7UUFFRCxNQUFNLE9BQU8sR0FBRztZQUNkLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDbEIsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1NBQ3RCLENBQUE7UUFFRCxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtRQUU1QixPQUFPLEtBQUssRUFBRTtZQUNaLElBQUksS0FBSyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDeEIsV0FBVyxHQUFHLFFBQVEsQ0FBQTtnQkFDdEIsS0FBSyxHQUFHLENBQUMsQ0FBQTtnQkFDVCxrQkFBa0IsR0FBRyxFQUFFLENBQUE7Z0JBRXZCLE1BQUs7YUFDTjtpQkFDSSxJQUFJLEtBQUssS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdCLE1BQUs7YUFDTjtZQUVELEtBQUssR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFBO1NBQzlCO0tBQ0Y7SUFFRCxPQUFPLEtBQUssQ0FBQTtBQUNkLENBQUM7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFFLE9BQWdCLEVBQUUsUUFBZ0IsRUFBRSxLQUFXO0lBQzFFLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUMxQixJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDdEMsT0FBTyxJQUFJLENBQUE7U0FDWjtRQUVELE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUE7UUFFN0IsSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO1lBQ3JCLE9BQU8sZUFBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtTQUMxQztLQUNGO0lBRUQsT0FBTyxLQUFLLENBQUE7QUFDZCxDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFFLE9BQU87SUFDdkMsT0FBTyxDQUFDLE9BQU8sWUFBWSxVQUFVLENBQUMsa0JBQWtCO1FBQ3RELENBQUMsQ0FBQyxPQUFPLENBQUMsdUJBQXVCO1FBQ2pDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNkLENBQUM7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFFLGNBQWM7SUFDekMsY0FBYyxHQUFHLGNBQWMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFBO0lBQzdDLE9BQU87UUFDTCxDQUFDLEVBQUUsY0FBYyxDQUFDLE9BQU8sSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxVQUFVO1FBQy9FLENBQUMsRUFBRSxjQUFjLENBQUMsT0FBTyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVM7S0FDL0UsQ0FBQTtBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsb0JBQW9CLENBQUUsT0FBTztJQUMzQyxNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQU8sWUFBWSxVQUFVLENBQUMsVUFBVTtRQUMxRCxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFO1FBQ2pDLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUVoQyxPQUFPLFVBQVUsSUFBSTtRQUNuQixJQUFJLEVBQUksVUFBVSxDQUFDLElBQUk7UUFDdkIsS0FBSyxFQUFHLFVBQVUsQ0FBQyxLQUFLO1FBQ3hCLEdBQUcsRUFBSyxVQUFVLENBQUMsR0FBRztRQUN0QixNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07UUFDekIsS0FBSyxFQUFHLFVBQVUsQ0FBQyxLQUFLLElBQUssVUFBVSxDQUFDLEtBQUssR0FBSSxVQUFVLENBQUMsSUFBSTtRQUNoRSxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxHQUFHO0tBQ2hFLENBQUE7QUFDSCxDQUFDO0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBRSxPQUFPO0lBQ3JDLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBRWhELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLFVBQVUsRUFBRTtRQUNqQyxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBRWxELFVBQVUsQ0FBQyxJQUFJLElBQU0sTUFBTSxDQUFDLENBQUMsQ0FBQTtRQUM3QixVQUFVLENBQUMsS0FBSyxJQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUE7UUFDN0IsVUFBVSxDQUFDLEdBQUcsSUFBTyxNQUFNLENBQUMsQ0FBQyxDQUFBO1FBQzdCLFVBQVUsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQTtLQUM5QjtJQUVELE9BQU8sVUFBVSxDQUFBO0FBQ25CLENBQUM7QUFFRCxNQUFNLFVBQVUsT0FBTyxDQUFFLElBQUk7SUFDM0IsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBRWYsT0FBTyxJQUFJLEVBQUU7UUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2YsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUN4QjtJQUVELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQUVELE1BQU0sVUFBVSxXQUFXLENBQUUsS0FBSztJQUNoQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUFFLE9BQU8sS0FBSyxDQUFBO0tBQUU7SUFFdkMsK0NBQStDO0lBQy9DLFVBQVUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3hDLE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBicm93c2VyIGZyb20gJy4vYnJvd3NlcidcbmltcG9ydCBkb21PYmplY3RzIGZyb20gJy4vZG9tT2JqZWN0cydcbmltcG9ydCAqIGFzIGlzIGZyb20gJy4vaXMnXG5pbXBvcnQgd2luIGZyb20gJy4vd2luZG93J1xuXG5leHBvcnQgZnVuY3Rpb24gbm9kZUNvbnRhaW5zIChwYXJlbnQ6IE5vZGUsIGNoaWxkOiBOb2RlKSB7XG4gIHdoaWxlIChjaGlsZCkge1xuICAgIGlmIChjaGlsZCA9PT0gcGFyZW50KSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGNoaWxkID0gY2hpbGQucGFyZW50Tm9kZVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZXN0IChlbGVtZW50LCBzZWxlY3Rvcikge1xuICB3aGlsZSAoaXMuZWxlbWVudChlbGVtZW50KSkge1xuICAgIGlmIChtYXRjaGVzU2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7IHJldHVybiBlbGVtZW50IH1cblxuICAgIGVsZW1lbnQgPSBwYXJlbnROb2RlKGVsZW1lbnQpXG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyZW50Tm9kZSAobm9kZSkge1xuICBsZXQgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlXG5cbiAgaWYgKGlzLmRvY0ZyYWcocGFyZW50KSkge1xuICAgIC8vIHNraXAgcGFzdCAjc2hhZG8tcm9vdCBmcmFnbWVudHNcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICB3aGlsZSAoKHBhcmVudCA9IChwYXJlbnQgYXMgYW55KS5ob3N0KSAmJiBpcy5kb2NGcmFnKHBhcmVudCkpIHtcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmVudFxuICB9XG5cbiAgcmV0dXJuIHBhcmVudFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yIChlbGVtZW50LCBzZWxlY3Rvcikge1xuICAvLyByZW1vdmUgL2RlZXAvIGZyb20gc2VsZWN0b3JzIGlmIHNoYWRvd0RPTSBwb2x5ZmlsbCBpcyB1c2VkXG4gIGlmICh3aW4ud2luZG93ICE9PSB3aW4ucmVhbFdpbmRvdykge1xuICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvXFwvZGVlcFxcLy9nLCAnICcpXG4gIH1cblxuICByZXR1cm4gZWxlbWVudFticm93c2VyLnByZWZpeGVkTWF0Y2hlc1NlbGVjdG9yXShzZWxlY3Rvcilcbn1cblxuY29uc3QgZ2V0UGFyZW50ID0gKGVsKSA9PiBlbC5wYXJlbnROb2RlID8gZWwucGFyZW50Tm9kZSA6IGVsLmhvc3RcblxuLy8gVGVzdCBmb3IgdGhlIGVsZW1lbnQgdGhhdCdzIFwiYWJvdmVcIiBhbGwgb3RoZXIgcXVhbGlmaWVyc1xuZXhwb3J0IGZ1bmN0aW9uIGluZGV4T2ZEZWVwZXN0RWxlbWVudCAoZWxlbWVudHMpIHtcbiAgbGV0IGRlZXBlc3Rab25lUGFyZW50cyA9IFtdXG4gIGxldCBkcm9wem9uZVBhcmVudHMgPSBbXVxuICBsZXQgZHJvcHpvbmVcbiAgbGV0IGRlZXBlc3Rab25lID0gZWxlbWVudHNbMF1cbiAgbGV0IGluZGV4ID0gZGVlcGVzdFpvbmUgPyAwIDogLTFcbiAgbGV0IHBhcmVudFxuICBsZXQgY2hpbGRcbiAgbGV0IGlcbiAgbGV0IG5cblxuICBmb3IgKGkgPSAxOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBkcm9wem9uZSA9IGVsZW1lbnRzW2ldXG5cbiAgICAvLyBhbiBlbGVtZW50IG1pZ2h0IGJlbG9uZyB0byBtdWx0aXBsZSBzZWxlY3RvciBkcm9wem9uZXNcbiAgICBpZiAoIWRyb3B6b25lIHx8IGRyb3B6b25lID09PSBkZWVwZXN0Wm9uZSkge1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBpZiAoIWRlZXBlc3Rab25lKSB7XG4gICAgICBkZWVwZXN0Wm9uZSA9IGRyb3B6b25lXG4gICAgICBpbmRleCA9IGlcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgdGhlIGRlZXBlc3Qgb3IgY3VycmVudCBhcmUgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IG9yIGRvY3VtZW50LnJvb3RFbGVtZW50XG4gICAgLy8gLSBpZiB0aGUgY3VycmVudCBkcm9wem9uZSBpcywgZG8gbm90aGluZyBhbmQgY29udGludWVcbiAgICBpZiAoZHJvcHpvbmUucGFyZW50Tm9kZSA9PT0gZHJvcHpvbmUub3duZXJEb2N1bWVudCkge1xuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gLSBpZiBkZWVwZXN0IGlzLCB1cGRhdGUgd2l0aCB0aGUgY3VycmVudCBkcm9wem9uZSBhbmQgY29udGludWUgdG8gbmV4dFxuICAgIGVsc2UgaWYgKGRlZXBlc3Rab25lLnBhcmVudE5vZGUgPT09IGRyb3B6b25lLm93bmVyRG9jdW1lbnQpIHtcbiAgICAgIGRlZXBlc3Rab25lID0gZHJvcHpvbmVcbiAgICAgIGluZGV4ID0gaVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBpZiAoIWRlZXBlc3Rab25lUGFyZW50cy5sZW5ndGgpIHtcbiAgICAgIHBhcmVudCA9IGRlZXBlc3Rab25lXG4gICAgICB3aGlsZSAoZ2V0UGFyZW50KHBhcmVudCkgJiYgZ2V0UGFyZW50KHBhcmVudCkgIT09IHBhcmVudC5vd25lckRvY3VtZW50KSB7XG4gICAgICAgIGRlZXBlc3Rab25lUGFyZW50cy51bnNoaWZ0KHBhcmVudClcbiAgICAgICAgcGFyZW50ID0gZ2V0UGFyZW50KHBhcmVudClcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aGlzIGVsZW1lbnQgaXMgYW4gc3ZnIGVsZW1lbnQgYW5kIHRoZSBjdXJyZW50IGRlZXBlc3QgaXNcbiAgICAvLyBhbiBIVE1MRWxlbWVudFxuICAgIGlmIChkZWVwZXN0Wm9uZSBpbnN0YW5jZW9mIGRvbU9iamVjdHMuSFRNTEVsZW1lbnQgJiZcbiAgICAgICAgZHJvcHpvbmUgaW5zdGFuY2VvZiBkb21PYmplY3RzLlNWR0VsZW1lbnQgJiZcbiAgICAgICAgIShkcm9wem9uZSBpbnN0YW5jZW9mIGRvbU9iamVjdHMuU1ZHU1ZHRWxlbWVudCkpIHtcbiAgICAgIGlmIChkcm9wem9uZSA9PT0gZGVlcGVzdFpvbmUucGFyZW50Tm9kZSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBwYXJlbnQgPSBkcm9wem9uZS5vd25lclNWR0VsZW1lbnRcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwYXJlbnQgPSBkcm9wem9uZVxuICAgIH1cblxuICAgIGRyb3B6b25lUGFyZW50cyA9IFtdXG5cbiAgICB3aGlsZSAocGFyZW50LnBhcmVudE5vZGUgIT09IHBhcmVudC5vd25lckRvY3VtZW50KSB7XG4gICAgICBkcm9wem9uZVBhcmVudHMudW5zaGlmdChwYXJlbnQpXG4gICAgICBwYXJlbnQgPSBnZXRQYXJlbnQocGFyZW50KVxuICAgIH1cblxuICAgIG4gPSAwXG5cbiAgICAvLyBnZXQgKHBvc2l0aW9uIG9mIGxhc3QgY29tbW9uIGFuY2VzdG9yKSArIDFcbiAgICB3aGlsZSAoZHJvcHpvbmVQYXJlbnRzW25dICYmIGRyb3B6b25lUGFyZW50c1tuXSA9PT0gZGVlcGVzdFpvbmVQYXJlbnRzW25dKSB7XG4gICAgICBuKytcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnRzID0gW1xuICAgICAgZHJvcHpvbmVQYXJlbnRzW24gLSAxXSxcbiAgICAgIGRyb3B6b25lUGFyZW50c1tuXSxcbiAgICAgIGRlZXBlc3Rab25lUGFyZW50c1tuXSxcbiAgICBdXG5cbiAgICBjaGlsZCA9IHBhcmVudHNbMF0ubGFzdENoaWxkXG5cbiAgICB3aGlsZSAoY2hpbGQpIHtcbiAgICAgIGlmIChjaGlsZCA9PT0gcGFyZW50c1sxXSkge1xuICAgICAgICBkZWVwZXN0Wm9uZSA9IGRyb3B6b25lXG4gICAgICAgIGluZGV4ID0gaVxuICAgICAgICBkZWVwZXN0Wm9uZVBhcmVudHMgPSBbXVxuXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjaGlsZCA9PT0gcGFyZW50c1syXSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjaGlsZCA9IGNoaWxkLnByZXZpb3VzU2libGluZ1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbmRleFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hlc1VwVG8gKGVsZW1lbnQ6IEVsZW1lbnQsIHNlbGVjdG9yOiBzdHJpbmcsIGxpbWl0OiBOb2RlKSB7XG4gIHdoaWxlIChpcy5lbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgaWYgKG1hdGNoZXNTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgZWxlbWVudCA9IHBhcmVudE5vZGUoZWxlbWVudClcblxuICAgIGlmIChlbGVtZW50ID09PSBsaW1pdCkge1xuICAgICAgcmV0dXJuIG1hdGNoZXNTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdHVhbEVsZW1lbnQgKGVsZW1lbnQpIHtcbiAgcmV0dXJuIChlbGVtZW50IGluc3RhbmNlb2YgZG9tT2JqZWN0cy5TVkdFbGVtZW50SW5zdGFuY2VcbiAgICA/IGVsZW1lbnQuY29ycmVzcG9uZGluZ1VzZUVsZW1lbnRcbiAgICA6IGVsZW1lbnQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JvbGxYWSAocmVsZXZhbnRXaW5kb3cpIHtcbiAgcmVsZXZhbnRXaW5kb3cgPSByZWxldmFudFdpbmRvdyB8fCB3aW4ud2luZG93XG4gIHJldHVybiB7XG4gICAgeDogcmVsZXZhbnRXaW5kb3cuc2Nyb2xsWCB8fCByZWxldmFudFdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCxcbiAgICB5OiByZWxldmFudFdpbmRvdy5zY3JvbGxZIHx8IHJlbGV2YW50V2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRDbGllbnRSZWN0IChlbGVtZW50KSB7XG4gIGNvbnN0IGNsaWVudFJlY3QgPSAoZWxlbWVudCBpbnN0YW5jZW9mIGRvbU9iamVjdHMuU1ZHRWxlbWVudFxuICAgID8gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIDogZWxlbWVudC5nZXRDbGllbnRSZWN0cygpWzBdKVxuXG4gIHJldHVybiBjbGllbnRSZWN0ICYmIHtcbiAgICBsZWZ0ICA6IGNsaWVudFJlY3QubGVmdCxcbiAgICByaWdodCA6IGNsaWVudFJlY3QucmlnaHQsXG4gICAgdG9wICAgOiBjbGllbnRSZWN0LnRvcCxcbiAgICBib3R0b206IGNsaWVudFJlY3QuYm90dG9tLFxuICAgIHdpZHRoIDogY2xpZW50UmVjdC53aWR0aCAgfHwgY2xpZW50UmVjdC5yaWdodCAgLSBjbGllbnRSZWN0LmxlZnQsXG4gICAgaGVpZ2h0OiBjbGllbnRSZWN0LmhlaWdodCB8fCBjbGllbnRSZWN0LmJvdHRvbSAtIGNsaWVudFJlY3QudG9wLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50UmVjdCAoZWxlbWVudCkge1xuICBjb25zdCBjbGllbnRSZWN0ID0gZ2V0RWxlbWVudENsaWVudFJlY3QoZWxlbWVudClcblxuICBpZiAoIWJyb3dzZXIuaXNJT1M3ICYmIGNsaWVudFJlY3QpIHtcbiAgICBjb25zdCBzY3JvbGwgPSBnZXRTY3JvbGxYWSh3aW4uZ2V0V2luZG93KGVsZW1lbnQpKVxuXG4gICAgY2xpZW50UmVjdC5sZWZ0ICAgKz0gc2Nyb2xsLnhcbiAgICBjbGllbnRSZWN0LnJpZ2h0ICArPSBzY3JvbGwueFxuICAgIGNsaWVudFJlY3QudG9wICAgICs9IHNjcm9sbC55XG4gICAgY2xpZW50UmVjdC5ib3R0b20gKz0gc2Nyb2xsLnlcbiAgfVxuXG4gIHJldHVybiBjbGllbnRSZWN0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRoIChub2RlKSB7XG4gIGNvbnN0IHBhdGggPSBbXVxuXG4gIHdoaWxlIChub2RlKSB7XG4gICAgcGF0aC5wdXNoKG5vZGUpXG4gICAgbm9kZSA9IHBhcmVudE5vZGUobm9kZSlcbiAgfVxuXG4gIHJldHVybiBwYXRoXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlTZWxlY3RvciAodmFsdWUpIHtcbiAgaWYgKCFpcy5zdHJpbmcodmFsdWUpKSB7IHJldHVybiBmYWxzZSB9XG5cbiAgLy8gYW4gZXhjZXB0aW9uIHdpbGwgYmUgcmFpc2VkIGlmIGl0IGlzIGludmFsaWRcbiAgZG9tT2JqZWN0cy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHZhbHVlKVxuICByZXR1cm4gdHJ1ZVxufVxuIl19