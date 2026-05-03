const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Shop Credit App API',
            version: '1.0.0',
            description: 'API for Enterprise Shop Credit App Management',
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['src/routes/*.js'] 
};

module.exports = swaggerJsDoc(swaggerOptions);
