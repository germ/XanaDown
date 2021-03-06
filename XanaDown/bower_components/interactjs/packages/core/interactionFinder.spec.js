import test from '@interactjs/_dev/test/test';
import finder from './interactionFinder';
import * as helpers from './tests/_helpers';
test('modifiers/snap', (t) => {
    const { interactable, event, coords, scope, } = helpers.testEnv();
    const { body } = scope.document;
    const { list } = scope.interactions;
    const details = {
        pointer: event,
        get pointerId() { return details.pointer.pointerId; },
        get pointerType() { return details.pointer.pointerType; },
        eventType: null,
        eventTarget: body,
        curEventTarget: scope.document,
        scope,
    };
    scope.interactions.new({ pointerType: 'touch' });
    scope.interactions.new({ pointerType: 'mouse' });
    coords.pointerType = 'mouse';
    list[0].pointerType = 'mouse';
    list[2]._interacting = true;
    t.equal(list.indexOf(finder.search(details)), 2, '[pointerType: mouse] skips inactive mouse and touch interaction');
    list[2]._interacting = false;
    t.equal(list.indexOf(finder.search(details)), 0, '[pointerType: mouse] returns first idle mouse interaction');
    coords.pointerId = 4;
    list[1].pointerDown({ ...event }, { ...event }, body);
    coords.pointerType = 'touch';
    t.equal(list.indexOf(finder.search(details)), 1, '[pointerType: touch] gets interaction with pointerId');
    coords.pointerId = 5;
    t.equal(list.indexOf(finder.search(details)), 1, `[pointerType: touch] returns idle touch interaction without matching pointerId
    and existing touch interaction has pointer and no target`);
    interactable.options.gesture = { enabled: false };
    list[1].interactable = interactable;
    t.equal(list.indexOf(finder.search(details)), -1, `[pointerType: touch] no result without matching pointerId
    and existing touch interaction has a pointer and target not gesturable`);
    interactable.options.gesture = { enabled: true };
    t.equal(list.indexOf(finder.search(details)), 1, `[pointerType: touch] returns idle touch interaction with gesturable target
    and existing pointer`);
    t.end();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3Rpb25GaW5kZXIuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVyYWN0aW9uRmluZGVyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxJQUFJLE1BQU0sNEJBQTRCLENBQUE7QUFDN0MsT0FBTyxNQUFNLE1BQU0scUJBQXFCLENBQUE7QUFDeEMsT0FBTyxLQUFLLE9BQU8sTUFBTSxrQkFBa0IsQ0FBQTtBQUUzQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUMzQixNQUFNLEVBQ0osWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBQ04sS0FBSyxHQUNOLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBRXJCLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFBO0lBRS9CLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFBO0lBQ25DLE1BQU0sT0FBTyxHQUFHO1FBQ2QsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLFNBQVMsS0FBTSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFBLENBQUMsQ0FBQztRQUNyRCxJQUFJLFdBQVcsS0FBTSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFBLENBQUMsQ0FBQztRQUN6RCxTQUFTLEVBQUUsSUFBSTtRQUNmLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLGNBQWMsRUFBRSxLQUFLLENBQUMsUUFBUTtRQUM5QixLQUFLO0tBQ04sQ0FBQTtJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDaEQsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUVoRCxNQUFNLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQTtJQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQTtJQUM3QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUUzQixDQUFDLENBQUMsS0FBSyxDQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUNwQyxDQUFDLEVBQ0QsaUVBQWlFLENBQ2xFLENBQUE7SUFFRCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQTtJQUU1QixDQUFDLENBQUMsS0FBSyxDQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUNwQyxDQUFDLEVBQ0QsMkRBQTJELENBQzVELENBQUE7SUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQTtJQUNwQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQVMsRUFBRSxFQUFFLEdBQUcsS0FBSyxFQUFTLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDbkUsTUFBTSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUE7SUFFNUIsQ0FBQyxDQUFDLEtBQUssQ0FDTCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFDcEMsQ0FBQyxFQUNELHNEQUFzRCxDQUN2RCxDQUFBO0lBRUQsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUE7SUFFcEIsQ0FBQyxDQUFDLEtBQUssQ0FDTCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFDcEMsQ0FBQyxFQUNEOzZEQUN5RCxDQUMxRCxDQUFBO0lBRUQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUE7SUFDakQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUE7SUFFbkMsQ0FBQyxDQUFDLEtBQUssQ0FDTCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFDcEMsQ0FBQyxDQUFDLEVBQ0Y7MkVBQ3VFLENBQ3hFLENBQUE7SUFFRCxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUVoRCxDQUFDLENBQUMsS0FBSyxDQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUNwQyxDQUFDLEVBQ0Q7eUJBQ3FCLENBQ3RCLENBQUE7SUFFRCxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDVCxDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0ZXN0IGZyb20gJ0BpbnRlcmFjdGpzL19kZXYvdGVzdC90ZXN0J1xuaW1wb3J0IGZpbmRlciBmcm9tICcuL2ludGVyYWN0aW9uRmluZGVyJ1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICcuL3Rlc3RzL19oZWxwZXJzJ1xuXG50ZXN0KCdtb2RpZmllcnMvc25hcCcsICh0KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBpbnRlcmFjdGFibGUsXG4gICAgZXZlbnQsXG4gICAgY29vcmRzLFxuICAgIHNjb3BlLFxuICB9ID0gaGVscGVycy50ZXN0RW52KClcblxuICBjb25zdCB7IGJvZHkgfSA9IHNjb3BlLmRvY3VtZW50XG5cbiAgY29uc3QgeyBsaXN0IH0gPSBzY29wZS5pbnRlcmFjdGlvbnNcbiAgY29uc3QgZGV0YWlscyA9IHtcbiAgICBwb2ludGVyOiBldmVudCxcbiAgICBnZXQgcG9pbnRlcklkICgpIHsgcmV0dXJuIGRldGFpbHMucG9pbnRlci5wb2ludGVySWQgfSxcbiAgICBnZXQgcG9pbnRlclR5cGUgKCkgeyByZXR1cm4gZGV0YWlscy5wb2ludGVyLnBvaW50ZXJUeXBlIH0sXG4gICAgZXZlbnRUeXBlOiBudWxsLFxuICAgIGV2ZW50VGFyZ2V0OiBib2R5LFxuICAgIGN1ckV2ZW50VGFyZ2V0OiBzY29wZS5kb2N1bWVudCxcbiAgICBzY29wZSxcbiAgfVxuXG4gIHNjb3BlLmludGVyYWN0aW9ucy5uZXcoeyBwb2ludGVyVHlwZTogJ3RvdWNoJyB9KVxuICBzY29wZS5pbnRlcmFjdGlvbnMubmV3KHsgcG9pbnRlclR5cGU6ICdtb3VzZScgfSlcblxuICBjb29yZHMucG9pbnRlclR5cGUgPSAnbW91c2UnXG4gIGxpc3RbMF0ucG9pbnRlclR5cGUgPSAnbW91c2UnXG4gIGxpc3RbMl0uX2ludGVyYWN0aW5nID0gdHJ1ZVxuXG4gIHQuZXF1YWwoXG4gICAgbGlzdC5pbmRleE9mKGZpbmRlci5zZWFyY2goZGV0YWlscykpLFxuICAgIDIsXG4gICAgJ1twb2ludGVyVHlwZTogbW91c2VdIHNraXBzIGluYWN0aXZlIG1vdXNlIGFuZCB0b3VjaCBpbnRlcmFjdGlvbidcbiAgKVxuXG4gIGxpc3RbMl0uX2ludGVyYWN0aW5nID0gZmFsc2VcblxuICB0LmVxdWFsKFxuICAgIGxpc3QuaW5kZXhPZihmaW5kZXIuc2VhcmNoKGRldGFpbHMpKSxcbiAgICAwLFxuICAgICdbcG9pbnRlclR5cGU6IG1vdXNlXSByZXR1cm5zIGZpcnN0IGlkbGUgbW91c2UgaW50ZXJhY3Rpb24nXG4gIClcblxuICBjb29yZHMucG9pbnRlcklkID0gNFxuICBsaXN0WzFdLnBvaW50ZXJEb3duKHsgLi4uZXZlbnQgfSBhcyBhbnksIHsgLi4uZXZlbnQgfSBhcyBhbnksIGJvZHkpXG4gIGNvb3Jkcy5wb2ludGVyVHlwZSA9ICd0b3VjaCdcblxuICB0LmVxdWFsKFxuICAgIGxpc3QuaW5kZXhPZihmaW5kZXIuc2VhcmNoKGRldGFpbHMpKSxcbiAgICAxLFxuICAgICdbcG9pbnRlclR5cGU6IHRvdWNoXSBnZXRzIGludGVyYWN0aW9uIHdpdGggcG9pbnRlcklkJ1xuICApXG5cbiAgY29vcmRzLnBvaW50ZXJJZCA9IDVcblxuICB0LmVxdWFsKFxuICAgIGxpc3QuaW5kZXhPZihmaW5kZXIuc2VhcmNoKGRldGFpbHMpKSxcbiAgICAxLFxuICAgIGBbcG9pbnRlclR5cGU6IHRvdWNoXSByZXR1cm5zIGlkbGUgdG91Y2ggaW50ZXJhY3Rpb24gd2l0aG91dCBtYXRjaGluZyBwb2ludGVySWRcbiAgICBhbmQgZXhpc3RpbmcgdG91Y2ggaW50ZXJhY3Rpb24gaGFzIHBvaW50ZXIgYW5kIG5vIHRhcmdldGBcbiAgKVxuXG4gIGludGVyYWN0YWJsZS5vcHRpb25zLmdlc3R1cmUgPSB7IGVuYWJsZWQ6IGZhbHNlIH1cbiAgbGlzdFsxXS5pbnRlcmFjdGFibGUgPSBpbnRlcmFjdGFibGVcblxuICB0LmVxdWFsKFxuICAgIGxpc3QuaW5kZXhPZihmaW5kZXIuc2VhcmNoKGRldGFpbHMpKSxcbiAgICAtMSxcbiAgICBgW3BvaW50ZXJUeXBlOiB0b3VjaF0gbm8gcmVzdWx0IHdpdGhvdXQgbWF0Y2hpbmcgcG9pbnRlcklkXG4gICAgYW5kIGV4aXN0aW5nIHRvdWNoIGludGVyYWN0aW9uIGhhcyBhIHBvaW50ZXIgYW5kIHRhcmdldCBub3QgZ2VzdHVyYWJsZWBcbiAgKVxuXG4gIGludGVyYWN0YWJsZS5vcHRpb25zLmdlc3R1cmUgPSB7IGVuYWJsZWQ6IHRydWUgfVxuXG4gIHQuZXF1YWwoXG4gICAgbGlzdC5pbmRleE9mKGZpbmRlci5zZWFyY2goZGV0YWlscykpLFxuICAgIDEsXG4gICAgYFtwb2ludGVyVHlwZTogdG91Y2hdIHJldHVybnMgaWRsZSB0b3VjaCBpbnRlcmFjdGlvbiB3aXRoIGdlc3R1cmFibGUgdGFyZ2V0XG4gICAgYW5kIGV4aXN0aW5nIHBvaW50ZXJgXG4gIClcblxuICB0LmVuZCgpXG59KVxuIl19