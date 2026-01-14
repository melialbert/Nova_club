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
    logo: ''
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
        logo: clubData.logo_url || clubData.logo || ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.club_name,
        city: formData.city,
        slogan: formData.slogan,
        logo_url: formData.logo
      };

      await api.updateClub(updateData);
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
          </div>
        </div>

        <div className="card" style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
          border: '2px solid #fde047'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🥋</span>
            Code Moral du Judo
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            padding: '8px'
          }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #3b82f6',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🙏</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6', margin: '0 0 8px 0' }}>
                Politesse
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                C'est le respect d'autrui
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #ef4444',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💪</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444', margin: '0 0 8px 0' }}>
                Courage
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                C'est faire ce qui est juste
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #10b981',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', margin: '0 0 8px 0' }}>
                Sincérité
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                C'est s'exprimer sans déguiser sa pensée
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #f59e0b',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b', margin: '0 0 8px 0' }}>
                Honneur
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                C'est être fidèle à la parole donnée
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #8b5cf6',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌸</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#8b5cf6', margin: '0 0 8px 0' }}>
                Modestie
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                C'est parler de soi-même sans orgueil
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #06b6d4',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 182, 212, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#06b6d4', margin: '0 0 8px 0' }}>
                Respect
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                C'est la plus haute des vertus humaines
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #f97316',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(249, 115, 22, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧘</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f97316', margin: '0 0 8px 0' }}>
                Contrôle de soi
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                C'est savoir se taire lorsque monte la colère
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #ec4899',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>❤️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ec4899', margin: '0 0 8px 0' }}>
                Amitié
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                C'est le plus pur des sentiments humains
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #bbf7d0'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🌐</span>
            {t('settings.language')}
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #bbf7d0'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                Langue de l'interface / Interface Language
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Choisissez la langue de l'application
              </div>
            </div>

            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '15px',
                color: '#0f172a',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                minWidth: '150px',
                transition: 'all 0.2s'
              }}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

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
