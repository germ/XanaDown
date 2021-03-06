import * as is from '@interactjs/utils/is';
import rectUtils from '@interactjs/utils/rect';
function start({ rect, startOffset, state }) {
    const { options } = state;
    const { elementRect } = options;
    const offset = {};
    if (rect && elementRect) {
        offset.left = startOffset.left - (rect.width * elementRect.left);
        offset.top = startOffset.top - (rect.height * elementRect.top);
        offset.right = startOffset.right - (rect.width * (1 - elementRect.right));
        offset.bottom = startOffset.bottom - (rect.height * (1 - elementRect.bottom));
    }
    else {
        offset.left = offset.top = offset.right = offset.bottom = 0;
    }
    state.offset = offset;
}
function set({ coords, interaction, state }) {
    const { options, offset } = state;
    const restriction = getRestrictionRect(options.restriction, interaction, coords);
    if (!restriction) {
        return state;
    }
    const rect = restriction;
    // object is assumed to have
    // x, y, width, height or
    // left, top, right, bottom
    if ('x' in restriction && 'y' in restriction) {
        coords.x = Math.max(Math.min(rect.x + rect.width - offset.right, coords.x), rect.x + offset.left);
        coords.y = Math.max(Math.min(rect.y + rect.height - offset.bottom, coords.y), rect.y + offset.top);
    }
    else {
        coords.x = Math.max(Math.min(rect.right - offset.right, coords.x), rect.left + offset.left);
        coords.y = Math.max(Math.min(rect.bottom - offset.bottom, coords.y), rect.top + offset.top);
    }
}
function getRestrictionRect(value, interaction, coords) {
    if (is.func(value)) {
        return rectUtils.resolveRectLike(value, interaction.interactable, interaction.element, [coords.x, coords.y, interaction]);
    }
    else {
        return rectUtils.resolveRectLike(value, interaction.interactable, interaction.element);
    }
}
const restrict = {
    start,
    set,
    getRestrictionRect,
    defaults: {
        enabled: false,
        restriction: null,
        elementRect: null,
    },
};
export default restrict;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9pbnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBvaW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUMxQyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUU5QyxTQUFTLEtBQUssQ0FBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO0lBQzFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLENBQUE7SUFDekIsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQTtJQUMvQixNQUFNLE1BQU0sR0FBRyxFQUErQixDQUFBO0lBRTlDLElBQUksSUFBSSxJQUFJLFdBQVcsRUFBRTtRQUN2QixNQUFNLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNqRSxNQUFNLENBQUMsR0FBRyxHQUFJLFdBQVcsQ0FBQyxHQUFHLEdBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVoRSxNQUFNLENBQUMsS0FBSyxHQUFJLFdBQVcsQ0FBQyxLQUFLLEdBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFJLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQzVFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7S0FDOUU7U0FDSTtRQUNILE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0tBQzVEO0lBRUQsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDdkIsQ0FBQztBQUVELFNBQVMsR0FBRyxDQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUU7SUFDMUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUE7SUFFakMsTUFBTSxXQUFXLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFFaEYsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUFFLE9BQU8sS0FBSyxDQUFBO0tBQUU7SUFFbEMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFBO0lBRXhCLDRCQUE0QjtJQUM1Qix5QkFBeUI7SUFDekIsMkJBQTJCO0lBQzNCLElBQUksR0FBRyxJQUFJLFdBQVcsSUFBSSxHQUFHLElBQUksV0FBVyxFQUFFO1FBQzVDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBSSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsRyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDbkc7U0FDSTtRQUNILE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDNUYsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUM3RjtBQUNILENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBdUI7SUFDdEUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2xCLE9BQU8sU0FBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUE7S0FDMUg7U0FBTTtRQUNMLE9BQU8sU0FBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDdkY7QUFDSCxDQUFDO0FBRUQsTUFBTSxRQUFRLEdBQUc7SUFDZixLQUFLO0lBQ0wsR0FBRztJQUNILGtCQUFrQjtJQUNsQixRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUUsS0FBSztRQUNkLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLFdBQVcsRUFBRSxJQUFJO0tBQ2xCO0NBQ0YsQ0FBQTtBQUVELGVBQWUsUUFBUSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgaXMgZnJvbSAnQGludGVyYWN0anMvdXRpbHMvaXMnXG5pbXBvcnQgcmVjdFV0aWxzIGZyb20gJ0BpbnRlcmFjdGpzL3V0aWxzL3JlY3QnXG5cbmZ1bmN0aW9uIHN0YXJ0ICh7IHJlY3QsIHN0YXJ0T2Zmc2V0LCBzdGF0ZSB9KSB7XG4gIGNvbnN0IHsgb3B0aW9ucyB9ID0gc3RhdGVcbiAgY29uc3QgeyBlbGVtZW50UmVjdCB9ID0gb3B0aW9uc1xuICBjb25zdCBvZmZzZXQgPSB7fSBhcyB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9XG5cbiAgaWYgKHJlY3QgJiYgZWxlbWVudFJlY3QpIHtcbiAgICBvZmZzZXQubGVmdCA9IHN0YXJ0T2Zmc2V0LmxlZnQgLSAocmVjdC53aWR0aCAgKiBlbGVtZW50UmVjdC5sZWZ0KVxuICAgIG9mZnNldC50b3AgID0gc3RhcnRPZmZzZXQudG9wICAtIChyZWN0LmhlaWdodCAqIGVsZW1lbnRSZWN0LnRvcClcblxuICAgIG9mZnNldC5yaWdodCAgPSBzdGFydE9mZnNldC5yaWdodCAgLSAocmVjdC53aWR0aCAgKiAoMSAtIGVsZW1lbnRSZWN0LnJpZ2h0KSlcbiAgICBvZmZzZXQuYm90dG9tID0gc3RhcnRPZmZzZXQuYm90dG9tIC0gKHJlY3QuaGVpZ2h0ICogKDEgLSBlbGVtZW50UmVjdC5ib3R0b20pKVxuICB9XG4gIGVsc2Uge1xuICAgIG9mZnNldC5sZWZ0ID0gb2Zmc2V0LnRvcCA9IG9mZnNldC5yaWdodCA9IG9mZnNldC5ib3R0b20gPSAwXG4gIH1cblxuICBzdGF0ZS5vZmZzZXQgPSBvZmZzZXRcbn1cblxuZnVuY3Rpb24gc2V0ICh7IGNvb3JkcywgaW50ZXJhY3Rpb24sIHN0YXRlIH0pIHtcbiAgY29uc3QgeyBvcHRpb25zLCBvZmZzZXQgfSA9IHN0YXRlXG5cbiAgY29uc3QgcmVzdHJpY3Rpb24gPSBnZXRSZXN0cmljdGlvblJlY3Qob3B0aW9ucy5yZXN0cmljdGlvbiwgaW50ZXJhY3Rpb24sIGNvb3JkcylcblxuICBpZiAoIXJlc3RyaWN0aW9uKSB7IHJldHVybiBzdGF0ZSB9XG5cbiAgY29uc3QgcmVjdCA9IHJlc3RyaWN0aW9uXG5cbiAgLy8gb2JqZWN0IGlzIGFzc3VtZWQgdG8gaGF2ZVxuICAvLyB4LCB5LCB3aWR0aCwgaGVpZ2h0IG9yXG4gIC8vIGxlZnQsIHRvcCwgcmlnaHQsIGJvdHRvbVxuICBpZiAoJ3gnIGluIHJlc3RyaWN0aW9uICYmICd5JyBpbiByZXN0cmljdGlvbikge1xuICAgIGNvb3Jkcy54ID0gTWF0aC5tYXgoTWF0aC5taW4ocmVjdC54ICsgcmVjdC53aWR0aCAgLSBvZmZzZXQucmlnaHQsIGNvb3Jkcy54KSwgcmVjdC54ICsgb2Zmc2V0LmxlZnQpXG4gICAgY29vcmRzLnkgPSBNYXRoLm1heChNYXRoLm1pbihyZWN0LnkgKyByZWN0LmhlaWdodCAtIG9mZnNldC5ib3R0b20sIGNvb3Jkcy55KSwgcmVjdC55ICsgb2Zmc2V0LnRvcClcbiAgfVxuICBlbHNlIHtcbiAgICBjb29yZHMueCA9IE1hdGgubWF4KE1hdGgubWluKHJlY3QucmlnaHQgIC0gb2Zmc2V0LnJpZ2h0LCBjb29yZHMueCksIHJlY3QubGVmdCArIG9mZnNldC5sZWZ0KVxuICAgIGNvb3Jkcy55ID0gTWF0aC5tYXgoTWF0aC5taW4ocmVjdC5ib3R0b20gLSBvZmZzZXQuYm90dG9tLCBjb29yZHMueSksIHJlY3QudG9wICArIG9mZnNldC50b3ApXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmVzdHJpY3Rpb25SZWN0ICh2YWx1ZSwgaW50ZXJhY3Rpb24sIGNvb3Jkcz86IEludGVyYWN0LlBvaW50KSB7XG4gIGlmIChpcy5mdW5jKHZhbHVlKSkge1xuICAgIHJldHVybiByZWN0VXRpbHMucmVzb2x2ZVJlY3RMaWtlKHZhbHVlLCBpbnRlcmFjdGlvbi5pbnRlcmFjdGFibGUsIGludGVyYWN0aW9uLmVsZW1lbnQsIFtjb29yZHMueCwgY29vcmRzLnksIGludGVyYWN0aW9uXSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmVjdFV0aWxzLnJlc29sdmVSZWN0TGlrZSh2YWx1ZSwgaW50ZXJhY3Rpb24uaW50ZXJhY3RhYmxlLCBpbnRlcmFjdGlvbi5lbGVtZW50KVxuICB9XG59XG5cbmNvbnN0IHJlc3RyaWN0ID0ge1xuICBzdGFydCxcbiAgc2V0LFxuICBnZXRSZXN0cmljdGlvblJlY3QsXG4gIGRlZmF1bHRzOiB7XG4gICAgZW5hYmxlZDogZmFsc2UsXG4gICAgcmVzdHJpY3Rpb246IG51bGwsXG4gICAgZWxlbWVudFJlY3Q6IG51bGwsXG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlc3RyaWN0XG4iXX0=