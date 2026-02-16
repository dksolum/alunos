
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PrintPortalProps {
    children: React.ReactNode;
}

export const PrintPortal: React.FC<PrintPortalProps> = ({ children }) => {
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        let node = document.getElementById('print-root');
        if (!node) {
            node = document.createElement('div');
            node.id = 'print-root';
            document.body.appendChild(node);
        }
        setMountNode(node);

        // Add class to body when portal is active
        document.body.classList.add('printing-portal');

        return () => {
            document.body.classList.remove('printing-portal');
        };
    }, []);

    if (!mountNode) return null;

    return createPortal(
        <div className="print-portal-content">
            {children}
        </div>,
        mountNode
    );
};
