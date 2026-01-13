import { useState, useEffect } from 'react';
import { api } from '../services/api';

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
        Employés ({employees.length})
      </h2>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Nom</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Poste</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {employee.first_name} {employee.last_name}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {employee.position || '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {employee.email || '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {employee.phone || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            Aucun employé enregistré
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeesPage;
