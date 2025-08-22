import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Package, Hash, FileText } from 'lucide-react';

interface ServiceItem {
  id: string;
  itemName: string;
  quantity: number;
  unitCost: number | null;
  unitPrice: number;
  description: string;
  total: number;
  sortOrder: number;
}

interface ServiceItemsSectionProps {
  serviceItems: ServiceItem[];
  onChange: (items: ServiceItem[]) => void;
}

const ServiceItemsSection: React.FC<ServiceItemsSectionProps> = ({ 
  serviceItems, 
  onChange 
}) => {
  // Generate a unique ID for new items
  const generateId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add a new service item
  const addServiceItem = () => {
    const newItem: ServiceItem = {
      id: generateId(),
      itemName: '',
      quantity: 1,
      unitCost: null,
      unitPrice: 0,
      description: '',
      total: 0,
      sortOrder: serviceItems.length
    };
    onChange([...serviceItems, newItem]);
  };

  // Remove a service item
  const removeServiceItem = (id: string) => {
    const updatedItems = serviceItems.filter(item => item.id !== id);
    // Update sort order
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      sortOrder: index
    }));
    onChange(reorderedItems);
  };

  // Update a service item
  const updateServiceItem = (id: string, field: keyof ServiceItem, value: any) => {
    const updatedItems = serviceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total when quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    onChange(updatedItems);
  };

  // Calculate job total
  const jobTotal = serviceItems.reduce((sum, item) => sum + item.total, 0);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle number input changes
  const handleNumberChange = (id: string, field: 'quantity' | 'unitCost' | 'unitPrice', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateServiceItem(id, field, field === 'unitCost' && value === '' ? null : numValue);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-6 flex items-center">
        <Package className="h-6 w-6 text-forest mr-2" />
        Service Items
      </h2>

      {serviceItems.length === 0 ? (
        // Empty state
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-inter mb-4">No service items added yet</p>
          <button
            type="button"
            onClick={addServiceItem}
            className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold flex items-center mx-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Item
          </button>
        </div>
      ) : (
        <>
          {/* Service Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-inter font-semibold text-gray-700 min-w-[200px]">
                    Item Name *
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-inter font-semibold text-gray-700 min-w-[80px]">
                    Qty *
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-inter font-semibold text-gray-700 min-w-[100px]">
                    Unit Cost
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-inter font-semibold text-gray-700 min-w-[100px]">
                    Unit Price *
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-inter font-semibold text-gray-700 min-w-[100px]">
                    Total
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-inter font-semibold text-gray-700 min-w-[40px]">
                    
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    {/* Item Name */}
                    <td className="py-3 px-2">
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => updateServiceItem(item.id, 'itemName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                          placeholder="e.g., Lawn Mowing, Tree Trimming"
                          required
                        />
                        {/* Description field below item name */}
                        <textarea
                          value={item.description}
                          onChange={(e) => updateServiceItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm resize-none"
                          placeholder="Optional description..."
                          rows={2}
                        />
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-2">
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleNumberChange(item.id, 'quantity', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                          required
                        />
                      </div>
                    </td>

                    {/* Unit Cost */}
                    <td className="py-3 px-2">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost || ''}
                          onChange={(e) => handleNumberChange(item.id, 'unitCost', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-2">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleNumberChange(item.id, 'unitPrice', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-2">
                      <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <span className="font-inter font-semibold text-dark-slate text-sm">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    </td>

                    {/* Delete Button */}
                    <td className="py-3 px-2">
                      <button
                        type="button"
                        onClick={() => removeServiceItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Item Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={addServiceItem}
              className="text-forest hover:text-forest/80 font-inter font-semibold text-sm flex items-center hover:bg-forest/5 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </button>
          </div>

          {/* Job Total */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300">
            <div className="flex justify-end">
              <div className="bg-forest/10 border border-forest/20 rounded-lg p-4 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-dm-sans font-semibold text-dark-slate">
                    Job Total:
                  </span>
                  <span className="text-xl font-dm-sans font-bold text-forest">
                    {formatCurrency(jobTotal)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-inter mt-1">
                  {serviceItems.length} item{serviceItems.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceItemsSection;