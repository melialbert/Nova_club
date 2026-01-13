"""
Script pour créer les utilisateurs de test dans PostgreSQL
"""
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.security import get_password_hash

# Utiliser la variable d'environnement si disponible (dans Docker), sinon localhost
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://novaclub:novaclub123@postgres:5432/novaclub_db")

def create_test_users():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        print("🔄 Création des utilisateurs de test...")
        print()

        # Créer le club de test
        print("📋 Création du club de test...")
        club_query = text("""
            INSERT INTO clubs (id, name, city, slogan, is_active, sync_version, created_at, updated_at)
            VALUES (
                'c1111111-1111-1111-1111-111111111111',
                'Club de Judo Excellence',
                'Paris',
                'Excellence et Passion du Judo',
                true,
                1,
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO NOTHING
        """)
        session.execute(club_query)
        session.commit()
        print("✅ Club créé")
        print()

        # Hash du mot de passe "password123"
        hashed_password = get_password_hash("password123")
        print(f"🔐 Mot de passe hashé: {hashed_password[:50]}...")
        print()

        # Créer l'administrateur
        print("👤 Création de l'administrateur...")
        admin_query = text("""
            INSERT INTO users (id, club_id, email, hashed_password, first_name, last_name, phone, role, is_active, sync_version, created_at, updated_at)
            VALUES (
                :id,
                :club_id,
                :email,
                :hashed_password,
                :first_name,
                :last_name,
                :phone,
                :role,
                true,
                1,
                NOW(),
                NOW()
            )
            ON CONFLICT (email) DO UPDATE SET hashed_password = :hashed_password
        """)
        session.execute(admin_query, {
            'id': 'a0000000-0000-0000-0000-000000000001',
            'club_id': 'c1111111-1111-1111-1111-111111111111',
            'email': 'admin@club.com',
            'hashed_password': hashed_password,
            'first_name': 'Admin',
            'last_name': 'Principal',
            'phone': '+33123456789',
            'role': 'ADMIN'
        })
        print("✅ Admin créé: admin@club.com / password123")

        # Créer la secrétaire
        print("👤 Création de la secrétaire...")
        secretary_query = text("""
            INSERT INTO users (id, club_id, email, hashed_password, first_name, last_name, phone, role, is_active, sync_version, created_at, updated_at)
            VALUES (
                :id,
                :club_id,
                :email,
                :hashed_password,
                :first_name,
                :last_name,
                :phone,
                :role,
                true,
                1,
                NOW(),
                NOW()
            )
            ON CONFLICT (email) DO UPDATE SET hashed_password = :hashed_password
        """)
        session.execute(secretary_query, {
            'id': 'a0000000-0000-0000-0000-000000000002',
            'club_id': 'c1111111-1111-1111-1111-111111111111',
            'email': 'secretaire@club.com',
            'hashed_password': hashed_password,
            'first_name': 'Marie',
            'last_name': 'Dupont',
            'phone': '+33123456788',
            'role': 'SECRETARY'
        })
        print("✅ Secrétaire créée: secretaire@club.com / password123")

        # Créer le coach
        print("👤 Création du coach...")
        coach_query = text("""
            INSERT INTO users (id, club_id, email, hashed_password, first_name, last_name, phone, role, is_active, sync_version, created_at, updated_at)
            VALUES (
                :id,
                :club_id,
                :email,
                :hashed_password,
                :first_name,
                :last_name,
                :phone,
                :role,
                true,
                1,
                NOW(),
                NOW()
            )
            ON CONFLICT (email) DO UPDATE SET hashed_password = :hashed_password
        """)
        session.execute(coach_query, {
            'id': 'a0000000-0000-0000-0000-000000000003',
            'club_id': 'c1111111-1111-1111-1111-111111111111',
            'email': 'coach@club.com',
            'hashed_password': hashed_password,
            'first_name': 'Pierre',
            'last_name': 'Martin',
            'phone': '+33123456787',
            'role': 'COACH'
        })
        print("✅ Coach créé: coach@club.com / password123")

        session.commit()

        print()
        print("="*60)
        print("✅ TOUS LES UTILISATEURS ONT ÉTÉ CRÉÉS AVEC SUCCÈS!")
        print("="*60)
        print()
        print("📝 Comptes de test disponibles:")
        print("   • Admin:      admin@club.com / password123")
        print("   • Secrétaire: secretaire@club.com / password123")
        print("   • Coach:      coach@club.com / password123")
        print()
        print("🌐 Connectez-vous sur: http://localhost:3000/login")
        print()

    except Exception as e:
        print(f"❌ Erreur: {e}")
        session.rollback()
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    create_test_users()
