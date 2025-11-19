'use client'
import { useEffect, useState } from 'react';

// this component will return a fixed component of event that just occured
export default function PopUpMessage({ title, message, duration = 3000, titleColor = 'white', onClose }) {

    const [isVisible, setIsVisible] = useState(false);

    // Map prop values to full Tailwind classes
    // This ensures Tailwind's JIT compiler can find and generate them.
    const titleColorClasses = {
        white: 'text-white',
        green: 'text-green-400',
        red: 'text-red-400',
        blue: 'text-blue-400',
    };

    useEffect(() => {
        // 1. Trigger the "in" animation shortly after mounting
        const enterTimeout = setTimeout(() => {
            setIsVisible(true);
        }, 50); // Small delay to ensure initial state is rendered first

        // 2. Trigger the "out" animation after the specified duration
        const exitTimeout = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        // 3. Call the onClose prop to unmount the component after the "out" animation finishes
        const unmountTimeout = setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, duration + 500); // duration + animation time

        return () => {
            clearTimeout(enterTimeout); // clear timeout
            clearTimeout(exitTimeout);
            clearTimeout(unmountTimeout);
        };
    }, [duration, onClose]);

    return (<>
        <div className={`min-w-30 z-50 p-3 rounded-xl h-fit bg-gray fixed top-5 left-5 dark:bg-gray-900 bg-gray-400 border-1 border-gray-700 transition-transform duration-500 ease-in-out ${isVisible ? 'translate-x-0' : '-translate-x-[120%]'}`}> {/* popup message card */}
            <h3 className={`${titleColorClasses[titleColor] || 'text-white'} text-2xl font-extrabold`}>{title}</h3>
            <h3 className={`dark:text-white text-black text-sm text-start mt-2`}>{message}</h3>
        </div>

    </>)
}