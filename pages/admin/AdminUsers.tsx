import React, { useState, useEffect, useCallback } from 'react';
import { adminService, type AdminUser } from '../../services/adminService.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import type { UserRole } from '../../types.ts';
import { LoadingOverlayEnhanced } from '../../components/LoadingOverlayEnhanced.tsx';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.searchUsers(searchQuery);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, loadUsers]);

  const handleRoleChange = useCallback(
    async (userId: string, newRole: UserRole) => {
      if (!user) return;
      setActionLoading(userId);
      try {
        const success = await adminService.updateUserRole(user.id, userId, newRole);
        if (success) {
          await loadUsers();
        } else {
          setError('Failed to update user role');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update role');
        console.error('Error updating role:', err);
      } finally {
        setActionLoading(null);
      }
    },
    [user, loadUsers]
  );

  const handleBanToggle = useCallback(
    async (userId: string, currentlyBanned: boolean) => {
      if (!user) return;
      setActionLoading(userId);
      try {
        const success = currentlyBanned
          ? await adminService.unbanUser(user.id, userId)
          : await adminService.banUser(user.id, userId);
        if (success) {
          await loadUsers();
        } else {
          setError(`Failed to ${currentlyBanned ? 'unban' : 'ban'} user`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed');
        console.error('Error toggling ban:', err);
      } finally {
        setActionLoading(null);
      }
    },
    [user, loadUsers]
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">User Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <label htmlFor="user-search" className="sr-only">
          Search users by email
        </label>
        <input
          id="user-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by email..."
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white"
          aria-label="Search users by email"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          aria-label="Search"
        >
          Search
        </button>
      </div>

      <div className="relative min-h-[200px]">
        <LoadingOverlayEnhanced
          isVisible={loading}
          message="Loading users..."
          subMessage="Fetching user data"
          variant="gold"
          fullScreen={false}
        />
        {!loading && users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No users found</div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full" role="table" aria-label="User management table">
              <thead className="bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((u) => {
                  const isActionLoading = actionLoading === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          disabled={isActionLoading}
                          className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1 disabled:opacity-50"
                          aria-label={`Change role for ${u.email}`}
                        >
                          <option value="user">User</option>
                          <option value="master">Master</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            u.banned ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                          }`}
                          aria-label={u.banned ? 'User is banned' : 'User is active'}
                        >
                          {u.banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleBanToggle(u.id, u.banned)}
                          disabled={isActionLoading}
                          className={`px-3 py-1 rounded font-medium transition-colors disabled:opacity-50 ${
                            u.banned
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                          aria-label={u.banned ? `Unban ${u.email}` : `Ban ${u.email}`}
                        >
                          {isActionLoading ? '...' : u.banned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
