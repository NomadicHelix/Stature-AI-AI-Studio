import React, { useState, useEffect } from 'react';
import type { User, Order } from '../types';
import { auth } from '../firebaseConfig';
import { getErrorMessage } from '../utils';
import Spinner from './Spinner';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getToken = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Authentication required.");
        return await currentUser.getIdToken();
    };

    const fetchData = async (endpoint: 'users' | 'orders') => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`/api/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch ${endpoint}.`);
            }
            const data = await response.json();
            if (endpoint === 'users') setUsers(data);
            if (endpoint === 'orders') setOrders(data);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(activeTab as 'users' | 'orders');
    }, [activeTab]);
    
    const handlePromote = async (uid: string) => {
        try {
            const token = await getToken();
            const response = await fetch('/api/setAdmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ uid }),
            });

            if (!response.ok) throw new Error('Failed to promote user.');
            await fetchData('users'); // Refresh users list
        } catch (err: any) {
            setError(getErrorMessage(err));
        }
    };
    
    const handleCancelOrder = async (orderId: string) => {
        try {
            const token = await getToken();
            const response = await fetch('/api/cancelOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ orderId }),
            });

            if (!response.ok) throw new Error('Failed to cancel order.');
            await fetchData('orders'); // Refresh orders list
        } catch (err: any) {
            setError(getErrorMessage(err));
        }
    };

    const AdminUserRow = ({ user: u }: { user: User }) => (
        <tr className="border-b border-gray-700 hover:bg-brand-gray/50">
            <td className="p-3">{u.displayName || u.name || 'N/A'}</td>
            <td className="p-3">{u.email}</td>
            <td className="p-3">{u.credits}</td>
            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-green-800 text-green-200' : 'bg-gray-600 text-gray-300'}`}>{u.role}</span></td>
            <td className="p-3">
                {u.role !== 'admin' && (
                    <button onClick={() => handlePromote(u.uid)} className="text-brand-secondary hover:underline">Promote to Admin</button>
                )}
            </td>
        </tr>
    );

    const AdminOrderRow = ({ order }: { order: Order }) => (
        <tr className="border-b border-gray-700 hover:bg-brand-gray/50">
            <td className="p-3 font-mono text-xs">{order.id}</td>
            <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
            <td className="p-3">{order.package}</td>
            <td className="p-3">${order.amount}</td>
            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${order.status === 'completed' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>{order.status}</span></td>
            <td className="p-3">
                {order.status === 'in progress' && (
                    <button onClick={() => handleCancelOrder(order.id)} className="text-red-400 hover:underline">Cancel Order</button>
                )}
            </td>
        </tr>
    );

    const AdminContent = () => {
        if (isLoading) return <div className="flex justify-center items-center p-8"><Spinner size="12" /></div>;
        if (error) return <div className="text-red-400 p-8 text-center bg-red-900/20 rounded-lg">{error}</div>;

        switch (activeTab) {
            case 'users':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-brand-gray/60"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Credits</th><th className="p-3">Role</th><th className="p-3">Actions</th></tr></thead>
                        <tbody>{users.map(u => <AdminUserRow key={u.uid} user={u} />)}</tbody>
                    </table>
                );
            case 'orders':
                return (
                     <table className="w-full text-left">
                        <thead className="bg-brand-gray/60"><tr><th className="p-3">Order ID</th><th className="p-3">Date</th><th className="p-3">Package</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
                        <tbody>{orders.map(o => <AdminOrderRow key={o.id} order={o} />)}</tbody>
                    </table>
                );
            default: return <p className="text-gray-400">Select a section to manage.</p>;
        }
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-8 bg-brand-gray/30 p-8 rounded-2xl border border-brand-primary/20 mt-12">
            <aside className="w-full md:w-1/4">
                 <h1 className="text-2xl font-bold text-white mb-6">Admin Panel</h1>
                <nav className="flex flex-col space-y-2">
                    {['users', 'orders', 'jobs', 'coupons'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`text-left p-3 rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-brand-primary text-brand-dark font-bold' : 'hover:bg-brand-gray/50 text-gray-300'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="w-full md:w-3/4 bg-brand-dark/30 p-6 rounded-lg">
                <h2 className="text-3xl font-bold text-white mb-6 capitalize">{activeTab} Management</h2>
                <AdminContent/>
            </main>
        </div>
    );
};

export default AdminPage;