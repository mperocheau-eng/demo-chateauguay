const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Base de données fictive pour la Ville de Châteauguay
const REGLEMENTATION = {
    cabanon: {
        superficieMaxSansPermis: 15, // m²
        reculClotureMin: 1.0,        // mètres
        documentsRequis: [
            "Le certificat de localisation à jour",
            "Un plan d'implantation du cabanon",
            "La brochure ou les dimensions du fabricant"
        ],
        lienSoumission: "https://www.ville.chateauguay.qc.ca/demande-de-permis"
    }
};

// Point d'entrée de notre API de préqualification
app.post('/api/prequalify', (req, res) => {
    // Avaya Infinity nous enverra ces données
    const { projet, superficie, recul } = req.body;

    if (!projet || projet.toLowerCase() !== 'cabanon') {
        return res.status(400).json({ error: "Seul le projet 'cabanon' est géré dans cette démo." });
    }

    const regles = REGLEMENTATION.cabanon;
    let requiertPermis = false;
    let motifs = [];

    // Logique d'évaluation
    if (parseFloat(superficie) > regles.superficieMaxSansPermis) {
        requiertPermis = true;
        motifs.push(`Superficie de ${superficie} m² (maximum autorisé sans permis : ${regles.superficieMaxSansPermis} m²)`);
    }

    if (parseFloat(recul) < regles.reculClotureMin) {
        requiertPermis = true;
        motifs.push(`Recul de la clôture de ${recul} m (minimum requis : ${regles.reculClotureMin} m)`);
    }

    // Réponse structurée pour Avaya Infinity
    res.json({
        permitRequired: requiertPermis,
        reasons: motifs,
        requiredDocuments: requiertPermis ? regles.documentsRequis : [],
        applicationLink: requiertPermis ? regles.lienSoumission : null,
        message: requiertPermis 
            ? "Un permis est nécessaire pour votre cabanon." 
            : "Aucun permis n'est requis pour votre projet sous réserve du respect des autres normes de zonage."
    });
});

app.listen(PORT, () => {
    console.log(`Serveur prêt sur le port ${PORT}`);
});
