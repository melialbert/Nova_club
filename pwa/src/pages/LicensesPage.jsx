import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllFromStore, addToStore, updateInStore, deleteFromStore } from '../db';
import { queueChange } from '../services/syncService';
import { useMemberStore } from '../utils/store';
import Layout from '../components/Layout';

function LicensesPage() {
  const location = useLocation();
  const { members, setMembers } = useMemberStore();
  const [licenses, setLicenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    member_id: '',
    license_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    federation: 'FFJDA',
    season: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    photo: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location.state?.memberId) {
      setFormData(prev => ({ ...prev, member_id: location.state.memberId }));
      setShowForm(true);
    }
  }, [location.state]);

  const loadData = async () => {
    const licensesData = await getAllFromStore('licenses');
    const membersData = await getAllFromStore('members');
    setLicenses(licensesData);
    setMembers(membersData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingLicense) {
      const updatedLicense = {
        ...editingLicense,
        ...formData,
        updated_at: new Date().toISOString()
      };
      await updateInStore('licenses', updatedLicense);
      await queueChange('licenses', updatedLicense.id, updatedLicense);
      setLicenses(licenses.map(l => l.id === updatedLicense.id ? updatedLicense : l));
    } else {
      const newLicense = {
        id: crypto.randomUUID(),
        ...formData,
        club_id: 'current_club_id',
        created_at: new Date().toISOString()
      };
      await addToStore('licenses', newLicense);
      await queueChange('licenses', newLicense.id, newLicense);
      setLicenses([...licenses, newLicense]);
    }

    resetForm();
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    setFormData({
      member_id: license.member_id,
      license_number: license.license_number,
      issue_date: license.issue_date,
      expiry_date: license.expiry_date,
      federation: license.federation,
      season: license.season,
      photo: license.photo,
      status: license.status,
      notes: license.notes || ''
    });
    setPhotoPreview(license.photo);
    setShowForm(true);
  };

  const handleDelete = async (license) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette licence ?')) {
      await deleteFromStore('licenses', license.id);
      await queueChange('licenses', license.id, { ...license, deleted: true });
      setLicenses(licenses.filter(l => l.id !== license.id));
    }
  };

  const resetForm = () => {
    setEditingLicense(null);
    setFormData({
      member_id: '',
      license_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      federation: 'FFJDA',
      season: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      photo: '',
      status: 'active',
      notes: ''
    });
    setPhotoPreview(null);
    setShowForm(false);
  };

  const getMemberInfo = (memberId) => {
    return members.find(m => m.id === memberId);
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const filteredLicenses = licenses.filter(license => {
    const member = getMemberInfo(license.member_id);
    const memberName = member ? `${member.first_name} ${member.last_name}`.toLowerCase() : '';
    const matchesSearch = memberName.includes(searchTerm.toLowerCase()) ||
      license.license_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || license.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeLicenses = licenses.filter(l => l.status === 'active' && !isExpired(l.expiry_date)).length;
  const expiredLicenses = licenses.filter(l => isExpired(l.expiry_date)).length;
  const pendingLicenses = licenses.filter(l => l.status === 'pending').length;

  return (
    <Layout>
      <div className="fade-in">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              {filteredLicenses.length} licence{filteredLicenses.length > 1 ? 's' : ''} enregistrée{filteredLicenses.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            className="btn btn-success"
            onClick={() => setShowForm(!showForm)}
          >
            <span>{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Annuler' : 'Nouvelle licence'}</span>
          </button>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              ✓
            </div>
            <div className="stat-value">{activeLicenses}</div>
            <div className="stat-label">Licences actives</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              ⚠️
            </div>
            <div className="stat-value">{expiredLicenses}</div>
            <div className="stat-label">Licences expirées</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              ⏳
            </div>
            <div className="stat-value">{pendingLicenses}</div>
            <div className="stat-label">En attente</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              📊
            </div>
            <div className="stat-value">{licenses.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        {showForm && (
          <div className="card fade-in" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                🎫 {editingLicense ? 'Modifier la licence' : 'Créer une nouvelle licence'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label>Adhérent *</label>
                  <select name="member_id" value={formData.member_id} onChange={handleChange} required>
                    <option value="">Sélectionner un adhérent</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} - {member.belt_level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Numéro de licence *</label>
                  <input type="text" name="license_number" value={formData.license_number} onChange={handleChange} required placeholder="Ex: 12345678" />
                </div>
                <div className="form-group">
                  <label>Fédération</label>
                  <select name="federation" value={formData.federation} onChange={handleChange}>
                    <option value="FFJDA">FFJDA - Fédération Française de Judo</option>
                    <option value="FFJJKA">FFJJKA - Fédération Française de Ju-Jitsu</option>
                    <option value="UFOLEP">UFOLEP</option>
                    <option value="FSGT">FSGT</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Saison *</label>
                  <input type="text" name="season" value={formData.season} onChange={handleChange} required placeholder="Ex: 2024-2025" />
                </div>
                <div className="form-group">
                  <label>Date d'émission *</label>
                  <input type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Date d'expiration *</label>
                  <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="pending">En attente</option>
                    <option value="expired">Expirée</option>
                    <option value="suspended">Suspendue</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Photo d'identité</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{
                    padding: '12px',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer'
                  }}
                />
                {photoPreview && (
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Informations complémentaires..."></textarea>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-success">
                  <span>✓</span>
                  <span>{editingLicense ? 'Modifier' : 'Créer la licence'}</span>
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              🎫 Liste des licences
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="pending">En attente</option>
                <option value="expired">Expirées</option>
                <option value="suspended">Suspendues</option>
              </select>
              <input
                type="text"
                placeholder="Rechercher une licence..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: '300px' }}
              />
            </div>
          </div>

          {filteredLicenses.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Adhérent</th>
                    <th>N° Licence</th>
                    <th>Fédération</th>
                    <th>Saison</th>
                    <th>Expiration</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map(license => {
                    const member = getMemberInfo(license.member_id);
                    const expired = isExpired(license.expiry_date);
                    return (
                      <tr key={license.id}>
                        <td>
                          {license.photo ? (
                            <img
                              src={license.photo}
                              alt={member?.first_name}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #e2e8f0'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '14px'
                            }}>
                              {member ? member.first_name[0] + member.last_name[0] : '?'}
                            </div>
                          )}
                        </td>
                        <td>
                          {member ? (
                            <div>
                              <div style={{ fontWeight: '600', color: '#0f172a' }}>
                                {member.first_name} {member.last_name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {member.category} - {member.belt_level}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Inconnu</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#0f172a' }}>
                            {license.license_number}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-blue">
                            {license.federation}
                          </span>
                        </td>
                        <td>{license.season}</td>
                        <td>
                          <div style={{ color: expired ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                            {new Date(license.expiry_date).toLocaleDateString('fr-FR')}
                            {expired && <div style={{ fontSize: '11px', marginTop: '2px' }}>⚠️ Expirée</div>}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${expired ? 'suspended' : license.status}`}>
                            {expired ? 'Expirée' : license.status === 'active' ? 'Active' : license.status === 'pending' ? 'En attente' : 'Suspendue'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => handleEdit(license)}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f8fafc';
                                e.target.style.borderColor = '#3b82f6';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#e2e8f0';
                              }}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => handleDelete(license)}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#fef2f2';
                                e.target.style.borderColor = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#e2e8f0';
                              }}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎫</div>
              <div className="empty-state-title">
                {searchTerm || filterStatus !== 'all' ? 'Aucun résultat' : 'Aucune licence'}
              </div>
              <div className="empty-state-description">
                {searchTerm || filterStatus !== 'all'
                  ? 'Aucune licence ne correspond à vos critères'
                  : 'Commencez par créer votre première licence'}
              </div>
              {!searchTerm && filterStatus === 'all' && (
                <button className="btn btn-success" onClick={() => setShowForm(true)}>
                  <span>+</span>
                  <span>Créer une licence</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default LicensesPage;
