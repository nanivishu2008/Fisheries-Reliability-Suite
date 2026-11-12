import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Lock,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { SearchBar, Pagination } from '../components/FilterPanel';
import { getUsers, createUser, updateUser, patchUserStatus } from '../services/reportService';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Technician',
    organization: 'AquaReliability Fisheries Ltd',
    assignedFacilities: 'South Bay Coastal Farm',
    phone: '',
    specialization: 'Marine Electro-Mechanical',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    organization: '',
    assignedFacilities: '',
    phone: '',
    specialization: '',
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers({
        page: currentPage,
        limit: 15,
        search,
        role: roleFilter,
      });
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      await createUser({
        ...createForm,
        assignedFacilities: createForm.assignedFacilities.split(',').map((f) => f.trim()),
      });
      setCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'Technician',
        organization: 'AquaReliability Fisheries Ltd',
        assignedFacilities: 'South Bay Coastal Farm',
        phone: '',
        specialization: 'Marine Electro-Mechanical',
      });
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setCreateLoading(true);
      await updateUser(editingUser._id, {
        ...editForm,
        assignedFacilities: editForm.assignedFacilities.split(',').map((f) => f.trim()),
      });
      setEditModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} account for ${user.name}?`)) return;
    try {
      await patchUserStatus(user._id, newStatus);
      await loadUsers();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      organization: user.organization || '',
      assignedFacilities: (user.assignedFacilities || []).join(', '),
      phone: user.phone || '',
      specialization: user.specialization || '',
    });
    setEditModalOpen(true);
  };

  const columns = [
    {
      header: 'User Identity',
      accessor: 'name',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900">{r.name}</div>
          <div className="text-slate-500 text-[11px]">{r.email}</div>
        </div>
      ),
    },
    {
      header: 'System Role',
      accessor: 'role',
      render: (r) => (
        <span className="font-bold text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
          {r.role}
        </span>
      ),
    },
    {
      header: 'Organization & Facilities',
      accessor: 'organization',
      render: (r) => (
        <div>
          <div className="font-medium text-slate-800">{r.organization}</div>
          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
            {r.assignedFacilities?.join(', ') || 'Global Facilities'}
          </div>
        </div>
      ),
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
      render: (r) => <span className="text-xs text-slate-600">{r.specialization || 'General Reliability'}</span>,
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
            r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {r.isActive ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin',
      render: (r) => (
        <span className="text-[11px] text-slate-500">
          {r.lastLogin ? new Date(r.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(r)}
            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded"
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(r)}
            className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
              r.isActive
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {r.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              User & Role Access Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              Admin Governance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory control, role delegation, and facility-scoped operational permissions
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Create Authorized User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          onClear={() => setSearch('')}
          placeholder="Search by name, corporate email, site..."
          className="max-w-md w-full"
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">All 4 Primary Roles</option>
          <option value="Maintenance Admin">Maintenance Admin</option>
          <option value="Operations Manager">Operations Manager</option>
          <option value="Technician">Technician</option>
          <option value="Vendor">Vendor</option>
        </select>
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No users found"
        emptyDescription="Create a new user or clear current search criteria."
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Authorized Enterprise User"
        subtitle="Provision employee credentials and define operational RBAC role"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              name="name"
              required
              placeholder="e.g. Thomas Wayne"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
            <FormInput
              label="Corporate Email"
              name="email"
              type="email"
              required
              placeholder="e.g. twayne@fisheries.org"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Initial Password"
              name="password"
              type="password"
              required
              minlength={6}
              placeholder="Min 6 characters"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <FormInput
              label="Assigned System Role (4 Primary Classes)"
              name="role"
              type="select"
              required
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              options={[
                { value: 'Maintenance Admin', label: 'Maintenance Admin (Full System Governance)' },
                { value: 'Operations Manager', label: 'Operations Manager (Approval & Dispatch)' },
                { value: 'Technician', label: 'Technician (Field Execution & Readings)' },
                { value: 'Vendor', label: 'Vendor (Contracted Servicing & Parts)' },
              ]}
            />
          </div>

          <FormInput
            label="Assigned Facilities (Comma separated scopes)"
            name="assignedFacilities"
            placeholder="e.g. South Bay Coastal Farm, Processing Plant 1"
            value={createForm.assignedFacilities}
            onChange={(e) => setCreateForm({ ...createForm, assignedFacilities: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Contact Phone"
              name="phone"
              placeholder="+44 20 7946 0000"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            />
            <FormInput
              label="Technical Specialization"
              name="specialization"
              placeholder="e.g. Marine Hydraulics & Engines"
              value={createForm.specialization}
              onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
            >
              {createLoading ? 'Provisioning...' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingUser(null);
          }}
          title={`Edit Profile: ${editingUser.name}`}
          subtitle={`Account Email: ${editingUser.email}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="name"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <FormInput
                label="System Role"
                name="role"
                type="select"
                required
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                options={[
                  { value: 'Maintenance Admin', label: 'Maintenance Admin' },
                  { value: 'Operations Manager', label: 'Operations Manager' },
                  { value: 'Technician', label: 'Technician' },
                  { value: 'Vendor', label: 'Vendor' },
                ]}
              />
            </div>

            <FormInput
              label="Assigned Facilities"
              name="assignedFacilities"
              value={editForm.assignedFacilities}
              onChange={(e) => setEditForm({ ...editForm, assignedFacilities: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Organization"
                name="organization"
                value={editForm.organization}
                onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
              />
              <FormInput
                label="Specialization"
                name="specialization"
                value={editForm.specialization}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
              >
                {createLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserManagementPage;
