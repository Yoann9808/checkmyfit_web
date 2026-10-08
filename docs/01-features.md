# Checkmyfit — Liste des features

Source : maquette `artefact/maquette_mvp` (17 écrans) + décisions du 16/09/2026.
Priorité : **P0** = indispensable au MVP, **P1** = juste après le lancement, **P2** = plus tard.

## Changements par rapport à la maquette

Le business model est passé de la vente directe à **l'affiliation**. Conséquences :

| Élément de la maquette | Décision |
|---|---|
| Panier, checkout, confirmation de commande, icône panier dans le header | **Supprimés** |
| Bouton "Ajouter au panier" sur la fiche produit | Remplacé par **"Acheter chez {marchand}"** (lien affilié, nouvel onglet, clic tracké) |
| "Historique de mes commandes" sur le profil | Remplacé par **"Mes essayages"** (historique des rendus IA) |
| Sélecteur de taille sur la fiche produit | Conservé à titre informatif (tailles disponibles chez le marchand), sans effet sur l'achat |
| Écrans crédits + paiement carte "mock" | Conservés, paiement délégué à **Stripe Checkout** |
| Avis clients | P2, importables via CSV si le marchand les fournit |

Nouveau périmètre absent de la maquette : **back-office admin** pour importer et gérer le catalogue.

---

## A. Catalogue public (parcours e-commerce standard)

| # | Feature | Écran maquette | Prio |
|---|---|---|---|
| A1 | Page d'accueil : hero, "Nouveautés", "Les plus demandés" | home | P0 |
| A2 | Listing catalogue avec grille responsive | listing | P0 |
| A3 | Filtres : marque, catégorie, couleur, genre, prix max (slider) + chips actives | listing, essayage | P0 |
| A4 | Fiche produit : image, marque, nom, prix, description, entretien, fabrication, conseil taille | product | P0 |
| A5 | CTA affilié "Acheter chez {marchand}" avec tracking du clic | product | P0 |
| A6 | Encart "rendu IA prêt" sur la fiche quand l'essayage existe déjà | product | P0 |
| A7 | Recherche texte (nom, marque) | — | P1 |
| A8 | Tri (prix, nouveauté, popularité) | — | P1 |
| A9 | Avis clients importés | product | P2 |
| A10 | SEO : pages produit indexables, sitemap, Open Graph | — | P1 |

## B. Compte et onboarding

| # | Feature | Écran maquette | Prio |
|---|---|---|---|
| B1 | Inscription / connexion e-mail + mot de passe | signup | P0 |
| B2 | Connexion Google (OAuth) | signup | P0 |
| B3 | Upload de la photo de référence (une seule, remplaçable), stockage privé | upload | P0 |
| B4 | Guide de prise de vue (de face, pied à tête, bien éclairé) + validation basique du fichier | upload | P0 |
| B5 | 20 crédits offerts à l'inscription | — | P0 |
| B6 | Page profil : e-mail, photo de référence, solde, "Mes essayages" | profile | P0 |
| B7 | Redirection intelligente : essayer sans compte → signup → upload photo → retour à l'action | signup/upload | P0 |
| B8 | Suppression du compte et des images (RGPD) | — | P1 |
| B9 | Consentement explicite à l'usage de la photo pour la génération | upload | P0 |

## C. Essayage IA (feature majeure n°1)

