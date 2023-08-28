import { FastifyInstance } from "fastify";
import { getFileImageWatermarkRoutes } from "./get-file-image-watermark";
import {brandingRoutes} from "./get-branding";

export async function fileRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    fastify.register(getFileImageWatermarkRoutes);
    fastify.register(brandingRoutes);
  }

  fastify.register(routes, {
    prefix: "/files",
  });
}
