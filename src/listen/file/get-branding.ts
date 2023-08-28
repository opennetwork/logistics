import {FastifyInstance} from "fastify";
import {getBrandingLogoBufferAndType} from "../../branding";

export async function brandingRoutes(fastify: FastifyInstance) {
    try {
        fastify.get("/branding/logo", {
            async handler(request, response) {
                const { buffer, type } = await getBrandingLogoBufferAndType();
                response.header("Content-Type", type);
                response.send(buffer);
            }
        })
    } catch {}

}