# Conformité Réglementaire Française - Roomivo

## 📋 Vue d'ensemble

Roomivo est une plateforme de mise en relation locative conforme à la réglementation française en matière de location immobilière.

## ⚖️ Cadre Juridique

### Législation Applicable

1. **Loi n°89-462 du 6 juillet 1989**
   - Régit les rapports locatifs
   - Définit les droits et obligations des parties
   - Fixe les clauses obligatoires et interdites

2. **Loi ALUR (2014)**
   - Encadrement des loyers en zones tendues
   - Encadrement des frais d'agence
   - Protection renforcée des locataires

3. **Loi ELAN (2018)**
   - Modernisation des baux
   - Simplification des procédures
   - Bail mobilité

4. **RGPD et Loi Informatique et Libertés**
   - Protection des données personnelles
   - Droits des utilisateurs sur leurs données
   - Consentement et transparence

## 📄 Documents et Obligations Légales

### Diagnostics Techniques Obligatoires

Tous les baux doivent inclure les diagnostics suivants (selon applicabilité) :

- **DPE** (Diagnostic de Performance Énergétique) - Obligatoire pour tous
- **CREP** (Constat Risque Exposition Plomb) - Si construction avant 1949
- **Amiante** - Si permis de construire avant 1er juillet 1997
- **Gaz** - Si installation > 15 ans
- **Électricité** - Si installation > 15 ans
- **ERNT** (État des Risques Naturels et Technologiques) - Obligatoire
- **Loi Carrez** - Pour les lots en copropriété
- **Loi Boutin** - Surface habitable pour location nue

### Clauses Obligatoires du Bail

Conformément au décret n°87-713 :

1. Identité et domicile des parties
2. Date de prise d'effet et durée du contrat
3. Description du logement et des locaux accessoires
4. Destination du logement (habitation principale uniquement)
5. Montant du loyer et modalités de paiement
6. Montant du dépôt de garantie
7. Nature et montant des travaux effectués depuis le dernier contrat
8. Référence aux honoraires

### Clauses Interdites

Article 4 du décret n°87-713 interdit notamment :

- Obligation de payer par prélèvement automatique
- Solidarité après départ d'un colocataire
- Paiement direct au syndic
- Résiliation automatique en cas de non-paiement
- Dispense du bailleur de faire certaines réparations

## 💰 Règles Financières

### Dépôt de Garantie (Article 22)
- **Logement nu** : Maximum 1 mois de loyer hors charges
- **Logement meublé** : Maximum 2 mois de loyer hors charges
- **Restitution** : Dans les 2 mois suivant la remise des clés (1 mois si état des lieux conforme)

### Encadrement des Loyers
- Applicable dans certaines zones tendues (Paris, Lyon, etc.)
- Loyer ne peut dépasser le loyer de référence majoré
- Exceptions pour logements rénovés récemment

### Frais d'Agence (Loi ALUR)
- Partagés entre locataire et propriétaire
- Barème légal en fonction de la surface
- Plafonnement selon la localisation

## 🔐 Protection des Données (RGPD)

### Données Collectées
- Identité : nom, prénom, email
- Coordonnées : adresse, téléphone
- Données financières : revenus, justificatifs
- Historique : location, paiements

### Droits des Utilisateurs
- **Droit d'accès** : Consulter ses données
- **Droit de rectification** : Corriger ses données
- **Droit à l'effacement** : Supprimer son compte
- **Droit à la portabilité** : Récupérer ses données
- **Droit d'opposition** : Refuser certains traitements

### Durée de Conservation
- Données de profil : Durée du compte + 3 ans
- Données de transaction : 10 ans (obligation comptable)
- Logs de connexion : 12 mois

### Sécurité
- Chiffrement des données en transit (TLS/HTTPS)
- Chiffrement des données au repos
- Authentification sécurisée avec Supabase Auth
- Row Level Security (RLS) sur toutes les tables sensibles
- Audits de sécurité réguliers

## 🏠 Logement Décent (Décret n°2002-120)

Un logement décent doit :

### Critères de Décence
1. **Surface minimale** : 9m² et 2,20m de hauteur sous plafond
2. **Volume habitable** : 20m³ minimum
3. **Équipements conformes** : Eau potable, électricité, chauffage
4. **Étanchéité** : Protégé contre infiltrations
5. **Sécurité** : Installations gaz/électricité conformes
6. **Performance énergétique** : DPE avec étiquette E minimum (à partir de 2025)

## 📝 Préavis et Résiliation

### Pour le Locataire (Article 12)
- **3 mois** : Préavis standard
- **1 mois** : Zone tendue, mutation professionnelle, perte d'emploi, invalidité, santé

### Pour le Bailleur (Article 15)
- **6 mois** minimum
- Motifs légitimes uniquement :
  - Reprise pour habiter ou faire habiter (famille proche)
  - Vente du bien
  - Motif légitime et sérieux

## 🛡️ Assurances

### Assurance du Locataire (Article 7)
- **Obligatoire** : Assurance risques locatifs minimum
- Justificatif à fournir annuellement au bailleur
- Défaut d'assurance = motif de résiliation

### Assurance du Propriétaire
- Assurance Propriétaire Non Occupant (PNO) recommandée
- Garantie Loyers Impayés (GLI) optionnelle

## 🔄 État des Lieux

### État des Lieux d'Entrée
- Obligatoire et contradictoire
- Établi à l'amiable ou par huissier
- Précis et détaillé pour chaque pièce
- Photos recommandées

### État des Lieux de Sortie
- Comparaison avec l'état d'entrée
- Vétusté prise en compte
- Déductions éventuelles sur dépôt de garantie

## ⚠️ Points d'Attention pour la Plateforme

### Fonctionnalités en Développement

1. **Paiements Sécurisés**
   - Intégration Stripe requise pour traitement réel
   - Service de séquestre conforme DSP2
   - Actuellement en mode démonstration

2. **Signature Électronique**
   - Conforme au règlement eIDAS
   - Valeur juridique équivalente à signature manuscrite
   - Nécessite intégration fournisseur certifié (Docusign, Yousign, etc.)

3. **Vérification d'Identité**
   - KYC (Know Your Customer) conforme ACPR
   - Nécessite intégration solution agréée

4. **Génération de Documents**
   - Contrats conformes modèle légal
   - Diagnostic automatique selon caractéristiques
   - Révision régulière selon évolutions législatives

## 📚 Ressources Légales

### Textes de Référence
- [Loi du 6 juillet 1989](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000509310/)
- [Décret n°87-713](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000873143/)
- [Loi ALUR](https://www.legifrance.gouv.fr/dossierlegislatif/JORFDOLE000027351110/)
- [RGPD](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)

### Organismes de Référence
- **ANIL** (Agence Nationale pour l'Information sur le Logement) : [anil.org](https://www.anil.org)
- **CNIL** (Protection des données) : [cnil.fr](https://www.cnil.fr)
- **Service-Public.fr** : Fiches pratiques location

### Organismes de Médiation
- Commission Départementale de Conciliation (CDC)
- Médiateur de la consommation
- Plateforme européenne RLL : [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr)

## 🔄 Mises à Jour

Ce document doit être maintenu à jour selon les évolutions législatives :

- **Interdiction location passoires thermiques** : G en 2025, F en 2028, E en 2034
- **Évolutions RGPD** : Nouvelles directives européennes
- **Jurisprudence** : Décisions de justice importantes
- **Décrets d'application** : Nouvelles modalités pratiques

---

**Dernière mise à jour** : Novembre 2024  
**Contact légal** : legal@roomivo.fr  
**DPO** : dpo@roomivo.fr
