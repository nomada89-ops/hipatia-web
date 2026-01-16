'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export default function IdleTimer() {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Function to clean up session
        const logout = () => {
            if (typeof window !== 'undefined') {
                const hasToken = localStorage.getItem('user_token') || localStorage.getItem('token');
                if (hasToken) {
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('token');
                    // Force redirect to login with query param
                    window.location.href = '/?timeout=true';
                }
            }
        };

        // Function to reset timer
        const resetTimer = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
        };

        // Events to listen for
        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [router]);

    return null; // This component renders nothing
}
