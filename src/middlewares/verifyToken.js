const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-service-account.json'))
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    admin.auth().verifyIdToken(token)
        .then(decodedToken => {
            req.uid = decodedToken.uid;
            next();
        })
        .catch(error => {
            console.error('Error al verificar el token', error);
            return res.status(401).json({ message: 'Token inválido' });
        });
};

module.exports = verifyToken;
