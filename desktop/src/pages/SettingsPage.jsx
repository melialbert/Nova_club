import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

function SettingsPage() {
  const { t, language, changeLanguage } = useTranslation();
  const [clubSettings, setClubSettings] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    club_name: '',
    city: '',
    slogan: '',
    logo: '',
    language: 'fr'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const clubData = await api.getClub();

      setClubSettings(clubData);
      setFormData({
        club_name: clubData.name || clubData.club_name || '',
        city: clubData.city || '',
        slogan: clubData.slogan || '',
        logo: clubData.logo_url || clubData.logo || '',
        language: clubData.language || 'fr'
      });
      setLogoPreview(clubData.logo_url || clubData.logo);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      alert('Erreur lors du chargement des paramètres');
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


  const handleFixLanguageColumn = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/club/fix-language-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la correction');
      }

      const result = await response.json();
      alert(result.message + '\nVeuillez recharger la page.');
      window.location.reload();
    } catch (err) {
      console.error('Erreur lors de la correction:', err);
      alert('Erreur lors de la correction de la colonne language');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.club_name,
        city: formData.city,
        slogan: formData.slogan,
        logo_url: formData.logo,
        language: formData.language
      };

      await api.updateClub(updateData);
      await changeLanguage(formData.language);
      alert(t('settings.saveSuccess'));
      loadSettings();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert(t('settings.saveError'));
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ color: '#64748b' }}>{t('settings.loadingSettings')}</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{
        marginBottom: '32px',
        padding: '32px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderRadius: '20px',
        color: 'white',
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(255, 255, 255, 0.3)'
          }}>
            ⚙️
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
              {t('settings.title')}
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
              {t('settings.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '32px',
              padding: '8px'
            }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🖼️</span>
                  {t('settings.logo')}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
                  {t('settings.logoDescription')}
                </p>

                {!logoPreview ? (
                  <label style={{
                    display: 'block',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📤</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                      {t('settings.clickToUpload')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {t('settings.fileFormat')}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                ) : null}
              </div>

              {logoPreview && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    position: 'relative',
                    padding: '24px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
                    borderRadius: '20px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <img
                      src={logoPreview}
                      alt="Logo du club"
                      style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '12px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{
                      padding: '10px 20px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      {t('common.edit')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🏛️</span>
              {t('settings.generalInfo')}
            </h2>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏷️</span>
                {t('settings.clubName')} *
              </label>
              <input
                type="text"
                name="club_name"
                value={formData.club_name}
                onChange={handleChange}
                required
                placeholder={t('settings.clubNamePlaceholder')}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span>
                {t('settings.city')} *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder={t('settings.cityPlaceholder')}
              />
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>💬</span>
              {t('settings.clubIdentity')}
            </h2>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span>
                {t('settings.slogan')}
              </label>
              <input
                type="text"
                name="slogan"
                value={formData.slogan}
                onChange={handleChange}
                placeholder={t('settings.sloganPlaceholder')}
              />
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                {t('settings.sloganDescription')}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌐</span>
                {t('settings.language')}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  color: '#0f172a',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                {t('settings.languageDescription')}
              </div>
            </div>

            {/* Bouton de correction temporaire */}
            <div style={{ marginTop: '16px', padding: '16px', background: '#fef3c7', borderRadius: '10px', border: '1px solid #fbbf24' }}>
              <div style={{ fontSize: '13px', color: '#92400e', marginBottom: '12px', fontWeight: '500' }}>
                ⚠️ Si vous ne pouvez pas changer la langue, cliquez sur ce bouton pour corriger la base de données :
              </div>
              <button
                type="button"
                onClick={handleFixLanguageColumn}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
              >
                🔧 Corriger la colonne language
              </button>
            </div>
          </div>
        </div>

        {clubSettings && (
          <div className="card" style={{
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '2px solid #bae6fd'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>👁️</span>
              {t('settings.preview')}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '24px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Aperçu logo"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    border: '2px solid #e2e8f0'
                  }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  border: '2px solid #e2e8f0'
                }}>
                  🏢
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {formData.club_name || 'Nom du club'}
                </h3>
                <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 4px 0' }}>
                  📍 {formData.city || 'Ville'}
                </p>
                {formData.slogan && (
                  <p style={{ fontSize: '14px', color: '#3b82f6', margin: 0, fontStyle: 'italic' }}>
                    "{formData.slogan}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          padding: '24px',
          background: 'white',
          borderRadius: '16px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <button
            type="button"
            onClick={loadSettings}
            style={{
              padding: '14px 28px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
          >
            <span>🔄</span>
            <span>{t('common.cancel')}</span>
          </button>
          <button
            type="submit"
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            <span>💾</span>
            <span>{t('settings.saveChanges')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPage;
