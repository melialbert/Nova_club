import { useEffect, useState } from 'react';
import { getAllFromStore, addToStore, updateInStore } from '../db';
import { queueChange } from '../services/syncService';
import { useToast } from '../utils/useToast';
import Layout from '../components/Layout';

function SettingsPage() {
  const [clubSettings, setClubSettings] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    club_name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    description: '',
    facebook: '',
    instagram: '',
    president: '',
    treasurer: '',
    secretary: ''
  });

  const { success, error } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getAllFromStore('settings');
    if (settings.length > 0) {
      const clubSettings = settings[0];
      setClubSettings(clubSettings);
      setFormData(clubSettings);
      setLogoPreview(clubSettings.logo);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (clubSettings) {
        const updatedSettings = {
          ...clubSettings,
          ...formData,
          updated_at: new Date().toISOString()
        };
        await updateInStore('settings', updatedSettings);
        await queueChange('settings', updatedSettings.id, updatedSettings);
        setClubSettings(updatedSettings);
        success('Paramètres mis à jour avec succès');
      } else {
        const newSettings = {
          id: crypto.randomUUID(),
          ...formData,
          created_at: new Date().toISOString()
        };
        await addToStore('settings', newSettings);
        await queueChange('settings', newSettings.id, newSettings);
        setClubSettings(newSettings);
        success('Paramètres créés avec succès');
      }
    } catch (err) {
      error('Erreur lors de la sauvegarde des paramètres');
    }
  };

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
                Informations générales
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="contact@club.com"
                />
              </div>

              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div className="form-group">
                <label>Site web</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.club.com"
                />
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 rue de la paix"
                />
              </div>

              <div className="form-group">
                <label>Ville</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Paris"
                />
              </div>

              <div className="form-group">
                <label>Code postal</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="75001"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Description du club</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Présentation du club, historique, valeurs..."
              ></textarea>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Réseaux sociaux
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/votreclub"
                />
              </div>

              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/votreclub"
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Bureau directeur
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label>Président</label>
                <input
                  type="text"
                  name="president"
                  value={formData.president}
                  onChange={handleChange}
                  placeholder="Nom du président"
                />
              </div>

              <div className="form-group">
                <label>Trésorier</label>
                <input
                  type="text"
                  name="treasurer"
                  value={formData.treasurer}
                  onChange={handleChange}
                  placeholder="Nom du trésorier"
                />
              </div>

              <div className="form-group">
                <label>Secrétaire</label>
                <input
                  type="text"
                  name="secretary"
                  value={formData.secretary}
                  onChange={handleChange}
                  placeholder="Nom du secrétaire"
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
      </div>
    </Layout>
  );
}

export default SettingsPage;
