import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

function LicensesPage() {
  const location = useLocation();
  const [members, setMembers] = useState([]);
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
    federation: 'FECAJUDO',
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
    try {
      const [licensesData, membersData] = await Promise.all([
        api.getLicenses(),
        api.getMembers()
      ]);
      setLicenses(licensesData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
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

    try {
      if (editingLicense) {
        await api.updateLicense(editingLicense.id, formData);
      } else {
        await api.createLicense(formData);
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving license:', error);
      alert('Erreur lors de l\'enregistrement de la licence');
    }
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
      try {
        await api.deleteLicense(license.id);
        setLicenses(licenses.filter(l => l.id !== license.id));
      } catch (error) {
        console.error('Error deleting license:', error);
        alert('Erreur lors de la suppression de la licence');
      }
    }
  };

  const resetForm = () => {
    setEditingLicense(null);
    setFormData({
      member_id: '',
      license_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      federation: 'FECAJUDO',
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
              padding: '16px'
            }}>
              {filteredLicenses.map(license => {
                const member = getMemberInfo(license.member_id);
                const expired = isExpired(license.expiry_date);
                return (
                  <div
                    key={license.id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      border: '2px solid #e2e8f0',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div style={{
                      background: expired ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      <span className={`status-badge status-${expired ? 'suspended' : license.status}`}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: 'white',
                          color: expired ? '#ef4444' : '#10b981',
                          fontWeight: '600',
                          fontSize: '11px'
                        }}
                      >
                        {expired ? 'Expirée' : license.status === 'active' ? 'Active' : license.status === 'pending' ? 'En attente' : 'Suspendue'}
                      </span>

                      {license.photo ? (
                        <img
                          src={license.photo}
                          alt={member?.first_name}
                          style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '96px',
                          height: '96px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: expired ? '#ef4444' : '#10b981',
                          fontWeight: '700',
                          fontSize: '32px',
                          border: '4px solid white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          {member ? member.first_name[0] + member.last_name[0] : '?'}
                        </div>
                      )}

                      <div style={{
                        marginTop: '16px',
                        textAlign: 'center',
                        color: 'white'
                      }}>
                        {member ? (
                          <>
                            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                              {member.first_name} {member.last_name}
                            </div>
                            <div style={{ fontSize: '13px', opacity: '0.9' }}>
                              {member.category} - {member.belt_level}
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: '18px', fontWeight: '700' }}>Adhérent inconnu</div>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                            Numéro de licence
                          </div>
                          <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                            {license.license_number}
                          </div>
                        </div>
                        <span className="badge badge-blue" style={{ fontSize: '11px', padding: '6px 12px' }}>
                          FECAJUDO
                        </span>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                            Saison
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            {license.season}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                            Expiration
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: expired ? '#ef4444' : '#10b981' }}>
                            {new Date(license.expiry_date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      {license.notes && (
                        <div style={{
                          fontSize: '13px',
                          color: '#64748b',
                          backgroundColor: '#f8fafc',
                          padding: '12px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          borderLeft: '3px solid #3b82f6'
                        }}>
                          {license.notes}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{
                            flex: 1,
                            padding: '10px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                          onClick={() => handleEdit(license)}
                        >
                          <span>✏️</span>
                          <span>Modifier</span>
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{
                            flex: 1,
                            padding: '10px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                          onClick={() => handleDelete(license)}
                        >
                          <span>🗑️</span>
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
  );
}

export default LicensesPage;
