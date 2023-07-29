import {FastifyInstance} from "fastify";
import basePlugin from "@fastify/swagger";
import uiPlugin from "@fastify/swagger-ui";
import {getOrigin} from "./config";
import {homepage} from "../package";
import {getConfig} from "../config";

export async function setupSwagger(fastify: FastifyInstance) {
    const url = getOrigin()

    const { host, protocol } = new URL(url);

    const { name, version } = getConfig();

    await fastify.register(basePlugin, {
        swagger: {
            info: {
                title: name,
                description: '',
                version
            },
            externalDocs: {
                url: homepage,
                description: 'Find more info here'
            },
            host,
            schemes: [protocol.replace(":", "")],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [

            ],
            definitions: {

            },
            securityDefinitions: {
                apiKey: {
                    type: 'apiKey',
                    name: 'apiKey',
                    in: 'header'
                }
            }
        }
    })


    fastify.register(uiPlugin, {
        routePrefix: '/api/documentation',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false,
            url
        },
        uiHooks: {
            onRequest: function (request, reply, next) { next() },
            preHandler: function (request, reply, next) { next() }
        },
        staticCSP: false,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
        transformSpecificationClone: true
    })
}