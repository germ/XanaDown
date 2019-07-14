import * as arr from '@interactjs/utils/arr';
import * as domUtils from '@interactjs/utils/domUtils';
import extend from '@interactjs/utils/extend';
import * as is from '@interactjs/utils/is';
import Signals from '@interactjs/utils/Signals';
export default class InteractableSet {
    constructor(scope) {
        this.scope = scope;
        this.signals = new Signals();
        // all set interactables
        this.list = [];
        this.selectorMap = {};
        this.signals.on('unset', ({ interactable }) => {
            const { target, _context: context } = interactable;
            const targetMappings = is.string(target)
                ? this.selectorMap[target]
                : target[this.scope.id];
            const targetIndex = targetMappings.findIndex((m) => m.context === context);
            if (targetMappings[targetIndex]) {
                // Destroying mappingInfo's context and interactable
                targetMappings[targetIndex].context = null;
                targetMappings[targetIndex].interactable = null;
            }
            targetMappings.splice(targetIndex, 1);
        });
    }
    new(target, options) {
        options = extend(options || {}, {
            actions: this.scope.actions,
        });
        const interactable = new this.scope.Interactable(target, options, this.scope.document);
        const mappingInfo = { context: interactable._context, interactable };
        this.scope.addDocument(interactable._doc);
        this.list.push(interactable);
        if (is.string(target)) {
            if (!this.selectorMap[target]) {
                this.selectorMap[target] = [];
            }
            this.selectorMap[target].push(mappingInfo);
        }
        else {
            if (!interactable.target[this.scope.id]) {
                Object.defineProperty(target, this.scope.id, {
                    value: [],
                    configurable: true,
                });
            }
            target[this.scope.id].push(mappingInfo);
        }
        this.signals.fire('new', {
            target,
            options,
            interactable,
            win: this.scope._win,
        });
        return interactable;
    }
    get(target, options) {
        const context = (options && options.context) || this.scope.document;
        const isSelector = is.string(target);
        const targetMappings = isSelector
            ? this.selectorMap[target]
            : target[this.scope.id];
        if (!targetMappings) {
            return null;
        }
        const found = arr.find(targetMappings, (m) => m.context === context &&
            (isSelector || m.interactable.inContext(target)));
        return found && found.interactable;
    }
    forEachMatch(node, callback) {
        for (const interactable of this.list) {
            let ret;
            if ((is.string(interactable.target)
                // target is a selector and the element matches
                ? (is.element(node) && domUtils.matchesSelector(node, interactable.target))
                // target is the element
                : node === interactable.target) &&
                // the element is in context
                (interactable.inContext(node))) {
                ret = callback(interactable);
            }
            if (ret !== undefined) {
                return ret;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RhYmxlU2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSW50ZXJhY3RhYmxlU2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxHQUFHLE1BQU0sdUJBQXVCLENBQUE7QUFDNUMsT0FBTyxLQUFLLFFBQVEsTUFBTSw0QkFBNEIsQ0FBQTtBQUN0RCxPQUFPLE1BQU0sTUFBTSwwQkFBMEIsQ0FBQTtBQUM3QyxPQUFPLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFBO0FBQzFDLE9BQU8sT0FBTyxNQUFNLDJCQUEyQixDQUFBO0FBRS9DLE1BQU0sQ0FBQyxPQUFPLE9BQU8sZUFBZTtJQVVsQyxZQUF1QixLQUFxQjtRQUFyQixVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQVQ1QyxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtRQUV2Qix3QkFBd0I7UUFDeEIsU0FBSSxHQUE0QixFQUFFLENBQUE7UUFFbEMsZ0JBQVcsR0FFUCxFQUFFLENBQUE7UUFHSixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7WUFDNUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsWUFBWSxDQUFBO1lBQ2xELE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUV6QixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQyxDQUFBO1lBQzFFLElBQUksY0FBYyxDQUFDLFdBQVcsQ0FBQyxF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QUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUVyRCxPQUFPLEtBQUssSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxZQUFZLENBQUUsSUFBVSxFQUFFLFFBQW9DO1FBQzVELEtBQUssTUFBTSxZQUFZLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNwQyxJQUFJLEdBQUcsQ0FBQTtZQUVQLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQ25DLCtDQUErQztnQkFDN0MsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNFLHdCQUF3QjtnQkFDeEIsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsTUFBTSxDQUFDO2dCQUMvQiw0QkFBNEI7Z0JBQzVCLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUNoQyxHQUFHLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFBO2FBQzdCO1lBRUQsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO2dCQUNyQixPQUFPLEdBQUcsQ0FBQTthQUNYO1NBQ0Y7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhcnIgZnJvbSAnQGludGVyYWN0anMvdXRpbHMvYXJyJ1xuaW1wb3J0ICogYXMgZG9tVXRpbHMgZnJvbSAnQGludGVyYWN0anMvdXRpbHMvZG9tVXRpbHMnXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ0BpbnRlcmFjdGpzL3V0aWxzL2V4dGVuZCdcbmltcG9ydCAqIGFzIGlzIGZyb20gJ0BpbnRlcmFjdGpzL3V0aWxzL2lzJ1xuaW1wb3J0IFNpZ25hbHMgZnJvbSAnQGludGVyYWN0anMvdXRpbHMvU2lnbmFscydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJhY3RhYmxlU2V0IHtcbiAgc2lnbmFscyA9IG5ldyBTaWduYWxzKClcblxuICAvLyBhbGwgc2V0IGludGVyYWN0YWJsZXNcbiAgbGlzdDogSW50ZXJhY3QuSW50ZXJhY3RhYmxlW10gPSBbXVxuXG4gIHNlbGVjdG9yTWFwOiB7XG4gICAgW3NlbGVjdG9yOiBzdHJpbmddOiBBcnJheTx7IGNvbnRleHQ6IERvY3VtZW50IHwgRWxlbWVudCwgaW50ZXJhY3RhYmxlOiBJbnRlcmFjdC5JbnRlcmFjdGFibGUgfT5cbiAgfSA9IHt9XG5cbiAgY29uc3RydWN0b3IgKHByb3RlY3RlZCBzY29wZTogSW50ZXJhY3QuU2NvcGUpIHtcbiAgICB0aGlzLnNpZ25hbHMub24oJ3Vuc2V0JywgKHsgaW50ZXJhY3RhYmxlIH0pID0+IHtcbiAgICAgIGNvbnN0IHsgdGFyZ2V0LCBfY29udGV4dDogY29udGV4dCB9ID0gaW50ZXJhY3RhYmxlXG4gICAgICBjb25zdCB0YXJnZXRNYXBwaW5ncyA9IGlzLnN0cmluZyh0YXJnZXQpXG4gICAgICAgID8gdGhpcy5zZWxlY3Rvck1hcFt0YXJnZXRdXG4gICAgICAgIDogdGFyZ2V0W3RoaXMuc2NvcGUuaWRdXG5cbiAgICAgIGNvbnN0IHRhcmdldEluZGV4ID0gdGFyZ2V0TWFwcGluZ3MuZmluZEluZGV4KChtKSA9PiBtLmNvbnRleHQgPT09IGNvbnRleHQpXG4gICAgICBpZiAodGFyZ2V0TWFwcGluZ3NbdGFyZ2V0SW5kZXhdKSB7XG4gICAgICAgIC8vIERlc3Ryb3lpbmcgbWFwcGluZ0luZm8ncyBjb250ZXh0IGFuZCBpbnRlcmFjdGFibGVcbiAgICAgICAgdGFyZ2V0TWFwcGluZ3NbdGFyZ2V0SW5kZXhdLmNvbnRleHQgPSBudWxsXG4gICAgICAgIHRhcmdldE1hcHBpbmdzW3RhcmdldEluZGV4XS5pbnRlcmFjdGFibGUgPSBudWxsXG4gICAgICB9XG4gICAgICB0YXJnZXRNYXBwaW5ncy5zcGxpY2UodGFyZ2V0SW5kZXgsIDEpXG4gICAgfSlcbiAgfVxuXG4gIG5ldyAodGFyZ2V0OiBJbnRlcmFjdC5UYXJnZXQsIG9wdGlvbnM/OiBhbnkpOiBJbnRlcmFjdC5JbnRlcmFjdGFibGUge1xuICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucyB8fCB7fSwge1xuICAgICAgYWN0aW9uczogdGhpcy5zY29wZS5hY3Rpb25zLFxuICAgIH0pXG4gICAgY29uc3QgaW50ZXJhY3RhYmxlID0gbmV3IHRoaXMuc2NvcGUuSW50ZXJhY3RhYmxlKHRhcmdldCwgb3B0aW9ucywgdGhpcy5zY29wZS5kb2N1bWVudClcbiAgICBjb25zdCBtYXBwaW5nSW5mbyA9IHsgY29udGV4dDogaW50ZXJhY3RhYmxlLl9jb250ZXh0LCBpbnRlcmFjdGFibGUgfVxuXG4gICAgdGhpcy5zY29wZS5hZGREb2N1bWVudChpbnRlcmFjdGFibGUuX2RvYylcbiAgICB0aGlzLmxpc3QucHVzaChpbnRlcmFjdGFibGUpXG5cbiAgICBpZiAoaXMuc3RyaW5nKHRhcmdldCkpIHtcbiAgICAgIGlmICghdGhpcy5zZWxlY3Rvck1hcFt0YXJnZXRdKSB7IHRoaXMuc2VsZWN0b3JNYXBbdGFyZ2V0XSA9IFtdIH1cbiAgICAgIHRoaXMuc2VsZWN0b3JNYXBbdGFyZ2V0XS5wdXNoKG1hcHBpbmdJbmZvKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWludGVyYWN0YWJsZS50YXJnZXRbdGhpcy5zY29wZS5pZF0pIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgdGhpcy5zY29wZS5pZCwge1xuICAgICAgICAgIHZhbHVlOiBbXSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHRhcmdldFt0aGlzLnNjb3BlLmlkXS5wdXNoKG1hcHBpbmdJbmZvKVxuICAgIH1cblxuICAgIHRoaXMuc2lnbmFscy5maXJlKCduZXcnLCB7XG4gICAgICB0YXJnZXQsXG4gICAgICBvcHRpb25zLFxuICAgICAgaW50ZXJhY3RhYmxlLFxuICAgICAgd2luOiB0aGlzLnNjb3BlLl93aW4sXG4gICAgfSlcblxuICAgIHJldHVybiBpbnRlcmFjdGFibGVcbiAgfVxuXG4gIGdldCAodGFyZ2V0OiBJbnRlcmFjdC5UYXJnZXQsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5jb250ZXh0KSB8fCB0aGlzLnNjb3BlLmRvY3VtZW50XG4gICAgY29uc3QgaXNTZWxlY3RvciA9IGlzLnN0cmluZyh0YXJnZXQpXG4gICAgY29uc3QgdGFyZ2V0TWFwcGluZ3MgPSBpc1NlbGVjdG9yXG4gICAgICA/IHRoaXMuc2VsZWN0b3JNYXBbdGFyZ2V0IGFzIHN0cmluZ11cbiAgICAgIDogdGFyZ2V0W3RoaXMuc2NvcGUuaWRdXG5cbiAgICBpZiAoIXRhcmdldE1hcHBpbmdzKSB7IHJldHVybiBudWxsIH1cblxuICAgIGNvbnN0IGZvdW5kID0gYXJyLmZpbmQoXG4gICAgICB0YXJnZXRNYXBwaW5ncyxcbiAgICAgIChtKSA9PiBtLmNvbnRleHQgPT09IGNvbnRleHQgJiZcbiAgICAgICAgKGlzU2VsZWN0b3IgfHwgbS5pbnRlcmFjdGFibGUuaW5Db250ZXh0KHRhcmdldCkpKVxuXG4gICAgcmV0dXJuIGZvdW5kICYmIGZvdW5kLmludGVyYWN0YWJsZVxuICB9XG5cbiAgZm9yRWFjaE1hdGNoIChub2RlOiBOb2RlLCBjYWxsYmFjazogKGludGVyYWN0YWJsZTogYW55KSA9PiBhbnkpIHtcbiAgICBmb3IgKGNvbnN0IGludGVyYWN0YWJsZSBvZiB0aGlzLmxpc3QpIHtcbiAgICAgIGxldCByZXRcblxuICAgICAgaWYgKChpcy5zdHJpbmcoaW50ZXJhY3RhYmxlLnRhcmdldClcbiAgICAgIC8vIHRhcmdldCBpcyBhIHNlbGVjdG9yIGFuZCB0aGUgZWxlbWVudCBtYXRjaGVzXG4gICAgICAgID8gKGlzLmVsZW1lbnQobm9kZSkgJiYgZG9tVXRpbHMubWF0Y2hlc1NlbGVjdG9yKG5vZGUsIGludGVyYWN0YWJsZS50YXJnZXQpKVxuICAgICAgICAvLyB0YXJnZXQgaXMgdGhlIGVsZW1lbnRcbiAgICAgICAgOiBub2RlID09PSBpbnRlcmFjdGFibGUudGFyZ2V0KSAmJlxuICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBpbiBjb250ZXh0XG4gICAgICAgIChpbnRlcmFjdGFibGUuaW5Db250ZXh0KG5vZGUpKSkge1xuICAgICAgICByZXQgPSBjYWxsYmFjayhpbnRlcmFjdGFibGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChyZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gcmV0XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=