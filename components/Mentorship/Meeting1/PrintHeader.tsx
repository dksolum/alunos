import React from 'react';
import { User } from '../../../types';

interface PrintHeaderProps {
    user: User;
    title: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ user, title }) => {
    return (
        <div className="hidden print:block mb-8 border-b pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">Relatório de Mentoria Financeira</p>
                </div>
                <div className="text-right text-sm text-gray-700">
                    <p className="font-bold">{user.name}</p>
                    <p>{user.email}</p>
                    <p>{user.whatsapp}</p>
                </div>
            </div>
        </div>
    );
};
