import { useState, useEffect } from 'react';
import { api } from '../services/api';

function LicensesPage() {
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    try {
      const data = await api.getLicenses();
      setLicenses(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
        Licences ({licenses.length})
      </h2>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Adhérent</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>N° Licence</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Date émission</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Expiration</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => (
              <tr key={license.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {license.first_name} {license.last_name}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {license.license_number || '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {license.issue_date ? new Date(license.issue_date).toLocaleDateString() : '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {license.expiry_date ? new Date(license.expiry_date).toLocaleDateString() : '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: license.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: license.status === 'active' ? '#059669' : '#dc2626'
                  }}>
                    {license.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {licenses.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            Aucune licence enregistrée
          </div>
        )}
      </div>
    </div>
  );
}

export default LicensesPage;
