Documentation pour un Projet Frontend et Backend
Aperçu du Projet
Ce projet consiste en une application frontend développée avec React et TypeScript, et un serveur backend développé avec Node.js. L'objectif est de créer une application web robuste qui communique efficacement entre les composants frontend et backend.

A SAVOIR = 
Partout dans le code où il y a écrit'monitor', cela fait référence au employé/collaborateur, et de même pour le student, cela fait référence au client.


Table des Matières
Prérequis
Structure du Projet
Installation
Lancement de l'Application
Frontend
Structure des Dossiers
Dépendances Clés
Scripts
Backend
Structure des Dossiers
Dépendances Clés
Scripts
Points de Terminaison API
Déploiement
Tests

-Prérequis:
 Assurez-vous d'avoir les éléments suivants installés sur votre système :

Node.js (v14 ou supérieur)
npm (v6 ou supérieur) ou yarn (v1.22 ou supérieur)

project-root/
├── server/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── README.md
└── ...



Installation
Cloner le dépôt

git clone https://github.com/MyRendev/autoecolecotp
cd autoecolecotp

Installer les dépendances pour le backend
cd server
npm install


Installer les dépendances pour le frontend
cd ../frontend
npm install



Lancement de l'Application
Backend
Pour démarrer le serveur backend :

cd server
npm run dev


Frontend
Pour démarrer l'application frontend :


cd frontend
npm start : Démarrer l'application en mode développement.
npm build : Construire l'application pour la production.
npm test : Lancer les tests unitaires.



Backend
Structure des Dossiers (Backend)


Structure des fichiers (front) 
addRendezvous.tsx : ajoute de rdv
addStudents.tsx : ajout de client
addmonitor.tsx : ajout d'employer
addForfait.tsx :ajout d'interventions



Points de Terminaison API
!!!A SAVOIR!!! = 
Partout dans le code où il y a écrit'monitor', cela fait référence au employé/collaborateur, et de même pour le student, cela fait référence au client, de meme pour forfait ->intervention.


Les API son rangées dans server -> src -> router
-adminmailing : gère l'envoi de mails des admins via l'application directement
-auth : authentification des utilisateurs
-clientAuthorization : gère tout ce qui concerne les choix des clients (rendez-vous, etc.)
-clientChoice : gère les données des choix des clients pour la prise de rendez-vous
-CorpSetting : paramétrage des entreprises
-delayedrendezvous : on ne l'utilise plus
-disponibilite : gère toutes les disponibilités et superpositions (congés) des employés et de l'entreprise
-forfait : gère les interventions
-mailing : gère les mails en général
-rendezvous : gère tout ce qui touche aux rendez-vous (création, mise à jour, suppression, etc.)
-Satisfaction : gère l'envoi des formulaires de satisfaction
-SatisfactionReponse : gère les réponses des formulaires de satisfaction
-users : gère la création, suppression, modification des utilisateurs et l'attribution de leurs rôles
-vehicule : gère la création, modification, suppression de véhicules


fichier test:
le fichier test sert a effectuer des test dans une page vide pour y acceder ajoutez /test a l'url ex: http://localhost:5173/test