import { useEffect, useState } from 'react';
import { useToast } from '../utils/useToast';
import { useAuthStore, useAppStore } from '../utils/store';
import Layout from '../components/Layout';
import { apiCall } from '../services/api';
import { getAllFromStore, addToStore, updateInStore, deleteFromStore } from '../db';
import { queueChange } from '../services/syncService';

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'SECRETARY',
    password: ''
  });

  const { user } = useAuthStore();
  const { isOnline } = useAppStore();
  const { success, error } = useToast();

  useEffect(() => {
    if (user?.role?.toUpperCase() !== 'ADMIN') {
      return;
    }
    loadEmployees();
  }, [user]);

  const loadEmployees = async () => {
    try {
      let data;

      if (navigator.onLine) {
        data = await apiCall('/employees');

        for (const employee of data) {
          await addToStore('employees', employee);
        }
      } else {
        data = await getAllFromStore('employees');
      }

      setEmployees(data);
    } catch (err) {
      error('Erreur lors du chargement des employés');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingEmployee) {
        if (navigator.onLine) {
          await apiCall(`/employees/${editingEmployee.id}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
          });

          const updated = { ...editingEmployee, ...formData };
          await updateInStore('employees', updated);
        } else {
          const updated = { ...editingEmployee, ...formData };
          await updateInStore('employees', updated);
          await queueChange('employees', editingEmployee.id, updated);
        }

        success(navigator.onLine ? 'Employé mis à jour avec succès' : 'Employé mis à jour (sera synchronisé)');
      } else {
        if (!navigator.onLine) {
          error('Mode hors ligne : Impossible de créer un employé');
          return;
        }

        await apiCall('/employees', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        success('Employé créé avec succès');
      }

      setShowModal(false);
      resetForm();
      loadEmployees();
    } catch (err) {
      error(err.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;

    if (!navigator.onLine) {
      error('Mode hors ligne : Impossible de supprimer un employé');
      return;
    }

    try {
      await apiCall(`/employees/${id}`, {
        method: 'DELETE'
      });
      await deleteFromStore('employees', id);
      success('Employé supprimé avec succès');
      loadEmployees();
    } catch (err) {
      error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
      password: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'SECRETARY',
      password: ''
    });
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (user?.role?.toUpperCase() !== 'ADMIN') {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Accès non autorisé
          </h2>
          <p style={{ color: '#64748b' }}>
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Gérez les employés de votre club
            </p>
          </div>
          <button onClick={openModal} className="btn btn-success">
            <span>➕</span>
            <span>Nouvel employé</span>
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Liste des employés
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Nom</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Email</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Téléphone</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Rôle</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {employee.first_name} {employee.last_name}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>{employee.email}</td>
                    <td style={{ padding: '16px', color: '#64748b' }}>{employee.phone || '-'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        backgroundColor: employee.role?.toUpperCase() === 'ADMIN' ? '#dbeafe' : employee.role?.toUpperCase() === 'SECRETARY' ? '#fef3c7' : '#dcfce7',
                        color: employee.role?.toUpperCase() === 'ADMIN' ? '#1e40af' : employee.role?.toUpperCase() === 'SECRETARY' ? '#92400e' : '#166534'
                      }}>
                        {employee.role?.toUpperCase() === 'ADMIN' ? 'Admin' : employee.role?.toUpperCase() === 'SECRETARY' ? 'Secrétaire' : 'Coach'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(employee)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                          Modifier
                        </button>
                        {employee.role?.toUpperCase() !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(employee.id)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowModal(false)}>
          <div className="card" style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Jean"
                  />
                </div>

                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Dupont"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@club.com"
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div className="form-group">
                  <label>Rôle *</label>
                  <select
                    name="role"
                    value={formData.role?.toUpperCase()}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="SECRETARY">Secrétaire</option>
                    <option value="COACH">Coach</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {!editingEmployee && (
                  <div className="form-group">
                    <label>Mot de passe *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Minimum 8 caractères"
                      minLength="8"
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e1'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-success">
                  <span>💾</span>
                  <span>{editingEmployee ? 'Mettre à jour' : 'Créer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default EmployeesPage;
