export default function EditButton({ onClick, className }) {

    return (
        <button
            onClick={onClick}
            className={`
                flex items-center justify-center 
                w-9 h-9 
                bg-transparent dark:bg-transparent
                text-black dark:text-white
                rounded-full 
                hover:bg-blue-200 dark:hover:bg-blue-800/70 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                transition-colors duration-150
                cursor-pointer
                ${className || ''}
            `}
            aria-label="Edit"
        >
            <i className="fa-solid fa-pencil text-sm"></i>
        </button>
    );
}