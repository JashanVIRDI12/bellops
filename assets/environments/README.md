> **Not used by the site any more.** The windows now show a rendered sea of
> clouds (`components/experience/scene/Exterior.tsx`) instead of these
> photographs. This folder, `scripts/export-environment-assets.mjs` and
> `scripts/review-exterior.mjs` are kept for reference and can be deleted.

# Studio surroundings

The studio uses a fixed photographic rooftop setting. The visitor's location
controls time and weather; it does not select a photograph of their city.

The source is [Hotel Rooftop Balcony](https://polyhaven.com/a/hotel_rooftop_balcony),
photography by Dimitrios Savva, processed by Jarod Guest, available under
[CC0](https://polyhaven.com/license). `rooftop-day-source.png` is the original
overcast view. The clear, dusk and night masters were edited with the built-in
image generation tool using that image as the edit target. They preserve the
rooftop and skyline composition, with approximate matching geometry.

Runtime textures: `public/experience/environments/rooftop-{day,dusk,night,overcast}.webp`.
Re-export with `node scripts/export-environment-assets.mjs`. The four compressed
textures total about 580 KB and are loaded only by the live 3D scene. Phones
use the captured WebP stills instead.

After changing a panorama or lighting, recapture every mood and camera shot
with `STILLS_URL=http://localhost:3002 node scripts/capture-stills.mjs`, then
check the output on desktop and mobile. Version the still directory when its
contents change to avoid stale optimized images.

## Final generation prompts

Tool mode: built-in imagegen. Input for each edit: `rooftop-day-source.png`.

### Night — `rooftop-night-source.png`

Use case: lighting-weather. Asset type: seamless 2:1 equirectangular environment
panorama used outside windows of a real-time 3D office. Input image 1 is the EDIT
TARGET, a photographic rooftop panorama. Create the same exact view at NIGHT,
with photorealistic lighting. Preserve all geometry, camera position, projection,
crop, horizon height, skyline, glass railing, tower positions, architecture and
details exactly. Keep the entire 360-degree panorama composition; do not turn it
into a rectilinear photograph. Dark deep slate-blue night sky with delicate
natural layered clouds and subtle warm urban skyglow close to the horizon.
Sparse believable warm lights in distant city windows and streets; the rooftop
foreground remains dark with faint ambient illumination. No sun, no large moon,
no exaggerated stars, no dramatic glow, no added buildings, no text, no people,
no lens flare, no fog. Photographic night exposure, restrained highlights,
realistic architectural photography. Output a 2:1 panorama at high resolution.

### Day — `rooftop-clear-source.png`

Use case: lighting-weather. Asset type: 2:1 equirectangular 360-degree panorama
for a real-time office environment. Input image is the EDIT TARGET.
Photorealistic clear late-afternoon daylight. Change only the sky and
illumination: pale blue sky with a few delicate scattered natural white clouds
and warm neutral sunlight from the left, realistic exposure and atmospheric
depth. Keep the city and rooftop natural, no dramatic orange cast. Preserve the
EXACT original geometry, camera position, equirectangular projection, crop,
horizon height, architecture, glass railing, towers, skyline and rooftop.
Maintain the same complete panorama composition, seamlessly repeating
left/right edges. Do not turn it into a rectilinear photo. No new structures,
no text, no people, no lens flare, no added objects. High resolution 2:1 panorama.

### Dusk — `rooftop-dusk-source.png`

Use case: lighting-weather. Asset type: 2:1 equirectangular 360-degree panorama
for a real-time office environment. Input image is the EDIT TARGET.
Photorealistic blue hour just after sunset. Change only sky and illumination:
muted blue-violet sky, delicate peach light low along the horizon, naturally
layered sparse clouds. Sparse warm city lights turning on, dark rooftop
foreground. Restrained architecture photography, no brilliant sunset, no moon,
no stars. Preserve the EXACT original geometry, camera position, equirectangular
projection, crop, horizon height, architecture, glass railing, towers, skyline
and rooftop. Maintain the same complete panorama composition, seamlessly
repeating left/right edges. Do not turn it into a rectilinear photo. No new
structures, no text, no people, no lens flare, no added objects. High resolution
2:1 panorama.
