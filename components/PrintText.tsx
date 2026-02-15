import React from 'react';

interface PrintTextProps {
    content: string;
    className?: string;
}

export const PrintText: React.FC<PrintTextProps> = ({ content, className = '' }) => {
    if (!content) return null;
    return (
        <div className={`hidden print:block whitespace-pre-wrap text-black border border-gray-300 rounded p-2 mt-1 ${className}`}>
            {content}
        </div>
    );
};
