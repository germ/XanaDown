import test from '@interactjs/_dev/test/test';
import drag from '@interactjs/actions/drag';
import { autoStart } from '@interactjs/auto-start';
import interactablePreventDefault from './interactablePreventDefault';
import * as helpers from './tests/_helpers';
test('interactablePreventDefault', (t) => {
    const { scope, interactable, } = helpers.testEnv({
        plugins: [interactablePreventDefault, autoStart, drag],
    });
    const { MouseEvent, Event, } = scope.window;
    interactable.draggable({});
    const mouseEvent = new MouseEvent('mousedown', { bubbles: true });
    const nativeDragStart = new Event('dragstart', { bubbles: true });
    let nativeDragStartPrevented = false;
    nativeDragStart.preventDefault = () => {
        nativeDragStartPrevented = true;
    };
    scope.document.body.dispatchEvent(mouseEvent);
    scope.document.body.dispatchEvent(nativeDragStart);
    t.ok(nativeDragStartPrevented, 'native dragstart is prevented on interactable ');
    t.end();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RhYmxlUHJldmVudERlZmF1bHQuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVyYWN0YWJsZVByZXZlbnREZWZhdWx0LnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxJQUFJLE1BQU0sNEJBQTRCLENBQUE7QUFDN0MsT0FBTyxJQUFJLE1BQU0sMEJBQTBCLENBQUE7QUFDM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2xELE9BQU8sMEJBQTBCLE1BQU0sOEJBQThCLENBQUE7QUFDckUsT0FBTyxLQUFLLE9BQU8sTUFBTSxrQkFBa0IsQ0FBQTtBQUUzQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUN2QyxNQUFNLEVBQ0osS0FBSyxFQUNMLFlBQVksR0FDYixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDbEIsT0FBTyxFQUFFLENBQUMsMEJBQTBCLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQztLQUN2RCxDQUFDLENBQUE7SUFFRixNQUFNLEVBQ0osVUFBVSxFQUNWLEtBQUssR0FDTixHQUFHLEtBQUssQ0FBQyxNQUFhLENBQUE7SUFFdkIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUUxQixNQUFNLFVBQVUsR0FBZSxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUM3RSxNQUFNLGVBQWUsR0FBVSxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUN4RSxJQUFJLHdCQUF3QixHQUFHLEtBQUssQ0FBQTtJQUVwQyxlQUFlLENBQUMsY0FBYyxHQUFHLEdBQUcsRUFBRTtRQUNwQyx3QkFBd0IsR0FBRyxJQUFJLENBQUE7SUFDakMsQ0FBQyxDQUFBO0lBRUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQzdDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUVsRCxDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLGdEQUFnRCxDQUFDLENBQUE7SUFFaEYsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ1QsQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdGVzdCBmcm9tICdAaW50ZXJhY3Rqcy9fZGV2L3Rlc3QvdGVzdCdcbmltcG9ydCBkcmFnIGZyb20gJ0BpbnRlcmFjdGpzL2FjdGlvbnMvZHJhZydcbmltcG9ydCB7IGF1dG9TdGFydCB9IGZyb20gJ0BpbnRlcmFjdGpzL2F1dG8tc3RhcnQnXG5pbXBvcnQgaW50ZXJhY3RhYmxlUHJldmVudERlZmF1bHQgZnJvbSAnLi9pbnRlcmFjdGFibGVQcmV2ZW50RGVmYXVsdCdcbmltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnLi90ZXN0cy9faGVscGVycydcblxudGVzdCgnaW50ZXJhY3RhYmxlUHJldmVudERlZmF1bHQnLCAodCkgPT4ge1xuICBjb25zdCB7XG4gICAgc2NvcGUsXG4gICAgaW50ZXJhY3RhYmxlLFxuICB9ID0gaGVscGVycy50ZXN0RW52KHtcbiAgICBwbHVnaW5zOiBbaW50ZXJhY3RhYmxlUHJldmVudERlZmF1bHQsIGF1dG9TdGFydCwgZHJhZ10sXG4gIH0pXG5cbiAgY29uc3Qge1xuICAgIE1vdXNlRXZlbnQsXG4gICAgRXZlbnQsXG4gIH0gPSBzY29wZS53aW5kb3cgYXMgYW55XG5cbiAgaW50ZXJhY3RhYmxlLmRyYWdnYWJsZSh7fSlcblxuICBjb25zdCBtb3VzZUV2ZW50OiBNb3VzZUV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoJ21vdXNlZG93bicsIHsgYnViYmxlczogdHJ1ZSB9KVxuICBjb25zdCBuYXRpdmVEcmFnU3RhcnQ6IEV2ZW50ID0gbmV3IEV2ZW50KCdkcmFnc3RhcnQnLCB7IGJ1YmJsZXM6IHRydWUgfSlcbiAgbGV0IG5hdGl2ZURyYWdTdGFydFByZXZlbnRlZCA9IGZhbHNlXG5cbiAgbmF0aXZlRHJhZ1N0YXJ0LnByZXZlbnREZWZhdWx0ID0gKCkgPT4ge1xuICAgIG5hdGl2ZURyYWdTdGFydFByZXZlbnRlZCA9IHRydWVcbiAgfVxuXG4gIHNjb3BlLmRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChtb3VzZUV2ZW50KVxuICBzY29wZS5kb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQobmF0aXZlRHJhZ1N0YXJ0KVxuXG4gIHQub2sobmF0aXZlRHJhZ1N0YXJ0UHJldmVudGVkLCAnbmF0aXZlIGRyYWdzdGFydCBpcyBwcmV2ZW50ZWQgb24gaW50ZXJhY3RhYmxlICcpXG5cbiAgdC5lbmQoKVxufSlcbiJdfQ==