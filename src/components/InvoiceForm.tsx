import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { invoiceService } from '../services/invoiceService';
import { useInvoiceStore } from '../stores/invoiceStore';

interface InvoiceFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSuccess, initialData }) => {
  const { addInvoice, updateInvoice } = useInvoiceStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: initialData?.invoiceNumber || '',
    clientId: initialData?.clientId || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'XOF',
    issueDate: initialData?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    items: initialData?.items || [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.id) {
        const response = await invoiceService.updateInvoice(initialData.id, formData);
        if (response.success && response.data) {
          updateInvoice(initialData.id, response.data);
        }
      } else {
        const response = await invoiceService.createInvoice(formData);
        if (response.success && response.data) {
          addInvoice(response.data);
        }
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  return (
    <Card title={initialData ? 'Modifier la Facture' : 'Nouvelle Facture'}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Numéro de Facture</label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Client</label>
            <input
              type="text"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              placeholder="ID du client"
              required
            />
          </div>

          <div className="form-group">
            <label>Montant</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label>Devise</label>
            <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
              <option value="XOF">XOF</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date d'émission</label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Date d'échéance</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="form-section">
          <h3>Articles de la Facture</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="form-grid">
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Quantité</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Prix Unitaire</label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                />
              </div>
            </div>
          ))}
          <Button variant="secondary" onClick={addItem} type="button">
            + Ajouter un article
          </Button>
        </div>

        <div className="button-group">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