| # | Feature | Écran maquette | Prio |
|---|---|---|---|
| C1 | Bouton "Essayer sur moi" depuis la fiche produit | product | P0 |
| C2 | Page "Essayage virtuel" : photo de référence à gauche, catalogue filtrable à droite, barre d'action fixe | essayage | P0 |
| C3 | Débit atomique de 1 crédit au lancement, remboursement automatique si échec | — | P0 |
| C4 | Génération de l'image : photo de référence + image produit → rendu porté | generating | P0 |
| C5 | Écran d'attente avec les 4 étapes narratives | generating | P0 |
| C6 | Écran résultat : rendu 3/4, vignette produit, "Sauver ce look", retour | result | P0 |
| C7 | Un rendu par couple (user, produit) : "Déjà généré, gratuit à revoir" | product, essayage | P0 |
| C8 | Blocage propre quand le solde est à 0, lien vers l'achat de crédits | product, essayage | P0 |
| C9 | Abstraction fournisseur IA (interchangeable sans toucher au produit) | — | P0 |
| C10 | Régénérer un rendu (nouveau crédit) | — | P1 |
| C11 | Comparaison avant / après (slider) | — | P1 |
| C12 | Téléchargement et partage du rendu | — | P1 |
| C13 | Modération : refus des photos non conformes (mineurs, nudité) | — | P1 |

## D. Dressing virtuel (feature majeure n°2)

| # | Feature | Écran maquette | Prio |
|---|---|---|---|
| D1 | Modale de bienvenue au premier accès | dressing | P0 |
| D2 | Onglet "Futurs achats" : rendus IA sauvegardés, lien vers la fiche produit | dressing | P0 |
| D3 | Onglets par famille de vêtement (taxonomie de 22 catégories) | dressing | P0 |
| D4 | "Ajouter un vêtement" que je possède : photo, marque, catégorie, couleur | dressing | P0 |
| D5 | Écran de confirmation "Look sauvé" | saved | P0 |
| D6 | Supprimer un élément du dressing | — | P0 |
| D7 | Compteur de looks | dressing | P0 |
| D8 | Essayer un vêtement de mon dressing sur moi | — | P2 |

## E. Crédits et paiement

| # | Feature | Écran maquette | Prio |
|---|---|---|---|
| E1 | Affichage du solde dans le header, lien vers la page crédits | header | P0 |
| E2 | Page packs : 10 / 30 / 100 crédits (4,99 / 12,99 / 34,99 €) | credits | P0 |
| E3 | Paiement via Stripe Checkout (aucune donnée carte chez nous) | creditsPayment | P0 |
| E4 | Webhook Stripe → créditation idempotente | — | P0 |
| E5 | Écran de confirmation avec nouveau solde | creditsConfirmed | P0 |
| E6 | Historique des transactions de crédits sur le profil | — | P1 |
| E7 | Reçus par e-mail (Stripe natif) | — | P1 |

## F. Back-office admin (nouveau)

| # | Feature | Prio |
|---|---|---|
| F1 | Accès réservé au rôle admin | P0 |
| F2 | Import CSV en masse : template téléchargeable, validation ligne par ligne, rapport d'erreurs, upsert par identifiant externe | P0 |
| F3 | Récupération des images produit depuis leur URL et stockage chez nous (pas de hotlink cassé) | P0 |
| F4 | Formulaire produit unitaire (création, édition, désactivation) | P0 |
| F5 | Liste des produits avec recherche et statut actif / inactif | P0 |
| F6 | Tableau de bord : inscriptions, essayages, crédits vendus, clics affiliés | P1 |
| F7 | Marquer "populaire" / "nouveauté" | P0 |
| F8 | Gestion des marchands (nom, programme d'affiliation, paramètre de tracking) | P1 |

## G. Transverse

| # | Feature | Prio |
|---|---|---|
| G1 | Design system : tokens Bois × Terracotta, Fraunces + DM Sans, boutons, badges, selects, cartes | P0 |
| G2 | Responsive mobile (la maquette masque la nav sous md : ajouter un menu mobile) | P0 |
| G3 | Pages légales : CGU, confidentialité (photo biométrique), mention affiliation | P0 |
| G4 | Analytics produit (événements : essayage, sauvegarde, clic affilié, achat crédits) | P1 |
| G5 | Rate limiting sur la génération et l'upload | P0 |
| G6 | E-mails transactionnels (bienvenue, crédits ajoutés) | P1 |
