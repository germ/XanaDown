import pointerExtend from './pointerExtend';
declare const pointerUtils: {
    copyCoords(dest: any, src: any): void;
    setCoordDeltas(targetObj: any, prev: any, cur: any): void;
    setCoordVelocity(targetObj: any, delta: any): void;
    isNativePointer(pointer: any): boolean;
    getXY(type: any, pointer: any, xy: any): any;
    getPageXY(pointer: import("../types/types").PointerType, page?: import("../types/types").Point): import("../types/types").Point;
    getClientXY(pointer: any, client: any): any;
    getPointerId(pointer: any): any;
    setCoords(targetObj: any, pointers: any[], timeStamp: number): void;
    pointerExtend: typeof pointerExtend;
    getTouchPair(event: any): any[];
    pointerAverage(pointers: PointerEvent[] | Event[]): {
        pageX: number;
        pageY: number;
        clientX: number;
        clientY: number;
        screenX: number;
        screenY: number;
    };
    touchBBox(event: Event | (Touch | MouseEvent | PointerEvent | TouchEvent | import("@interactjs/core/InteractEvent").InteractEvent<any, any>)[]): {
        x: number;
        y: number;
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
    };
    touchDistance(event: any, deltaSource: any): number;
    touchAngle(event: any, deltaSource: any): number;
    getPointerType(pointer: any): any;
    getEventTargets(event: any): any[];
    newCoords(): {
        page: {
            x: number;
            y: number;
        };
        client: {
            x: number;
            y: number;
        };
        timeStamp: number;
    };
    coordsToEvent(coords: MockCoords): ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & Touch & MouseEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & Touch & PointerEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & Touch & TouchEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & Touch & import("@interactjs/core/InteractEvent").InteractEvent<any, any>) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & MouseEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & MouseEvent & PointerEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & MouseEvent & TouchEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & MouseEvent & import("@interactjs/core/InteractEvent").InteractEvent<any, any>) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & PointerEvent & MouseEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & PointerEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & PointerEvent & TouchEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & PointerEvent & import("@interactjs/core/InteractEvent").InteractEvent<any, any>) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & import("@interactjs/core/InteractEvent").InteractEvent<any, any> & MouseEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & import("@interactjs/core/InteractEvent").InteractEvent<any, any> & PointerEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & import("@interactjs/core/InteractEvent").InteractEvent<any, any> & TouchEvent) | ({
        coords: MockCoords;
        readonly page: any;
        readonly client: any;
        readonly timeStamp: any;
        readonly pageX: any;
        readonly pageY: any;
        readonly clientX: any;
        readonly clientY: any;
        readonly pointerId: any;
        readonly target: any;
        readonly type: any;
        readonly pointerType: any;
    } & import("@interactjs/core/InteractEvent").InteractEvent<any, any>);
};
export default pointerUtils;
export interface MockCoords {
    page: Interact.Point;
    client: Interact.Point;
    timeStamp?: number;
    pointerId?: any;
    target?: any;
    type?: string;
    pointerType?: string;
}
