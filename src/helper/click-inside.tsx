"use client"

import { MutableRefObject, useEffect } from "react";

export function clickInsideElement(ref: MutableRefObject<any>, handler: () => void) {
    useEffect(() => {
        const listener = (ev: Event) => {
            // close if clicking ref's element or descendent elements
            if(!ref?.current || ref.current.contains(ev.target)) return handler()

            return
        }

        // event listener
        document.addEventListener('click', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('click', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler])
}