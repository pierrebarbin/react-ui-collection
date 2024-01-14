import { PropsWithChildren } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <main className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            {children}
        </main>
    );
}
