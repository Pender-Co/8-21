import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  FileText,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Send,
  Eye,
  Edit3,
  Copy,
  CreditCard,
  TrendingUp,
  Receipt,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  job_title: string;
  service_type: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_method: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const InvoicesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - replace with actual API calls
  const invoices: Invoice[] = useMemo(() => [
    {
      id: '1',
      invoice_number: 'INV-2025-001',
      client_name: 'Smith Residence',
      client_email: 'john.smith@email.com',
      client_phone: '(555) 123-4567',
      client_address: '123 Oak Street, Springfield, IL',
      job_title: 'Weekly Lawn Maintenance',
      service_type: 'Lawn Care',
      invoice_date: '2025-01-20',
      due_date: '2025-02-19',
      amount: 150.00,
      tax_amount: 12.00,
      total_amount: 162.00,
      status: 'paid',
      payment_method: 'Credit Card',
      paid_date: '2025-01-22',
      notes: 'Regular weekly service - January',
      created_at: '2025-01-20T10:00:00Z',
      updated_at: '2025-01-22T14:30:00Z'
    },
    {
      id: '2',
      invoice_number: 'INV-2025-002',
      client_name: 'Green Valley HOA',
      client_email: 'maintenance@greenvalley.com',
      client_phone: '(555) 234-5678',
      client_address: '456 Pine Avenue, Springfield, IL',
      job_title: 'Spring Landscaping Project',
      service_type: 'Landscaping',
      invoice_date: '2025-01-25',
      due_date: '2025-02-24',
      amount: 850.00,
      tax_amount: 68.00,
      total_amount: 918.00,
      status: 'sent',
      payment_method: null,
      paid_date: null,
      notes: 'Seasonal flower planting and mulching',
      created_at: '2025-01-25T09:15:00Z',
      updated_at: '2025-01-25T09:15:00Z'
    },
    {
      id: '3',
      invoice_number: 'INV-2025-003',
      client_name: 'Johnson Property',
      client_email: 'robert.johnson@email.com',
      client_phone: '(555) 345-6789',
      client_address: '789 Maple Drive, Springfield, IL',
      job_title: 'Tree Trimming Service',
      service_type: 'Tree Services',
      invoice_date: '2025-01-15',
      due_date: '2025-02-14',
      amount: 450.00,
      tax_amount: 36.00,
      total_amount: 486.00,
      status: 'overdue',
      payment_method: null,
      paid_date: null,
      notes: 'Oak tree trimming and debris removal',
      created_at: '2025-01-15T11:20:00Z',
      updated_at: '2025-01-15T11:20:00Z'
    },
    {
      id: '4',
      invoice_number: 'INV-2025-004',
      client_name: 'Downtown Office Complex',
      client_email: 'facilities@downtowncomplex.com',
      client_phone: '(555) 456-7890',
      client_address: '321 Business Boulevard, Springfield, IL',
      job_title: 'Snow Removal - Emergency',
      service_type: 'Snow Removal',
      invoice_date: '2025-01-27',
      due_date: '2025-02-26',
      amount: 1200.00,
      tax_amount: 96.00,
      total_amount: 1296.00,
      status: 'draft',
      payment_method: null,
      paid_date: null,
      notes: 'Emergency snow removal after storm',
      created_at: '2025-01-27T22:00:00Z',
      updated_at: '2025-01-27T22:00:00Z'
    },
    {
      id: '5',
      invoice_number: 'INV-2025-005',
      client_name: 'Miller Family Home',
      client_email: 'sarah.miller@email.com',
      client_phone: '(555) 567-8901',
      client_address: '654 Elm Street, Springfield, IL',
      job_title: 'Fall Cleanup Service',
      service_type: 'Seasonal Cleanup',
      invoice_date: '2025-01-10',
      due_date: '2025-02-09',
      amount: 320.00,
      tax_amount: 25.60,
      total_amount: 345.60,
      status: 'cancelled',
      payment_method: null,
      paid_date: null,
      notes: 'Cancelled due to weather conditions',
      created_at: '2025-01-10T08:30:00Z',
      updated_at: '2025-01-12T16:45:00Z'
    }
  ], []);

  const statusOptions = ['All Status', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];

  const tabs = useMemo(() => [
    { id: 'all', label: 'All Invoices', count: invoices.length },
    { id: 'draft', label: 'Drafts', count: invoices.filter(i => i.status === 'draft').length },
    { id: 'sent', label: 'Sent', count: invoices.filter(i => i.status === 'sent').length },
    { id: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
    { id: 'overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length }
  ], [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesTab = activeTab === 'all' || invoice.status === activeTab;
      const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.service_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !selectedDate || invoice.invoice_date === selectedDate;
      const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus.toLowerCase();
      
      return matchesTab && matchesSearch && matchesDate && matchesStatus;
    });
  }, [invoices, activeTab, searchTerm, selectedDate, selectedStatus]);

  const summaryStats = useMemo(() => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const pendingAmount = invoices.filter(i => i.status === 'sent').reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const draftCount = invoices.filter(i => i.status === 'draft').length;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      pendingAmount: pendingAmount.toFixed(2),
      overdueAmount: overdueAmount.toFixed(2),
      draftCount
    };
  }, [invoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return CheckCircle;
      case 'sent':
        return Send;
      case 'overdue':
        return AlertCircle;
      case 'draft':
        return FileText;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
            Invoices & Billing
          </h1>
          <p className="text-gray-600 font-inter mt-1">
            Manage invoices, track payments, and monitor cash flow
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold flex items-center justify-center">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center justify-center group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                ${summaryStats.totalRevenue}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Pending Payment</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                ${summaryStats.pendingAmount}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                ${summaryStats.overdueAmount}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Draft Invoices</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                {summaryStats.draftCount}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices by number, client, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status === 'All Status' ? 'all' : status.toLowerCase()}>
                {status}
              </option>
            ))}
          </select>

          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-inter font-medium">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-inter font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-forest text-forest'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Invoices List */}
        <div className="p-6">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-inter">No invoices found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters or create a new invoice
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = getStatusIcon(invoice.status);
                const isOverdue = invoice.status === 'overdue';
                const daysOverdue = isOverdue ? getDaysOverdue(invoice.due_date) : 0;
                
                return (
                  <div key={invoice.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-forest p-3 rounded-lg">
                          <StatusIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                              {invoice.invoice_number}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(invoice.status)}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                            {isOverdue && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium bg-red-100 text-red-800">
                                {daysOverdue} days overdue
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-inter mb-3">{invoice.job_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-2xl font-dm-sans font-bold text-dark-slate">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due {formatDate(invoice.due_date)}
                          </p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium text-dark-slate">{invoice.client_name}</div>
                          <div className="text-xs">{invoice.client_phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{invoice.client_address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium text-dark-slate">
                            Issued {formatDate(invoice.invoice_date)}
                          </div>
                          <div className="text-xs">{invoice.service_type}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Receipt className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium text-dark-slate">
                            {formatCurrency(invoice.amount)}
                          </div>
                          <div className="text-xs">+{formatCurrency(invoice.tax_amount)} tax</div>
                        </div>
                      </div>
                    </div>

                    {invoice.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800 font-inter">
                          <strong>Notes:</strong> {invoice.notes}
                        </p>
                      </div>
                    )}

                    {invoice.status === 'paid' && invoice.paid_date && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-sm text-green-800">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span>
                            Paid on {formatDate(invoice.paid_date)} via {invoice.payment_method}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>{invoice.client_email}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>Created {formatDate(invoice.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {invoice.status === 'draft' && (
                          <button className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold text-sm">
                            Send Invoice
                          </button>
                        )}
                        {invoice.status === 'sent' && (
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-inter font-semibold text-sm">
                            Mark as Paid
                          </button>
                        )}
                        {invoice.status === 'overdue' && (
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-inter font-semibold text-sm">
                            Send Reminder
                          </button>
                        )}
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-sm flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-sm flex items-center">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;