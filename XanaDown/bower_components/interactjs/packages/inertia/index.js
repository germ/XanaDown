import { EventPhase } from '@interactjs/core/InteractEvent';
import modifiers from '@interactjs/modifiers/base';
import * as utils from '@interactjs/utils';
import raf from '@interactjs/utils/raf';
EventPhase.Resume = 'resume';
EventPhase.InertiaStart = 'inertiastart';
function install(scope) {
    const { interactions, defaults, } = scope;
    interactions.signals.on('new', ({ interaction }) => {
        interaction.inertia = {
            active: false,
            smoothEnd: false,
            allowResume: false,
            upCoords: {},
            timeout: null,
        };
    });
    // FIXME proper signal typing
    interactions.signals.on('before-action-end', (arg) => release(arg, scope));
    interactions.signals.on('down', (arg) => resume(arg, scope));
    interactions.signals.on('stop', (arg) => stop(arg));
    defaults.perAction.inertia = {
        enabled: false,
        resistance: 10,
        minSpeed: 100,
        endSpeed: 10,
        allowResume: true,
        smoothEndDuration: 300,
    };
    scope.usePlugin(modifiers);
}
function resume({ interaction, event, pointer, eventTarget }, scope) {
    const state = interaction.inertia;
    // Check if the down event hits the current inertia target
    if (state.active) {
        let element = eventTarget;
        // climb up the DOM tree from the event target
        while (utils.is.element(element)) {
            // if interaction element is the current inertia target element
            if (element === interaction.element) {
                // stop inertia
                raf.cancel(state.timeout);
                state.active = false;
                interaction.simulation = null;
                // update pointers to the down event's coordinates
                interaction.updatePointer(pointer, event, eventTarget, true);
                utils.pointer.setCoords(interaction.coords.cur, interaction.pointers.map((p) => p.pointer), interaction._now());
                // fire appropriate signals
                const signalArg = {
                    interaction,
                };
                scope.interactions.signals.fire('action-resume', signalArg);
                // fire a reume event
                const resumeEvent = new scope.InteractEvent(interaction, event, interaction.prepared.name, EventPhase.Resume, interaction.element);
                interaction._fireEvent(resumeEvent);
                utils.pointer.copyCoords(interaction.coords.prev, interaction.coords.cur);
                break;
            }
            element = utils.dom.parentNode(element);
        }
    }
}
function release({ interaction, event, noPreEnd }, scope) {
    const state = interaction.inertia;
    if (!interaction.interacting() ||
        (interaction.simulation && interaction.simulation.active) ||
        noPreEnd) {
        return null;
    }
    const options = getOptions(interaction);
    const now = interaction._now();
    const { client: velocityClient } = interaction.coords.velocity;
    const pointerSpeed = utils.hypot(velocityClient.x, velocityClient.y);
    let smoothEnd = false;
    let modifierResult;
    // check if inertia should be started
    const inertiaPossible = (options && options.enabled &&
        interaction.prepared.name !== 'gesture' &&
        event !== state.startEvent);
    const inertia = (inertiaPossible &&
        (now - interaction.coords.cur.timeStamp) < 50 &&
        pointerSpeed > options.minSpeed &&
        pointerSpeed > options.endSpeed);
    const modifierArg = {
        interaction,
        pageCoords: utils.extend({}, interaction.coords.cur.page),
        states: inertiaPossible && interaction.modifiers.states.map((modifierStatus) => utils.extend({}, modifierStatus)),
        preEnd: true,
        prevCoords: undefined,
        requireEndOnly: null,
    };
    // smoothEnd
    if (inertiaPossible && !inertia) {
        modifierArg.prevCoords = interaction.prevEvent.page;
        modifierArg.requireEndOnly = false;
        modifierResult = modifiers.setAll(modifierArg);
        if (modifierResult.changed) {
            smoothEnd = true;
        }
    }
    if (!(inertia || smoothEnd)) {
        return null;
    }
    utils.pointer.copyCoords(state.upCoords, interaction.coords.cur);
    interaction.pointers[0].pointer = state.startEvent = new scope.InteractEvent(interaction, event, 
    // FIXME add proper typing Action.name
    interaction.prepared.name, EventPhase.InertiaStart, interaction.element);
    state.t0 = now;
    state.active = true;
    state.allowResume = options.allowResume;
    interaction.simulation = state;
    interaction.interactable.fire(state.startEvent);
    if (inertia) {
        state.vx0 = interaction.coords.velocity.client.x;
        state.vy0 = interaction.coords.velocity.client.y;
        state.v0 = pointerSpeed;
        calcInertia(interaction, state);
        utils.extend(modifierArg.pageCoords, interaction.coords.cur.page);
        modifierArg.pageCoords.x += state.xe;
        modifierArg.pageCoords.y += state.ye;
        modifierArg.prevCoords = undefined;
        modifierArg.requireEndOnly = true;
        modifierResult = modifiers.setAll(modifierArg);
        state.modifiedXe += modifierResult.delta.x;
        state.modifiedYe += modifierResult.delta.y;
        state.timeout = raf.request(() => inertiaTick(interaction));
    }
    else {
        state.smoothEnd = true;
        state.xe = modifierResult.delta.x;
        state.ye = modifierResult.delta.y;
        state.sx = state.sy = 0;
        state.timeout = raf.request(() => smothEndTick(interaction));
    }
    return false;
}
function stop({ interaction }) {
    const state = interaction.inertia;
    if (state.active) {
        raf.cancel(state.timeout);
        state.active = false;
        interaction.simulation = null;
    }
}
function calcInertia(interaction, state) {
    const options = getOptions(interaction);
    const lambda = options.resistance;
    const inertiaDur = -Math.log(options.endSpeed / state.v0) / lambda;
    state.x0 = interaction.prevEvent.page.x;
    state.y0 = interaction.prevEvent.page.y;
    state.t0 = state.startEvent.timeStamp / 1000;
    state.sx = state.sy = 0;
    state.modifiedXe = state.xe = (state.vx0 - inertiaDur) / lambda;
    state.modifiedYe = state.ye = (state.vy0 - inertiaDur) / lambda;
    state.te = inertiaDur;
    state.lambda_v0 = lambda / state.v0;
    state.one_ve_v0 = 1 - options.endSpeed / state.v0;
}
function inertiaTick(interaction) {
    updateInertiaCoords(interaction);
    utils.pointer.setCoordDeltas(interaction.coords.delta, interaction.coords.prev, interaction.coords.cur);
    utils.pointer.setCoordVelocity(interaction.coords.velocity, interaction.coords.delta);
    const state = interaction.inertia;
    const options = getOptions(interaction);
    const lambda = options.resistance;
    const t = interaction._now() / 1000 - state.t0;
    if (t < state.te) {
        const progress = 1 - (Math.exp(-lambda * t) - state.lambda_v0) / state.one_ve_v0;
        if (state.modifiedXe === state.xe && state.modifiedYe === state.ye) {
            state.sx = state.xe * progress;
            state.sy = state.ye * progress;
        }
        else {
            const quadPoint = utils.getQuadraticCurvePoint(0, 0, state.xe, state.ye, state.modifiedXe, state.modifiedYe, progress);
            state.sx = quadPoint.x;
            state.sy = quadPoint.y;
        }
        interaction.move();
        state.timeout = raf.request(() => inertiaTick(interaction));
    }
    else {
        state.sx = state.modifiedXe;
        state.sy = state.modifiedYe;
        interaction.move();
        interaction.end(state.startEvent);
        state.active = false;
        interaction.simulation = null;
    }
    utils.pointer.copyCoords(interaction.coords.prev, interaction.coords.cur);
}
function smothEndTick(interaction) {
    updateInertiaCoords(interaction);
    const state = interaction.inertia;
    const t = interaction._now() - state.t0;
    const { smoothEndDuration: duration } = getOptions(interaction);
    if (t < duration) {
        state.sx = utils.easeOutQuad(t, 0, state.xe, duration);
        state.sy = utils.easeOutQuad(t, 0, state.ye, duration);
        interaction.move();
        state.timeout = raf.request(() => smothEndTick(interaction));
    }
    else {
        state.sx = state.xe;
        state.sy = state.ye;
        interaction.move();
        interaction.end(state.startEvent);
        state.smoothEnd =
            state.active = false;
        interaction.simulation = null;
    }
}
function updateInertiaCoords(interaction) {
    const state = interaction.inertia;
    // return if inertia isn't running
    if (!state.active) {
        return;
    }
    const pageUp = state.upCoords.page;
    const clientUp = state.upCoords.client;
    utils.pointer.setCoords(interaction.coords.cur, [{
            pageX: pageUp.x + state.sx,
            pageY: pageUp.y + state.sy,
            clientX: clientUp.x + state.sx,
            clientY: clientUp.y + state.sy,
        }], interaction._now());
}
function getOptions({ interactable, prepared }) {
    return interactable &&
        interactable.options &&
        prepared.name &&
        interactable.options[prepared.name].inertia;
}
export default {
    id: 'inertia',
    install,
    calcInertia,
    inertiaTick,
    smothEndTick,
    updateInertiaCoords,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDM0QsT0FBTyxTQUFTLE1BQU0sNEJBQTRCLENBQUE7QUFDbEQsT0FBTyxLQUFLLEtBQUssTUFBTSxtQkFBbUIsQ0FBQTtBQUMxQyxPQUFPLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQTtBQTBEdEMsVUFBa0IsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUNwQztBQUFFLFVBQWtCLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQTtBQUVuRCxTQUFTLE9BQU8sQ0FBRSxLQUFxQjtJQUNyQyxNQUFNLEVBQ0osWUFBWSxFQUNaLFFBQVEsR0FDVCxHQUFHLEtBQUssQ0FBQTtJQUVULFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRTtRQUNqRCxXQUFXLENBQUMsT0FBTyxHQUFHO1lBQ3BCLE1BQU0sRUFBTyxLQUFLO1lBQ2xCLFNBQVMsRUFBSSxLQUFLO1lBQ2xCLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLFFBQVEsRUFBSyxFQUFTO1lBQ3RCLE9BQU8sRUFBTSxJQUFJO1NBQ2xCLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUVGLDZCQUE2QjtJQUM3QixZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ2pGLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ25FLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFD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UUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQTtBQUMvQyxDQUFDO0FBRUQsZUFBZTtJQUNiLEVBQUUsRUFBRSxTQUFTO0lBQ2IsT0FBTztJQUNQLFdBQVc7SUFDWCxXQUFXO0lBQ1gsWUFBWTtJQUNaLG1CQUFtQjtDQUNwQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRQaGFzZSB9IGZyb20gJ0BpbnRlcmFjdGpzL2NvcmUvSW50ZXJhY3RFdmVudCdcbmltcG9ydCBtb2RpZmllcnMgZnJvbSAnQGludGVyYWN0anMvbW9kaWZpZXJzL2Jhc2UnXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAaW50ZXJhY3Rqcy91dGlscydcbmltcG9ydCByYWYgZnJvbSAnQGludGVyYWN0anMvdXRpbHMvcmFmJ1xuXG5kZWNsYXJlIG1vZHVsZSAnQGludGVyYWN0anMvY29yZS9JbnRlcmFjdEV2ZW50JyB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcbiAgZW51bSBFdmVudFBoYXNlIHtcbiAgICBSZXN1bWUgPSAncmVzdW1lJyxcbiAgICBJbmVydGlhU3RhcnQgPSAnaW5lcnRpYXN0YXJ0JyxcbiAgfVxufVxuXG5kZWNsYXJlIG1vZHVsZSAnQGludGVyYWN0anMvY29yZS9JbnRlcmFjdGlvbicge1xuICBpbnRlcmZhY2UgSW50ZXJhY3Rpb24ge1xuICAgIGluZXJ0aWE/OiB7XG4gICAgICBhY3RpdmU6IGJvb2xlYW5cbiAgICAgIHNtb290aEVuZDogYm9vbGVhblxuICAgICAgYWxsb3dSZXN1bWU6IGJvb2xlYW5cblxuICAgICAgc3RhcnRFdmVudD86IEludGVyYWN0LkludGVyYWN0RXZlbnRcbiAgICAgIHVwQ29vcmRzOiB7XG4gICAgICAgIHBhZ2U6IEludGVyYWN0LlBvaW50XG4gICAgICAgIGNsaWVudDogSW50ZXJhY3QuUG9pbnRcbiAgICAgICAgdGltZVN0YW1wOiBudW1iZXJcbiAgICAgIH1cblxuICAgICAgeGU/OiBudW1iZXJcbiAgICAgIHllPzogbnVtYmVyXG4gICAgICBzeD86IG51bWJlclxuICAgICAgc3k/OiBudW1iZXJcblxuICAgICAgdDA/OiBudW1iZXJcbiAgICAgIHRlPzogbnVtYmVyXG4gICAgICB2MD86IG51bWJlclxuICAgICAgdngwPzogbnVtYmVyXG4gICAgICB2eTA/OiBudW1iZXJcbiAgICAgIGR1cmF0aW9uPzogbnVtYmVyXG4gICAgICBtb2RpZmllZFhlPzogbnVtYmVyXG4gICAgICBtb2RpZmllZFllPzogbnVtYmVyXG5cbiAgICAgIGxhbWJkYV92MD86IG51bWJlciAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgb25lX3ZlX3YwPzogbnVtYmVyIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICB0aW1lb3V0OiBhbnlcbiAgICB9XG4gIH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgJ0BpbnRlcmFjdGpzL2NvcmUvZGVmYXVsdE9wdGlvbnMnIHtcbiAgaW50ZXJmYWNlIFBlckFjdGlvbkRlZmF1bHRzIHtcbiAgICBpbmVydGlhPzoge1xuICAgICAgZW5hYmxlZD86IGJvb2xlYW4sXG4gICAgICByZXNpc3RhbmNlPzogbnVtYmVyLCAgICAgICAgLy8gdGhlIGxhbWJkYSBpbiBleHBvbmVudGlhbCBkZWNheVxuICAgICAgbWluU3BlZWQ/OiBudW1iZXIsICAgICAgICAgIC8vIHRhcmdldCBzcGVlZCBtdXN0IGJlIGFib3ZlIHRoaXMgZm9yIGluZXJ0aWEgdG8gc3RhcnRcbiAgICAgIGVuZFNwZWVkPzogbnVtYmVyLCAgICAgICAgICAvLyB0aGUgc3BlZWQgYXQgd2hpY2ggaW5lcnRpYSBpcyBzbG93IGVub3VnaCB0byBzdG9wXG4gICAgICBhbGxvd1Jlc3VtZT86IHRydWUsICAgICAgICAgLy8gYWxsb3cgcmVzdW1pbmcgYW4gYWN0aW9uIGluIGluZXJ0aWEgcGhhc2VcbiAgICAgIHNtb290aEVuZER1cmF0aW9uPzogbnVtYmVyLCAvLyBhbmltYXRlIHRvIHNuYXAvcmVzdHJpY3QgZW5kT25seSBpZiB0aGVyZSdzIG5vIGluZXJ0aWFcbiAgICB9IHwgYm9vbGVhbiAvLyBGSVhNRVxuICB9XG59XG5cbihFdmVudFBoYXNlIGFzIGFueSkuUmVzdW1lID0gJ3Jlc3VtZSdcbjsgKEV2ZW50UGhhc2UgYXMgYW55KS5JbmVydGlhU3RhcnQgPSAnaW5lcnRpYXN0YXJ0J1xuXG5mdW5jdGlvbiBpbnN0YWxsIChzY29wZTogSW50ZXJhY3QuU2NvcGUpIHtcbiAgY29uc3Qge1xuICAgIGludGVyYWN0aW9ucyxcbiAgICBkZWZhdWx0cyxcbiAgfSA9IHNjb3BlXG5cbiAgaW50ZXJhY3Rpb25zLnNpZ25hbHMub24oJ25ldycsICh7IGludGVyYWN0aW9uIH0pID0+IHtcbiAgICBpbnRlcmFjdGlvbi5pbmVydGlhID0ge1xuICAgICAgYWN0aXZlICAgICA6IGZhbHNlLFxuICAgICAgc21vb3RoRW5kICA6IGZhbHNlLFxuICAgICAgYWxsb3dSZXN1bWU6IGZhbHNlLFxuICAgICAgdXBDb29yZHMgICA6IHt9IGFzIGFueSxcbiAgICAgIHRpbWVvdXQgICAgOiBudWxsLFxuICAgIH1cbiAgfSlcblxuICAvLyBGSVhNRSBwcm9wZXIgc2lnbmFsIHR5cGluZ1xuICBpbnRlcmFjdGlvbnMuc2lnbmFscy5vbignYmVmb3JlLWFjdGlvbi1lbmQnLCAoYXJnKSA9PiByZWxlYXNlKGFyZyBhcyBhbnksIHNjb3BlKSlcbiAgaW50ZXJhY3Rpb25zLnNpZ25hbHMub24oJ2Rvd24nLCAoYXJnKSA9PiByZXN1bWUoYXJnIGFzIGFueSwgc2NvcGUpKVxuICBpbnRlcmFjdGlvbnMuc2lnbmFscy5vbignc3RvcCcsIChhcmcpID0+IHN0b3AoYXJnIGFzIGFueSkpXG5cbiAgZGVmYXVsdHMucGVyQWN0aW9uLmluZXJ0aWEgPSB7XG4gICAgZW5hYmxlZCAgICAgICAgICA6IGZhbHNlLFxuICAgIHJlc2lzdGFuY2UgICAgICAgOiAxMCwgICAgLy8gdGhlIGxhbWJkYSBpbiBleHBvbmVudGlhbCBkZWNheVxuICAgIG1pblNwZWVkICAgICAgICAgOiAxMDAsICAgLy8gdGFyZ2V0IHNwZWVkIG11c3QgYmUgYWJvdmUgdGhpcyBmb3IgaW5lcnRpYSB0byBzdGFydFxuICAgIGVuZFNwZWVkICAgICAgICAgOiAxMCwgICAgLy8gdGhlIHNwZWVkIGF0IHdoaWNoIGluZXJ0aWEgaXMgc2xvdyBlbm91Z2ggdG8gc3RvcFxuICAgIGFsbG93UmVzdW1lICAgICAgOiB0cnVlLCAgLy8gYWxsb3cgcmVzdW1pbmcgYW4gYWN0aW9uIGluIGluZXJ0aWEgcGhhc2VcbiAgICBzbW9vdGhFbmREdXJhdGlvbjogMzAwLCAgIC8vIGFuaW1hdGUgdG8gc25hcC9yZXN0cmljdCBlbmRPbmx5IGlmIHRoZXJlJ3Mgbm8gaW5lcnRpYVxuICB9XG5cbiAgc2NvcGUudXNlUGx1Z2luKG1vZGlmaWVycylcbn1cblxuZnVuY3Rpb24gcmVzdW1lIChcbiAgeyBpbnRlcmFjdGlvbiwgZXZlbnQsIHBvaW50ZXIsIGV2ZW50VGFyZ2V0IH06IEludGVyYWN0LlNpZ25hbEFyZyxcbiAgc2NvcGU6IEludGVyYWN0LlNjb3BlXG4pIHtcbiAgY29uc3Qgc3RhdGUgPSBpbnRlcmFjdGlvbi5pbmVydGlhXG5cbiAgLy8gQ2hlY2sgaWYgdGhlIGRvd24gZXZlbnQgaGl0cyB0aGUgY3VycmVudCBpbmVydGlhIHRhcmdldFxuICBpZiAoc3RhdGUuYWN0aXZlKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBldmVudFRhcmdldFxuXG4gICAgLy8gY2xpbWIgdXAgdGhlIERPTSB0cmVlIGZyb20gdGhlIGV2ZW50IHRhcmdldFxuICAgIHdoaWxlICh1dGlscy5pcy5lbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgICAvLyBpZiBpbnRlcmFjdGlvbiBlbGVtZW50IGlzIHRoZSBjdXJyZW50IGluZXJ0aWEgdGFyZ2V0IGVsZW1lbnRcbiAgICAgIGlmIChlbGVtZW50ID09PSBpbnRlcmFjdGlvbi5lbGVtZW50KSB7XG4gICAgICAgIC8vIHN0b3AgaW5lcnRpYVxuICAgICAgICByYWYuY2FuY2VsKHN0YXRlLnRpbWVvdXQpXG4gICAgICAgIHN0YXRlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIGludGVyYWN0aW9uLnNpbXVsYXRpb24gPSBudWxsXG5cbiAgICAgICAgLy8gdXBkYXRlIHBvaW50ZXJzIHRvIHRoZSBkb3duIGV2ZW50J3MgY29vcmRpbmF0ZXNcbiAgICAgICAgaW50ZXJhY3Rpb24udXBkYXRlUG9pbnRlcihwb2ludGVyLCBldmVudCwgZXZlbnRUYXJnZXQsIHRydWUpXG4gICAgICAgIHV0aWxzLnBvaW50ZXIuc2V0Q29vcmRzKFxuICAgICAgICAgIGludGVyYWN0aW9uLmNvb3Jkcy5jdXIsXG4gICAgICAgICAgaW50ZXJhY3Rpb24ucG9pbnRlcnMubWFwKChwKSA9PiBwLnBvaW50ZXIpLFxuICAgICAgICAgIGludGVyYWN0aW9uLl9ub3coKVxuICAgICAgICApXG5cbiAgICAgICAgLy8gZmlyZSBhcHByb3ByaWF0ZSBzaWduYWxzXG4gICAgICAgIGNvbnN0IHNpZ25hbEFyZyA9IHtcbiAgICAgICAgICBpbnRlcmFjdGlvbixcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3BlLmludGVyYWN0aW9ucy5zaWduYWxzLmZpcmUoJ2FjdGlvbi1yZXN1bWUnLCBzaWduYWxBcmcpXG5cbiAgICAgICAgLy8gZmlyZSBhIHJldW1lIGV2ZW50XG4gICAgICAgIGNvbnN0IHJlc3VtZUV2ZW50ID0gbmV3IHNjb3BlLkludGVyYWN0RXZlbnQoXG4gICAgICAgICAgaW50ZXJhY3Rpb24sIGV2ZW50LCBpbnRlcmFjdGlvbi5wcmVwYXJlZC5uYW1lLCBFdmVudFBoYXNlLlJlc3VtZSwgaW50ZXJhY3Rpb24uZWxlbWVudClcblxuICAgICAgICBpbnRlcmFjdGlvbi5fZmlyZUV2ZW50KHJlc3VtZUV2ZW50KVxuXG4gICAgICAgIHV0aWxzLnBvaW50ZXIuY29weUNvb3JkcyhpbnRlcmFjdGlvbi5jb29yZHMucHJldiwgaW50ZXJhY3Rpb24uY29vcmRzLmN1cilcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgZWxlbWVudCA9IHV0aWxzLmRvbS5wYXJlbnROb2RlKGVsZW1lbnQpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2U8VCBleHRlbmRzIEludGVyYWN0LkFjdGlvbk5hbWU+IChcbiAgeyBpbnRlcmFjdGlvbiwgZXZlbnQsIG5vUHJlRW5kIH06IEludGVyYWN0LlNpZ25hbEFyZyxcbiAgc2NvcGU6IEludGVyYWN0LlNjb3BlXG4pIHtcbiAgY29uc3Qgc3RhdGUgPSBpbnRlcmFjdGlvbi5pbmVydGlhXG5cbiAgaWYgKCFpbnRlcmFjdGlvbi5pbnRlcmFjdGluZygpIHx8XG4gICAgKGludGVyYWN0aW9uLnNpbXVsYXRpb24gJiYgaW50ZXJhY3Rpb24uc2ltdWxhdGlvbi5hY3RpdmUpIHx8XG4gIG5vUHJlRW5kKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IG9wdGlvbnMgPSBnZXRPcHRpb25zKGludGVyYWN0aW9uKVxuXG4gIGNvbnN0IG5vdyA9IGludGVyYWN0aW9uLl9ub3coKVxuICBjb25zdCB7IGNsaWVudDogdmVsb2NpdHlDbGllbnQgfSA9IGludGVyYWN0aW9uLmNvb3Jkcy52ZWxvY2l0eVxuICBjb25zdCBwb2ludGVyU3BlZWQgPSB1dGlscy5oeXBvdCh2ZWxvY2l0eUNsaWVudC54LCB2ZWxvY2l0eUNsaWVudC55KVxuXG4gIGxldCBzbW9vdGhFbmQgPSBmYWxzZVxuICBsZXQgbW9kaWZpZXJSZXN1bHQ6IFJldHVyblR5cGU8dHlwZW9mIG1vZGlmaWVycy5zZXRBbGw+XG5cbiAgLy8gY2hlY2sgaWYgaW5lcnRpYSBzaG91bGQgYmUgc3RhcnRlZFxuICBjb25zdCBpbmVydGlhUG9zc2libGUgPSAob3B0aW9ucyAmJiBvcHRpb25zLmVuYWJsZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgIGludGVyYWN0aW9uLnByZXBhcmVkLm5hbWUgIT09ICdnZXN0dXJlJyAmJlxuICAgICAgICAgICAgICAgICAgICAgZXZlbnQgIT09IHN0YXRlLnN0YXJ0RXZlbnQpXG5cbiAgY29uc3QgaW5lcnRpYSA9IChpbmVydGlhUG9zc2libGUgJiZcbiAgICAobm93IC0gaW50ZXJhY3Rpb24uY29vcmRzLmN1ci50aW1lU3RhbXApIDwgNTAgJiZcbiAgICBwb2ludGVyU3BlZWQgPiBvcHRpb25zLm1pblNwZWVkICYmXG4gICAgcG9pbnRlclNwZWVkID4gb3B0aW9ucy5lbmRTcGVlZClcblxuICBjb25zdCBtb2RpZmllckFyZyA9IHtcbiAgICBpbnRlcmFjdGlvbixcbiAgICBwYWdlQ29vcmRzOiB1dGlscy5leHRlbmQoe30sIGludGVyYWN0aW9uLmNvb3Jkcy5jdXIucGFnZSksXG4gICAgc3RhdGVzOiBpbmVydGlhUG9zc2libGUgJiYgaW50ZXJhY3Rpb24ubW9kaWZpZXJzLnN0YXRlcy5tYXAoXG4gICAgICAobW9kaWZpZXJTdGF0dXMpID0+IHV0aWxzLmV4dGVuZCh7fSwgbW9kaWZpZXJTdGF0dXMpXG4gICAgKSxcbiAgICBwcmVFbmQ6IHRydWUsXG4gICAgcHJldkNvb3JkczogdW5kZWZpbmVkLFxuICAgIHJlcXVpcmVFbmRPbmx5OiBudWxsLFxuICB9XG5cbiAgLy8gc21vb3RoRW5kXG4gIGlmIChpbmVydGlhUG9zc2libGUgJiYgIWluZXJ0aWEpIHtcbiAgICBtb2RpZmllckFyZy5wcmV2Q29vcmRzID0gaW50ZXJhY3Rpb24ucHJldkV2ZW50LnBhZ2VcbiAgICBtb2RpZmllckFyZy5yZXF1aXJlRW5kT25seSA9IGZhbHNlXG4gICAgbW9kaWZpZXJSZXN1bHQgPSBtb2RpZmllcnMuc2V0QWxsKG1vZGlmaWVyQXJnKVxuXG4gICAgaWYgKG1vZGlmaWVyUmVzdWx0LmNoYW5nZWQpIHtcbiAgICAgIHNtb290aEVuZCA9IHRydWVcbiAgICB9XG4gIH1cblxuICBpZiAoIShpbmVydGlhIHx8IHNtb290aEVuZCkpIHsgcmV0dXJuIG51bGwgfVxuXG4gIHV0aWxzLnBvaW50ZXIuY29weUNvb3JkcyhzdGF0ZS51cENvb3JkcywgaW50ZXJhY3Rpb24uY29vcmRzLmN1cilcblxuICBpbnRlcmFjdGlvbi5wb2ludGVyc1swXS5wb2ludGVyID0gc3RhdGUuc3RhcnRFdmVudCA9IG5ldyBzY29wZS5JbnRlcmFjdEV2ZW50KFxuICAgIGludGVyYWN0aW9uLFxuICAgIGV2ZW50LFxuICAgIC8vIEZJWE1FIGFkZCBwcm9wZXIgdHlwaW5nIEFjdGlvbi5uYW1lXG4gICAgaW50ZXJhY3Rpb24ucHJlcGFyZWQubmFtZSBhcyBULFxuICAgIEV2ZW50UGhhc2UuSW5lcnRpYVN0YXJ0LFxuICAgIGludGVyYWN0aW9uLmVsZW1lbnQsXG4gIClcblxuICBzdGF0ZS50MCA9IG5vd1xuXG4gIHN0YXRlLmFjdGl2ZSA9IHRydWVcbiAgc3RhdGUuYWxsb3dSZXN1bWUgPSBvcHRpb25zLmFsbG93UmVzdW1lXG4gIGludGVyYWN0aW9uLnNpbXVsYXRpb24gPSBzdGF0ZVxuXG4gIGludGVyYWN0aW9uLmludGVyYWN0YWJsZS5maXJlKHN0YXRlLnN0YXJ0RXZlbnQpXG5cbiAgaWYgKGluZXJ0aWEpIHtcbiAgICBzdGF0ZS52eDAgPSBpbnRlcmFjdGlvbi5jb29yZHMudmVsb2NpdHkuY2xpZW50LnhcbiAgICBzdGF0ZS52eTAgPSBpbnRlcmFjdGlvbi5jb29yZHMudmVsb2NpdHkuY2xpZW50LnlcbiAgICBzdGF0ZS52MCA9IHBvaW50ZXJTcGVlZFxuXG4gICAgY2FsY0luZXJ0aWEoaW50ZXJhY3Rpb24sIHN0YXRlKVxuXG4gICAgdXRpbHMuZXh0ZW5kKG1vZGlmaWVyQXJnLnBhZ2VDb29yZHMsIGludGVyYWN0aW9uLmNvb3Jkcy5jdXIucGFnZSlcblxuICAgIG1vZGlmaWVyQXJnLnBhZ2VDb29yZHMueCArPSBzdGF0ZS54ZVxuICAgIG1vZGlmaWVyQXJnLnBhZ2VDb29yZHMueSArPSBzdGF0ZS55ZVxuICAgIG1vZGlmaWVyQXJnLnByZXZDb29yZHMgPSB1bmRlZmluZWRcbiAgICBtb2RpZmllckFyZy5yZXF1aXJlRW5kT25seSA9IHRydWVcblxuICAgIG1vZGlmaWVyUmVzdWx0ID0gbW9kaWZpZXJzLnNldEFsbChtb2RpZmllckFyZylcblxuICAgIHN0YXRlLm1vZGlmaWVkWGUgKz0gbW9kaWZpZXJSZXN1bHQuZGVsdGEueFxuICAgIHN0YXRlLm1vZGlmaWVkWWUgKz0gbW9kaWZpZXJSZXN1bHQuZGVsdGEueVxuXG4gICAgc3RhdGUudGltZW91dCA9IHJhZi5yZXF1ZXN0KCgpID0+IGluZXJ0aWFUaWNrKGludGVyYWN0aW9uKSlcbiAgfVxuICBlbHNlIHtcbiAgICBzdGF0ZS5zbW9vdGhFbmQgPSB0cnVlXG4gICAgc3RhdGUueGUgPSBtb2RpZmllclJlc3VsdC5kZWx0YS54XG4gICAgc3RhdGUueWUgPSBtb2RpZmllclJlc3VsdC5kZWx0YS55XG5cbiAgICBzdGF0ZS5zeCA9IHN0YXRlLnN5ID0gMFxuXG4gICAgc3RhdGUudGltZW91dCA9IHJhZi5yZXF1ZXN0KCgpID0+IHNtb3RoRW5kVGljayhpbnRlcmFjdGlvbikpXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gc3RvcCAoeyBpbnRlcmFjdGlvbiB9OiBJbnRlcmFjdC5TaWduYWxBcmcpIHtcbiAgY29uc3Qgc3RhdGUgPSBpbnRlcmFjdGlvbi5pbmVydGlhXG4gIGlmIChzdGF0ZS5hY3RpdmUpIHtcbiAgICByYWYuY2FuY2VsKHN0YXRlLnRpbWVvdXQpXG4gICAgc3RhdGUuYWN0aXZlID0gZmFsc2VcbiAgICBpbnRlcmFjdGlvbi5zaW11bGF0aW9uID0gbnVsbFxuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGNJbmVydGlhIChpbnRlcmFjdGlvbjogSW50ZXJhY3QuSW50ZXJhY3Rpb24sIHN0YXRlKSB7XG4gIGNvbnN0IG9wdGlvbnMgPSBnZXRPcHRpb25zKGludGVyYWN0aW9uKVxuICBjb25zdCBsYW1iZGEgPSBvcHRpb25zLnJlc2lzdGFuY2VcbiAgY29uc3QgaW5lcnRpYUR1ciA9IC1NYXRoLmxvZyhvcHRpb25zLmVuZFNwZWVkIC8gc3RhdGUudjApIC8gbGFtYmRhXG5cbiAgc3RhdGUueDAgPSBpbnRlcmFjdGlvbi5wcmV2RXZlbnQucGFnZS54XG4gIHN0YXRlLnkwID0gaW50ZXJhY3Rpb24ucHJldkV2ZW50LnBhZ2UueVxuICBzdGF0ZS50MCA9IHN0YXRlLnN0YXJ0RXZlbnQudGltZVN0YW1wIC8gMTAwMFxuICBzdGF0ZS5zeCA9IHN0YXRlLnN5ID0gMFxuXG4gIHN0YXRlLm1vZGlmaWVkWGUgPSBzdGF0ZS54ZSA9IChzdGF0ZS52eDAgLSBpbmVydGlhRHVyKSAvIGxhbWJkYVxuICBzdGF0ZS5tb2RpZmllZFllID0gc3RhdGUueWUgPSAoc3RhdGUudnkwIC0gaW5lcnRpYUR1cikgLyBsYW1iZGFcbiAgc3RhdGUudGUgPSBpbmVydGlhRHVyXG5cbiAgc3RhdGUubGFtYmRhX3YwID0gbGFtYmRhIC8gc3RhdGUudjBcbiAgc3RhdGUub25lX3ZlX3YwID0gMSAtIG9wdGlvbnMuZW5kU3BlZWQgLyBzdGF0ZS52MFxufVxuXG5mdW5jdGlvbiBpbmVydGlhVGljayAoaW50ZXJhY3Rpb246IEludGVyYWN0LkludGVyYWN0aW9uKSB7XG4gIHVwZGF0ZUluZXJ0aWFDb29yZHMoaW50ZXJhY3Rpb24pXG4gIHV0aWxzLnBvaW50ZXIuc2V0Q29vcmREZWx0YXMoaW50ZXJhY3Rpb24uY29vcmRzLmRlbHRhLCBpbnRlcmFjdGlvbi5jb29yZHMucHJldiwgaW50ZXJhY3Rpb24uY29vcmRzLmN1cilcbiAgdXRpbHMucG9pbnRlci5zZXRDb29yZFZlbG9jaXR5KGludGVyYWN0aW9uLmNvb3Jkcy52ZWxvY2l0eSwgaW50ZXJhY3Rpb24uY29vcmRzLmRlbHRhKVxuXG4gIGNvbnN0IHN0YXRlID0gaW50ZXJhY3Rpb24uaW5lcnRpYVxuICBjb25zdCBvcHRpb25zID0gZ2V0T3B0aW9ucyhpbnRlcmFjdGlvbilcbiAgY29uc3QgbGFtYmRhID0gb3B0aW9ucy5yZXNpc3RhbmNlXG4gIGNvbnN0IHQgPSBpbnRlcmFjdGlvbi5fbm93KCkgLyAxMDAwIC0gc3RhdGUudDBcblxuICBpZiAodCA8IHN0YXRlLnRlKSB7XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSAgMSAtIChNYXRoLmV4cCgtbGFtYmRhICogdCkgLSBzdGF0ZS5sYW1iZGFfdjApIC8gc3RhdGUub25lX3ZlX3YwXG5cbiAgICBpZiAoc3RhdGUubW9kaWZpZWRYZSA9PT0gc3RhdGUueGUgJiYgc3RhdGUubW9kaWZpZWRZZSA9PT0gc3RhdGUueWUpIHtcbiAgICAgIHN0YXRlLnN4ID0gc3RhdGUueGUgKiBwcm9ncmVzc1xuICAgICAgc3RhdGUuc3kgPSBzdGF0ZS55ZSAqIHByb2dyZXNzXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgcXVhZFBvaW50ID0gdXRpbHMuZ2V0UXVhZHJhdGljQ3VydmVQb2ludChcbiAgICAgICAgMCwgMCxcbiAgICAgICAgc3RhdGUueGUsIHN0YXRlLnllLFxuICAgICAgICBzdGF0ZS5tb2RpZmllZFhlLCBzdGF0ZS5tb2RpZmllZFllLFxuICAgICAgICBwcm9ncmVzcylcblxuICAgICAgc3RhdGUuc3ggPSBxdWFkUG9pbnQueFxuICAgICAgc3RhdGUuc3kgPSBxdWFkUG9pbnQueVxuICAgIH1cblxuICAgIGludGVyYWN0aW9uLm1vdmUoKVxuXG4gICAgc3RhdGUudGltZW91dCA9IHJhZi5yZXF1ZXN0KCgpID0+IGluZXJ0aWFUaWNrKGludGVyYWN0aW9uKSlcbiAgfVxuICBlbHNlIHtcbiAgICBzdGF0ZS5zeCA9IHN0YXRlLm1vZGlmaWVkWGVcbiAgICBzdGF0ZS5zeSA9IHN0YXRlLm1vZGlmaWVkWWVcblxuICAgIGludGVyYWN0aW9uLm1vdmUoKVxuICAgIGludGVyYWN0aW9uLmVuZChzdGF0ZS5zdGFydEV2ZW50KVxuICAgIHN0YXRlLmFjdGl2ZSA9IGZhbHNlXG4gICAgaW50ZXJhY3Rpb24uc2ltdWxhdGlvbiA9IG51bGxcbiAgfVxuXG4gIHV0aWxzLnBvaW50ZXIuY29weUNvb3JkcyhpbnRlcmFjdGlvbi5jb29yZHMucHJldiwgaW50ZXJhY3Rpb24uY29vcmRzLmN1cilcbn1cblxuZnVuY3Rpb24gc21vdGhFbmRUaWNrIChpbnRlcmFjdGlvbjogSW50ZXJhY3QuSW50ZXJhY3Rpb24pIHtcbiAgdXBkYXRlSW5lcnRpYUNvb3JkcyhpbnRlcmFjdGlvbilcblxuICBjb25zdCBzdGF0ZSA9IGludGVyYWN0aW9uLmluZXJ0aWFcbiAgY29uc3QgdCA9IGludGVyYWN0aW9uLl9ub3coKSAtIHN0YXRlLnQwXG4gIGNvbnN0IHsgc21vb3RoRW5kRHVyYXRpb246IGR1cmF0aW9uIH0gPSBnZXRPcHRpb25zKGludGVyYWN0aW9uKVxuXG4gIGlmICh0IDwgZHVyYXRpb24pIHtcbiAgICBzdGF0ZS5zeCA9IHV0aWxzLmVhc2VPdXRRdWFkKHQsIDAsIHN0YXRlLnhlLCBkdXJhdGlvbilcbiAgICBzdGF0ZS5zeSA9IHV0aWxzLmVhc2VPdXRRdWFkKHQsIDAsIHN0YXRlLnllLCBkdXJhdGlvbilcblxuICAgIGludGVyYWN0aW9uLm1vdmUoKVxuXG4gICAgc3RhdGUudGltZW91dCA9IHJhZi5yZXF1ZXN0KCgpID0+IHNtb3RoRW5kVGljayhpbnRlcmFjdGlvbikpXG4gIH1cbiAgZWxzZSB7XG4gICAgc3RhdGUuc3ggPSBzdGF0ZS54ZVxuICAgIHN0YXRlLnN5ID0gc3RhdGUueWVcblxuICAgIGludGVyYWN0aW9uLm1vdmUoKVxuICAgIGludGVyYWN0aW9uLmVuZChzdGF0ZS5zdGFydEV2ZW50KVxuXG4gICAgc3RhdGUuc21vb3RoRW5kID1cbiAgICAgIHN0YXRlLmFjdGl2ZSA9IGZhbHNlXG4gICAgaW50ZXJhY3Rpb24uc2ltdWxhdGlvbiA9IG51bGxcbiAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVJbmVydGlhQ29vcmRzIChpbnRlcmFjdGlvbjogSW50ZXJhY3QuSW50ZXJhY3Rpb24pIHtcbiAgY29uc3Qgc3RhdGUgPSBpbnRlcmFjdGlvbi5pbmVydGlhXG5cbiAgLy8gcmV0dXJuIGlmIGluZXJ0aWEgaXNuJ3QgcnVubmluZ1xuICBpZiAoIXN0YXRlLmFjdGl2ZSkgeyByZXR1cm4gfVxuXG4gIGNvbnN0IHBhZ2VVcCAgID0gc3RhdGUudXBDb29yZHMucGFnZVxuICBjb25zdCBjbGllbnRVcCA9IHN0YXRlLnVwQ29vcmRzLmNsaWVudFxuXG4gIHV0aWxzLnBvaW50ZXIuc2V0Q29vcmRzKGludGVyYWN0aW9uLmNvb3Jkcy5jdXIsIFsge1xuICAgIHBhZ2VYICA6IHBhZ2VVcC54ICAgKyBzdGF0ZS5zeCxcbiAgICBwYWdlWSAgOiBwYWdlVXAueSAgICsgc3RhdGUuc3ksXG4gICAgY2xpZW50WDogY2xpZW50VXAueCArIHN0YXRlLnN4LFxuICAgIGNsaWVudFk6IGNsaWVudFVwLnkgKyBzdGF0ZS5zeSxcbiAgfSBdLCBpbnRlcmFjdGlvbi5fbm93KCkpXG59XG5cbmZ1bmN0aW9uIGdldE9wdGlvbnMgKHsgaW50ZXJhY3RhYmxlLCBwcmVwYXJlZCB9OiBJbnRlcmFjdC5JbnRlcmFjdGlvbikge1xuICByZXR1cm4gaW50ZXJhY3RhYmxlICYmXG4gICAgaW50ZXJhY3RhYmxlLm9wdGlvbnMgJiZcbiAgICBwcmVwYXJlZC5uYW1lICYmXG4gICAgaW50ZXJhY3RhYmxlLm9wdGlvbnNbcHJlcGFyZWQubmFtZV0uaW5lcnRpYVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGlkOiAnaW5lcnRpYScsXG4gIGluc3RhbGwsXG4gIGNhbGNJbmVydGlhLFxuICBpbmVydGlhVGljayxcbiAgc21vdGhFbmRUaWNrLFxuICB1cGRhdGVJbmVydGlhQ29vcmRzLFxufVxuIl19