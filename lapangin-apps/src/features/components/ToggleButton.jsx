'use client'

/**
 * FIXME: animation not sync with the initial state
 */

// imports
import { useRef } from 'react';

export default function ToggleButton({ isActive = true, onClick, className}) {
    // state
    const element = useRef(null);

    const activeState = isActive ?
        "relative rounded-full w-10 h-5 bg-green-600 flex justify-start items-center p-[3px] transition-colors duration-100" :
        "relative rounded-full w-10 h-5 bg-gray-700 flex justify-start items-center p-[3px] transition-colors duration-100";

    // animation handler


    return (<>
    <div className={className}>
        <div ref={element} className={activeState} onClick={() => {onClick();}}> {/* outline */}
            <div className={isActive ? 'absolute bg-white rounded-full size-4 transition-transform duration-100 translate-x-[19px]' : 'absolute bg-gray-400 rounded-full size-4 duration-100 transition-transform translate-x-0'}> {/* main handle*/}</div>
        </div>
    </div>

    </>)
}