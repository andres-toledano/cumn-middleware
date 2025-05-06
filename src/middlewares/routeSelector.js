const { createProxyMiddleware } = require('http-proxy-middleware');
const { get } = require('axios');

// Reenvía el body manualmente si es POST o PUT
const attachBody = (proxyReq, req) => {
    if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
};

const springBootProxy = createProxyMiddleware({
    target: process.env.SPRING_BOOT_URL,
    changeOrigin: true,
    onProxyReq: attachBody,
    selfHandleResponse: false,
    onProxyRes: (proxyRes, req, res) => {
        delete proxyRes.headers['transfer-encoding'];
    },
});

const flaskProxy = createProxyMiddleware({
    target: process.env.FLASK_URL,
    changeOrigin: true,
    onProxyReq: attachBody,
    selfHandleResponse: false,
    onProxyRes: (proxyRes, req, res) => {
        delete proxyRes.headers['transfer-encoding'];
    },
});

const checkAdminRole = async (uid) => {
    try {
        const response = await get(`${process.env.SPRING_BOOT_URL}/api/user/uid/${uid}`);
        return response.data?.role === 'ADMIN';
    } catch (err) {
        console.error('Error comprobando el rol del usuario:', err.message);
        return false;
    }
};

const routeSelector = async (req, res, next) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', async () => {
        try {
            req.body = body ? JSON.parse(body) : {};
        } catch (e) {
            req.body = {};
        }

        const path = req.path;
        const uid = req.uid;

        if (!uid) {
            return res.status(401).json({ message: 'No se proporcionó UID' });
        }

        if (path.startsWith('/api/classroom')) {
            if (req.method === 'GET') {
                // Permitir GET para todos los usuarios
                return springBootProxy(req, res, next);
            }

            const isAdmin = await checkAdminRole(uid);
            if (!isAdmin) {
                return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
            }
            return springBootProxy(req, res, next);
        }

        if (path.startsWith('/api/user')) {
            return springBootProxy(req, res, next);
        }

        if (path.startsWith('/api/reservation')) {
            if (path === '/api/reservation/all') {
                const isAdmin = await checkAdminRole(uid);
                if (!isAdmin) {
                    return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
                }
            }
            return flaskProxy(req, res, next);
        }

        return res.status(404).json({ message: 'Ruta no reconocida' });
    });
};

module.exports = routeSelector;