class EventDispatcher {
    element: HTMLElement;

    constructor(selector: string){
        this.element = document.querySelector(selector)
    }

    subscribe(eventName: string, fn: (event: Event) => void) {
        this.element.addEventListener(eventName, fn)
    }

    unsubscribe(eventName: string, fn: (event: Event) => void) {
        this.element.removeEventListener(eventName, fn)
    }

    broadcast(eventName: string, payload: any) {
        this.element.dispatchEvent(
            new CustomEvent(eventName, {
                detail: {
                    payload: payload
                }
            })
        )
    }
}

const ViewManager = new EventDispatcher("#root");

export {ViewManager}