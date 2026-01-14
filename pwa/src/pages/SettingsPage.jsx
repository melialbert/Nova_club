import { useEffect, useState } from 'react';
import { apiCall } from '../services/api';
import { useToast } from '../utils/useToast';
import Layout from '../components/Layout';
import { getDB, addToStore, getFromStore } from '../db';
import { queueChange } from '../services/syncService';

function SettingsPage() {
  const [clubSettings, setClubSettings] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    club_name: '',
    city: '',
    slogan: '',
    logo: ''
  });

  const { success, error } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const clubData = await apiCall('/clubs/my-club');
      await addToStore('settings', { ...clubData, id: 'club_settings' });

      setClubSettings(clubData);
      setFormData({
        club_name: clubData.club_name || clubData.name || '',
        city: clubData.city || '',
        slogan: clubData.slogan || '',
        logo: clubData.logo || clubData.logo_url || ''
      });
      setLogoPreview(clubData.logo || clubData.logo_url);
    } catch (err) {
      try {
        const clubData = await getFromStore('settings', 'club_settings');

        if (!clubData) {
          error('Mode hors ligne : Aucune donnée disponible');
          return;
        }

        setClubSettings(clubData);
        setFormData({
          club_name: clubData.club_name || clubData.name || '',
          city: clubData.city || '',
          slogan: clubData.slogan || '',
          logo: clubData.logo || clubData.logo_url || ''
        });
        setLogoPreview(clubData.logo || clubData.logo_url);
      } catch (offlineErr) {
        console.error('Erreur lors du chargement:', err);
        error('Erreur lors du chargement des paramètres');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData({ ...formData, logo: '' });
  };

  const handleResetDatabase = async () => {
    const confirmation = window.confirm(
      'ATTENTION !\n\n' +
      'Cette action va SUPPRIMER TOUTES les donnees locales :\n' +
      '- Tous les adherents\n' +
      '- Tous les paiements\n' +
      '- Toutes les presences\n' +
      '- Toutes les licences\n' +
      '- Tous les employes\n' +
      '- Toutes les transactions\n\n' +
      'Cette action est IRREVERSIBLE !\n\n' +
      'Etes-vous sur de vouloir continuer ?'
    );

    if (!confirmation) return;

    const doubleConfirmation = window.confirm(
      'DERNIERE CONFIRMATION !\n\n' +
      'Tapez OK pour confirmer la suppression DEFINITIVE de toutes les donnees.'
    );

    if (!doubleConfirmation) return;

    try {
      const dbName = 'novaclub_db';

      indexedDB.deleteDatabase(dbName);

      success('Base de donnees reinitialise !');

      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la reinitialisation:', err);
      error('Erreur lors de la reinitialisation');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.club_name,
        city: formData.city,
        slogan: formData.slogan,
        logo_url: formData.logo
      };

      try {
        const updatedClub = await apiCall('/clubs/my-club', {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        setClubSettings(updatedClub);
        await addToStore('settings', { ...updatedClub, id: 'club_settings' });
        success('Paramètres mis à jour avec succès');
      } catch (err) {
        if (err.message.includes('Mode hors ligne')) {
          const updatedClub = {
            ...clubSettings,
            ...updateData,
            club_name: formData.club_name,
            id: 'club_settings'
          };

          await addToStore('settings', updatedClub);
          await queueChange('settings', 'club_settings', updatedClub);
          setClubSettings(updatedClub);
          success('Paramètres mis à jour (sera synchronisé)');
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      error('Erreur lors de la sauvegarde des paramètres: ' + err.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: '#64748b' }}>Chargement des paramètres...</div>
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
              Gérez les informations de votre club
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Logo du club
              </h2>
            </div>

            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              {logoPreview ? (
                <div>
                  <img
                    src={logoPreview}
                    alt="Logo du club"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: '16px',
                      border: '3px solid #e2e8f0',
                      objectFit: 'contain',
                      marginBottom: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      Supprimer le logo
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  border: '3px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '48px 24px',
                  backgroundColor: '#f8fafc',
                  margin: '0 auto',
                  maxWidth: '400px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                    Ajouter le logo du club
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    Formats acceptés : JPG, PNG, SVG
                  </div>
                  <label style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Choisir un fichier
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Informations du club
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="form-group">
                <label>Nom du club *</label>
                <input
                  type="text"
                  name="club_name"
                  value={formData.club_name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Judo Club de Paris"
                />
              </div>

              <div className="form-group">
                <label>Ville *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Paris"
                />
              </div>

              <div className="form-group">
                <label>Slogan</label>
                <input
                  type="text"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleChange}
                  placeholder="Le slogan de votre club"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-success" style={{ fontSize: '15px', padding: '14px 32px' }}>
              <span>💾</span>
              <span>Enregistrer les paramètres</span>
            </button>
          </div>
        </form>

        <div className="card" style={{ marginTop: '24px', border: '2px solid #fee2e2' }}>
          <div className="card-header" style={{ backgroundColor: '#fee2e2', borderBottom: '2px solid #fecaca' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#991b1b', margin: 0 }}>
              Zone dangereuse
            </h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
                  Reinitialiser toutes les donnees
                </h3>
                <p style={{ fontSize: '14px', color: '#7f1d1d', lineHeight: '1.5', margin: 0 }}>
                  Cette action supprimera TOUTES les donnees locales de l'application (adherents, paiements, presences, etc.).
                  Cette action est IRREVERSIBLE !
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDatabase}
                className="btn"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontSize: '14px',
                  padding: '12px 24px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>🗑️</span>
                <span>Reinitialiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SettingsPage;
