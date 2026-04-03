import { redirect } from 'next/navigation';

export default function RootPage() {
    // Hard redirect to the entry locale node
    redirect('/ua');
}
