"use client";

import React from 'react';
import Profile from '@/components/Profile';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';
import { Language } from '@/lib/translations';

export default function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = React.use(params);
    const lang = langParam as Language;
    const router = useRouter();
    const { 
        user, habits, finances, savingsGoals, activityLog, currencySymbol, handleLogout 
    } = useDashboard();

    return (
        <Profile
            lang={lang}
            user={user}
            habits={habits}
            finances={finances}
            savingsGoals={savingsGoals}
            activityLog={activityLog}
            habitsCount={habits.length}
            financesCount={finances.length}
            savingsGoalsCount={savingsGoals.length}
            currencySymbol={currencySymbol}
            onLanguageChange={(l) => router.push(`/${l}/profile`)}
            onLogout={handleLogout}
        />
    );
}
