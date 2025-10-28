import { useState, useEffect } from 'react';
import type { User, Order } from '../types';
import { auth } from '../firebaseConfig';
import { getErrorMessage } from '../utils';

const AccountPage = ({ user }: { user: User | null }) => {
    const [activeTab, setActiveTab] = useState('history');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Authentication required.");
        return await currentUser.getIdToken();
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                setIsLoading(true);
                setError(null);
                try {
                    const token = await getToken();
                    const response = await fetch(`/api/orders/${user.uid}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Failed to fetch orders.');
                    const data = await response.json();
                    setOrders(data);
                } catch (err: any) {
                    setError(getErrorMessage(err));
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (activeTab === 'history') {
            fetchOrders();
        }
    }, [user, activeTab]);

    const OrderHistory = () => {
        if (isLoading) return <div className="text-center p-8">Loading order history...</div>;
        if (error) return <div className="text-center p-8 text-red-400">{error}</div>;
        if (orders.length === 0) return <div className="text-center p-8 text-gray-400">You have no orders yet.</div>;

        return (
             <table className="w-full text-left">
                <thead className="bg-brand-gray/60">
                    <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                         <tr key={order.id} className="border-b border-gray-700 hover:bg-brand-gray/50">
                            <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="p-3">{order.package} Plan</td>
                            <td className="p-3">${order.amount}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'completed' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

     const ProfileSettings = () => (
        <div>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <input type="text" value={user?.displayName || 'N/A'} readOnly className="w-full mt-1 bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600"/>
                </div>
                 <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <input type="email" value={user?.email || 'N/A'} readOnly className="w-full mt-1 bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600"/>
                </div>
                <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg opacity-50 cursor-not-allowed">Change Password (Coming Soon)</button>
            </div>
        </div>
    );

    const AccountContent = () => {
        switch (activeTab) {
            case 'history': return <OrderHistory />;
            case 'settings': return <ProfileSettings />;
            default: return null;
        }
    }

    if (!user) {
        return <div className="text-center py-20">Please log in to view your account.</div>;
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-brand-gray/30 p-8 rounded-2xl border border-brand-primary/20 mt-12">
            <aside className="w-full md:w-1/4">
                 <h1 className="text-2xl font-bold text-white mb-6">My Account</h1>
                <nav className="flex flex-col space-y-2">
                    <button onClick={() => setActiveTab('history')} className={`text-left p-3 rounded-lg capitalize transition-colors ${activeTab === 'history' ? 'bg-brand-primary text-brand-dark font-bold' : 'hover:bg-brand-gray/50 text-gray-300'}`}>
                        Order History
                    </button>
                     <button onClick={() => setActiveTab('settings')} className={`text-left p-3 rounded-lg capitalize transition-colors ${activeTab === 'settings' ? 'bg-brand-primary text-brand-dark font-bold' : 'hover:bg-brand-gray/50 text-gray-300'}`}>
                        Profile Settings
                    </button>
                </nav>
            </aside>
            <main className="w-full md:w-3/4 bg-brand-dark/30 p-6 rounded-lg">
                <AccountContent/>
            </main>
        </div>
    );
};

export default AccountPage;