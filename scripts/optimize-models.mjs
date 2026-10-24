// Builds the models the site loads (public/models/) from the source models,
// as small as they can be without visibly changing the studio. Stronger
// settings were tried and rejected: they thin out the plants' leaves and
// wipe the laptop's key legends.
//
// It needs the glTF-Transform libraries, which aren't project dependencies.
// From any scratch folder:
//
//   npm i @gltf-transform/core@4 @gltf-transform/extensions@4 \
//     @gltf-transform/functions@4 meshoptimizer sharp
//   cp <repo>/scripts/optimize-models.mjs .
//   node optimize-models.mjs office <repo>/public/minimalistic_modern_office.glb office.glb
//   node optimize-models.mjs macbook <repo>/public/macbook_pro_m3_16_inch_2024.glb macbook.glb
//
// Then copy them into public/models/ under their new content hashes (see the
// README) and update components/experience/scene/models.ts.

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  flatten,
  instance,
  join,
  meshopt,
  palette,
  prune,
  simplify,
  sparse,
  textureCompress,
  weld,
} from "@gltf-transform/functions";
import {
  MeshoptDecoder,
  MeshoptEncoder,
  MeshoptSimplifier,
} from "meshoptimizer";
import sharp from "sharp";

const [model, input, output] = process.argv.slice(2);
if (!["office", "macbook"].includes(model) || !input || !output) {
  console.error(
    "Usage: node optimize-models.mjs <office|macbook> <source.glb> <output.glb>",
  );
  process.exit(1);
}

/* Tweakable values */
const TEXTURE_SIZE = 1024; // room surfaces, laptop colors and key legends
const DETAIL_SIZE = 512; // small things and fine surface detail
// The office: a light simplification that keeps every leaf on the plants.
const OFFICE_SIMPLIFY = { ratio: 0.5, error: 0.002 };
// The laptop: barely any, so the key legends survive the close-up.
const LAPTOP_SIMPLIFY = { ratio: 0, error: 0.0001 };

await Promise.all([
  MeshoptDecoder.ready,
  MeshoptEncoder.ready,
  MeshoptSimplifier.ready,
]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });
const document = await io.read(input);
const root = document.getRoot();

if (model === "macbook") {
  await document.transform(
    dedup(),
    // Fewer draw calls, as the glTF-Transform CLI does: share repeated parts,
    // fold plain-colored materials into one palette texture, merge meshes.
    instance({ min: 5 }),
    palette({ min: 5 }),
    flatten(),
    join(),
    prune(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ...LAPTOP_SIMPLIFY }),
    prune(),
    sparse(),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [TEXTURE_SIZE, TEXTURE_SIZE],
    }),
    // Bumps and roughness can be smaller; colors and legends stay sharp.
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      slots: /^(normalTexture|metallicRoughnessTexture|occlusionTexture)$/,
      resize: [DETAIL_SIZE, DETAIL_SIZE],
    }),
    meshopt({ encoder: MeshoptEncoder, level: "high" }),
  );
  await io.write(output, document);
  console.log(`wrote ${output}`);
  process.exit(0);
}

// The model's misty backdrop: the site hides it and draws its own sky.
for (const node of root.listNodes()) {
  const primitives = node.getMesh()?.listPrimitives() ?? [];
  if (primitives.some((p) => p.getMaterial()?.getName() === "Background"))
    node.dispose();
}

// The site lights each surface from one texture with baked light (the
// emissive one where there is one) and ignores the rest, so drop the rest.
// Base color points at the same texture and UV set, which frees the plants'
// unused first UV set.
for (const material of root.listMaterials()) {
  material.setOcclusionTexture(null);
  material.setMetallicRoughnessTexture(null);
  material.setNormalTexture(null);
  const emissive = material.getEmissiveTexture();
  if (!emissive) continue;
  const texCoord = material.getEmissiveTextureInfo()?.getTexCoord() ?? 0;
  material.setBaseColorTexture(emissive);
  material.getBaseColorTextureInfo()?.setTexCoord(texCoord);
  emissive.setName(material.getName().toLowerCase());
}

await document.transform(
  dedup(),
  prune({ keepAttributes: false, keepLeaves: false }),
  // The two potted plants share a material: one draw call instead of two.
  join({ keepNamed: false }),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ...OFFICE_SIMPLIFY }),
  prune({ keepAttributes: false }),
  sparse(),
  textureCompress({
    encoder: sharp,
    targetFormat: "webp",
    resize: [TEXTURE_SIZE, TEXTURE_SIZE],
  }),
  textureCompress({
    encoder: sharp,
    targetFormat: "webp",
    pattern: /^plants$/, // the plants are small on screen
    resize: [DETAIL_SIZE, DETAIL_SIZE],
  }),
  meshopt({ encoder: MeshoptEncoder, level: "high" }),
);

await io.write(output, document);
console.log(`wrote ${output}`);
