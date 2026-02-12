import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Settings, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Pencil, 
  Mail, 
  Trash2,
  Download
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import {
  addCOI,
  updateCOI,
  deleteCOI,
  bulkDelete,
  bulkSendReminder
} from '../store/coiSlice';
import type { COIData, COIStatus } from '../store/coiSlice';
import StatCards from '../components/StatCards';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const cois = useSelector((state: RootState) => state.cois.cois);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [propertyFilter, setPropertyFilter] = useState<string[]>(['All Properties']);
  const [expiryRange, setExpiryRange] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof COIData; direction: 'asc' | 'desc' } | null>(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReminderMenuOpen, setIsReminderMenuOpen] = useState(false);
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    type?: 'danger' | 'primary';
  } | null>(null);
  const [editingCOI, setEditingCOI] = useState<COIData | null>(null);
  const [newCOI, setNewCOI] = useState({ 
    property: '', 
    tenantName: '', 
    tenantEmail: '', 
    unit: '', 
    coiName: '', 
    expiryDate: '',
    status: 'Not Processed' as COIStatus
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Derived Data
  const properties = ['All Properties', ...new Set(cois.map(item => item.property))];
  const statuses = ['All', 'Active', 'Expired', 'Rejected', 'Expiring Soon', 'Not Processed'];

  const filteredData = useMemo(() => {
    return cois.filter(item => {
      const matchesSearch = 
        item.tenantName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.property.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.unit.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.coiName.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesProperty = propertyFilter.includes('All Properties') || propertyFilter.includes(item.property);

      let matchesExpiry = true;
      if (expiryRange !== 'All') {
        const expiry = new Date(item.expiryDate);
        const today = new Date();
        const next30 = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        const last30 = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

        if (expiryRange === 'Last 30 Days') matchesExpiry = expiry >= last30 && expiry <= today;
        else if (expiryRange === 'Next 30 Days') matchesExpiry = expiry >= today && expiry <= next30;
        else if (expiryRange === 'Custom') {
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          if (start) matchesExpiry = matchesExpiry && expiry >= start;
          if (end) matchesExpiry = matchesExpiry && expiry <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesProperty && matchesExpiry;
    });
  }, [cois, debouncedSearch, statusFilter, propertyFilter, expiryRange]);

  const sortedData = useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Handlers
  const handleSort = (key: keyof COIData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map(item => item.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const handleExportCSV = () => {
    const headers = ['Property', 'Tenant Name', 'Unit', 'COI Name', 'Expiry Date', 'Status'];
    const rows = sortedData.map(c => [c.property, c.tenantName, c.unit, c.coiName, c.expiryDate, c.status].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'coi_data.csv';
    link.click();
    toast.success('Data exported to CSV');
  };

  const openEditModal = (coi: COIData) => {
    setEditingCOI(coi);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingCOI) {
      dispatch(updateCOI({ id: editingCOI.id, updates: editingCOI }));
      setIsEditModalOpen(false);
      toast.success('COI updated successfully');
    }
  };

  const showConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    setIsConfirmModalOpen(true);
  };

  const handleAddSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newCOI.property || !newCOI.tenantName || !newCOI.tenantEmail) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }
    if (!emailRegex.test(newCOI.tenantEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    dispatch(addCOI({
      ...newCOI,
      reminderStatus: 'Not Sent'
    }));
    setIsAddModalOpen(false);
    setNewCOI({ property: '', tenantName: '', tenantEmail: '', unit: '', coiName: '', expiryDate: '', status: 'Not Processed' });
    toast.success('New COI created successfully');
  };

  const getStatusClass = (status: COIStatus) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Expired': return 'status-expired';
      case 'Rejected': return 'status-rejected';
      case 'Expiring Soon': return 'status-expiring-soon';
      case 'Not Processed': return 'status-not-processed';
      default: return '';
    }
  };

  return (
    <div className="dashboard-content">
      <StatCards />

      <div className="table-container">
        {selectedRows.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selected-count">{selectedRows.length} items selected</span>
            <div className="bulk-actions">
              <div className="dropdown-container">
                <button className="btn btn-outline" onClick={() => setIsReminderMenuOpen(!isReminderMenuOpen)}>
                  <Mail size={16} /> Send Bulk Reminder <ChevronDown size={14} />
                </button>
                {isReminderMenuOpen && (
                  <div className="dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: '8px' }}>
                    <button onClick={() => {
                      dispatch(bulkSendReminder(selectedRows));
                      setSelectedRows([]);
                      setIsReminderMenuOpen(false);
                      toast.info(`Primary reminders sent for ${selectedRows.length} items`);
                    }}>Primary Reminder</button>
                    <button onClick={() => {
                      dispatch(bulkSendReminder(selectedRows));
                      setSelectedRows([]);
                      setIsReminderMenuOpen(false);
                      toast.info(`Secondary reminders sent for ${selectedRows.length} items`);
                    }}>Secondary Reminder</button>
                    <button onClick={() => {
                      dispatch(bulkSendReminder(selectedRows));
                      setSelectedRows([]);
                      setIsReminderMenuOpen(false);
                      toast.info(`Final notices sent for ${selectedRows.length} items`);
                    }}>Final Notice</button>
                  </div>
                )}
              </div>
              <button className="btn btn-outline" onClick={() => setSelectedRows([])}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => {
                showConfirm({
                  title: 'Delete Items',
                  message: `Are you sure you want to delete ${selectedRows.length} items? This action cannot be undone.`,
                  onConfirm: () => {
                    dispatch(bulkDelete(selectedRows));
                    setSelectedRows([]);
                    setIsConfirmModalOpen(false);
                    toast.success(`${selectedRows.length} items deleted`);
                  },
                  confirmText: 'Delete All',
                  type: 'danger'
                });
              }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        )}

        <div className="table-controls">
          <div className="filters-group">
            <div className="filter-dropdown-wrapper custom-multiselect">
              <button
                className="filter-select multiselect-trigger"
                onClick={() => setIsPropertyMenuOpen(!isPropertyMenuOpen)}
              >
                {propertyFilter.length === 1 && propertyFilter[0] === 'All Properties'
                  ? 'All Properties'
                  : `${propertyFilter.length} Properties`}
                <ChevronDown size={14} className="dropdown-icon" />
              </button>

              {isPropertyMenuOpen && (
                <div className="multiselect-dropdown">
                  {properties.map(p => (
                    <label key={p} className="multiselect-option">
                      <input
                        type="checkbox"
                        checked={propertyFilter.includes(p)}
                        onChange={() => {
                          if (p === 'All Properties') {
                            setPropertyFilter(['All Properties']);
                          } else {
                            let newFilters = propertyFilter.filter(item => item !== 'All Properties');
                            if (newFilters.includes(p)) {
                              newFilters = newFilters.filter(item => item !== p);
                            } else {
                              newFilters.push(p);
                            }
                            if (newFilters.length === 0) setPropertyFilter(['All Properties']);
                            else setPropertyFilter(newFilters);
                          }
                        }}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="filter-dropdown-wrapper">
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>
            <div className="filter-dropdown-wrapper">
              <select className="filter-select" value={expiryRange} onChange={(e) => setExpiryRange(e.target.value)}>
                <option value="All">All Expiry</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Next 30 Days">Next 30 Days</option>
                <option value="Custom">Custom Range</option>
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>
            {expiryRange === 'Custom' && (
              <div className="date-range-inputs">
                <input
                  type="date"
                  className="filter-select date-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  className="filter-select date-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </div>
            )}
            <button className="btn btn-outline icon-btn-text" onClick={handleExportCSV}>
              <Download size={16} /> Export CSV
            </button>
          </div>

          <div className="search-group">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search by tenant, properties, or unit..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="icon-btn">
              <Settings size={18} />
            </button>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} /> ADD COI
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('property')} className="sortable">
                  Property {sortConfig?.key === 'property' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('tenantName')} className="sortable">
                  Tenant Name {sortConfig?.key === 'tenantName' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('unit')} className="sortable">
                  Unit {sortConfig?.key === 'unit' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('coiName')} className="sortable">
                  COI Name {sortConfig?.key === 'coiName' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('expiryDate')} className="sortable">
                  Expiry Date {sortConfig?.key === 'expiryDate' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('reminderStatus')} className="sortable">
                  Reminder Status {sortConfig?.key === 'reminderStatus' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className={selectedRows.includes(item.id) ? 'selected-row' : ''}
                  onClick={(e) => {
                    // Prevent row click if clicking checkbox or buttons
                    if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('button')) return;
                    openEditModal(item);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(item.id)}
                      onChange={() => toggleSelectRow(item.id)}
                    />
                  </td>
                  <td>{item.property}</td>
                  <td>{item.tenantName}</td>
                  <td>{item.unit}</td>
                  <td className="coi-name-cell">{item.coiName}</td>
                  <td>
                    <div className="date-cell">
                      {item.expiryDate}
                      <button className="edit-btn" onClick={() => openEditModal(item)}><Pencil size={12} /></button>
                    </div>
                  </td>
                  <td>
                    <div className="status-dropdown-container">
                      <select
                        className={`status-badge-select ${getStatusClass(item.status)}`}
                        value={item.status}
                        onChange={(e) => {
                          dispatch(updateCOI({ id: item.id, updates: { status: e.target.value as COIStatus } }));
                          toast.info(`Status updated to ${e.target.value}`);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {statuses.filter(s => s !== 'All').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="status-select-icon" />
                    </div>
                  </td>
                  <td>
                    <span className={`reminder-status ${item.reminderStatus === 'Sent (30d)' ? 'sent' : ''}`}>
                      {item.reminderStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-menu-trigger">
                      <button className="action-btn" onClick={(e) => e.stopPropagation()}><MoreVertical size={18} /></button>
                      <div className="action-menu">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          dispatch(updateCOI({ id: item.id, updates: { reminderStatus: 'Sent (30d)' } }));
                          toast.info('Reminder sent');
                        }}>
                          <Mail size={14} /> Send Reminder
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          showConfirm({
                            title: 'Delete COI',
                            message: 'Are you sure you want to delete this COI? This action cannot be undone.',
                            onConfirm: () => {
                              dispatch(deleteCOI(item.id));
                              setIsConfirmModalOpen(false);
                              toast.success('COI deleted');
                            },
                            confirmText: 'Delete',
                            type: 'danger'
                          });
                        }} className="delete">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="rows-selector">
            <span>Rows per page</span>
            <div className="filter-dropdown-wrapper">
              <select className="rows-select" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>
          </div>
          <div className="pagination-controls">
            <button className="page-nav-btn" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
              <ChevronLeft size={18} />
            </button>
            <span className="page-info">Page {currentPage} of {totalPages || 1}</span>
            <button className="page-nav-btn" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}>
              <ChevronRight size={18} />
            </button>
            <div className="go-to-wrapper">
              <span>Go to</span>
              <input 
                type="number" 
                className="go-to-input" 
                min={1} 
                max={totalPages}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = Number((e.target as HTMLInputElement).value);
                    if (val >= 1 && val <= totalPages) setCurrentPage(val);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New COI"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Create COI</button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label>Property *</label>
            <input type="text" value={newCOI.property} onChange={(e) => setNewCOI({...newCOI, property: e.target.value})} placeholder="Property Name" />
          </div>
          <div className="form-group">
            <label>Tenant Name *</label>
            <input type="text" value={newCOI.tenantName} onChange={(e) => setNewCOI({...newCOI, tenantName: e.target.value})} placeholder="Tenant Name" />
          </div>
          <div className="form-group">
            <label>Tenant Email *</label>
            <input type="email" value={newCOI.tenantEmail} onChange={(e) => setNewCOI({...newCOI, tenantEmail: e.target.value})} placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input type="text" value={newCOI.unit} onChange={(e) => setNewCOI({...newCOI, unit: e.target.value})} placeholder="Unit/Suite" />
          </div>
          <div className="form-group">
            <label>COI Name</label>
            <input type="text" value={newCOI.coiName} onChange={(e) => setNewCOI({...newCOI, coiName: e.target.value})} placeholder="COI Filename" />
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input type="date" value={newCOI.expiryDate} onChange={(e) => setNewCOI({...newCOI, expiryDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={newCOI.status} onChange={(e) => setNewCOI({...newCOI, status: e.target.value as COIStatus})}>
              {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group full-width">
            <label>Upload COI Document (Optional)</label>
            <input type="file" onChange={(e) => console.log('File selected:', e.target.files?.[0])} />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {editingCOI && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit COI Details"
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Property</label>
              <input type="text" value={editingCOI.property} onChange={(e) => setEditingCOI({...editingCOI, property: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Tenant Name</label>
              <input type="text" value={editingCOI.tenantName} onChange={(e) => setEditingCOI({...editingCOI, tenantName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Tenant Email</label>
              <input type="email" value={editingCOI.tenantEmail || ''} onChange={(e) => setEditingCOI({...editingCOI, tenantEmail: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input type="text" value={editingCOI.unit} onChange={(e) => setEditingCOI({...editingCOI, unit: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" value={editingCOI.expiryDate} onChange={(e) => setEditingCOI({...editingCOI, expiryDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={editingCOI.status} onChange={(e) => setEditingCOI({...editingCOI, status: e.target.value as COIStatus})}>
                {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {confirmConfig && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={confirmConfig.title}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
              <button
                className={`btn ${confirmConfig.type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={confirmConfig.onConfirm}
              >
                {confirmConfig.confirmText || 'Confirm'}
              </button>
            </>
          }
        >
          <p style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{confirmConfig.message}</p>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
