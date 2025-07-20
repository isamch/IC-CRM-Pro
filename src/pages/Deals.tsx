import React, { useState } from 'react';
import { Plus, Filter, Edit, Trash2, DollarSign, Calendar, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { mockDeals, mockClients } from '../data/mockData';
import { Deal } from '../types';

const StatusBadge: React.FC<{ status: Deal['status'] }> = ({ status }) => {
  const colors = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const DealForm: React.FC<{
  deal?: Deal;
  onSave: (deal: Partial<Deal>) => void;
  onCancel: () => void;
}> = ({ deal, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    amount: deal?.amount?.toString() || '',
    status: deal?.status || 'pending',
    date: deal?.date || '',
    clientId: deal?.clientId || '',
    probability: deal?.probability?.toString() || '50'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = mockClients.find(c => c.id === formData.clientId);
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      probability: parseInt(formData.probability),
      clientName: client?.name || ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Deal Title"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        placeholder="Enter deal title"
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(value) => setFormData({ ...formData, amount: value })}
          placeholder="0"
          required
        />
        <Input
          label="Probability (%)"
          type="number"
          value={formData.probability}
          onChange={(value) => setFormData({ ...formData, probability: value })}
          placeholder="50"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value as Deal['status'] })}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'won', label: 'Won' },
            { value: 'lost', label: 'Lost' }
          ]}
          required
        />
        <Input
          label="Close Date"
          type="date"
          value={formData.date}
          onChange={(value) => setFormData({ ...formData, date: value })}
          required
        />
      </div>
      
      <Select
        label="Client"
        value={formData.clientId}
        onChange={(value) => setFormData({ ...formData, clientId: value })}
        options={mockClients.map(client => ({
          value: client.id,
          label: `${client.name} (${client.company})`
        }))}
        placeholder="Select a client"
        required
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {deal ? 'Update Deal' : 'Add Deal'}
        </Button>
      </div>
    </form>
  );
};

export const Deals: React.FC = () => {
  const [deals, setDeals] = useState(mockDeals);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const filteredDeals = deals.filter(deal => 
    statusFilter === 'all' || deal.status === statusFilter
  );

  const handleAddDeal = () => {
    setEditingDeal(undefined);
    setShowModal(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setShowModal(true);
  };

  const handleSaveDeal = (dealData: Partial<Deal>) => {
    if (editingDeal) {
      setDeals(deals.map(d => 
        d.id === editingDeal.id ? { ...d, ...dealData } : d
      ));
    } else {
      const newDeal: Deal = {
        id: Date.now().toString(),
        ...dealData as Omit<Deal, 'id'>,
      };
      setDeals([...deals, newDeal]);
    }
    setShowModal(false);
  };

  const handleDeleteDeal = (dealId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه الصفقة؟ لا يمكن التراجع عن هذه العملية.',
      onConfirm: () => {
        setDeals(deals.filter(d => d.id !== dealId));
        setConfirmDialog(d => ({ ...d, isOpen: false }));
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Deals ({filteredDeals.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Total value: {formatCurrency(totalValue)}
          </p>
        </div>
        <Button icon={Plus} onClick={handleAddDeal}>
          Add Deal
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'won', label: 'Won' },
              { value: 'lost', label: 'Lost' }
            ]}
            className="sm:w-48"
          />
          <Button variant="outline" icon={Filter} size="sm">
            More Filters
          </Button>
        </div>
      </Card>

      {/* Deals Table */}
      <Card padding="sm" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Deal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Close Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal, index) => (
                <tr 
                  key={deal.id} 
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {deal.title}
                      </div>
                      {deal.probability && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {deal.probability}% probability
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{deal.clientName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(deal.amount)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={deal.status} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {new Date(deal.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEditDeal(deal)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No deals found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {statusFilter !== 'all' ? 'Try changing the filter' : 'Get started by adding your first deal'}
            </p>
            {statusFilter === 'all' && (
              <Button icon={Plus} onClick={handleAddDeal}>
                Add Deal
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDeal ? 'Edit Deal' : 'Add New Deal'}
      >
        <DealForm
          deal={editingDeal}
          onSave={handleSaveDeal}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
      />
    </div>
  );
};