export type PromptTemplate = {
  id: string;
  title: string;
  category: string;
  text: string;
};

export const PROMPT_CATEGORIES = [
  "Product Photography",
  "YouTube Thumbnails",
  "Movie Posters",
  "Children's Story Illustrations",
  "Realistic Portraits",
  "Logos",
  "Anime",
  "Fantasy Art",
  "Cinematic Scenes",
] as const;

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "prod-1",
    title: "Floating product on seamless backdrop",
    category: "Product Photography",
    text: "A [product] floating in the centre of a seamless pastel backdrop, studio softbox lighting, gentle drop shadow, 85mm macro lens, ultra sharp details, commercial catalogue photography, 4k",
  },
  {
    id: "prod-2",
    title: "Splash & motion product shot",
    category: "Product Photography",
    text: "A [product] hit by a dynamic splash of water, frozen motion, high-speed flash, dark glossy surface, dramatic rim light, hyper detailed, advertising photography",
  },
  {
    id: "prod-3",
    title: "Lifestyle desk flat lay",
    category: "Product Photography",
    text: "Top-down flat lay of a [product] on a warm oak desk with linen, coffee and dried flowers, soft window light, natural colour grade, editorial lifestyle photo",
  },
  {
    id: "yt-1",
    title: "Shock reaction thumbnail",
    category: "YouTube Thumbnails",
    text: "YouTube thumbnail: close-up of a person with a shocked expression, bold high-contrast lighting, glowing arrow pointing at [subject], vibrant saturated colours, large empty space on the right for text, 16:9",
  },
  {
    id: "yt-2",
    title: "Before vs after split",
    category: "YouTube Thumbnails",
    text: "YouTube thumbnail split in two halves showing [before] versus [after], strong yellow divider line, punchy colour grading, dramatic lighting, ultra clear focal subject, 16:9",
  },
  {
    id: "mp-1",
    title: "Epic blockbuster poster",
    category: "Movie Posters",
    text: "Cinematic movie poster of [subject], hero standing against a burning sky, volumetric god rays, orange and teal grade, epic scale, film grain, space at the bottom for title text, 2:3",
  },
  {
    id: "mp-2",
    title: "Minimal thriller poster",
    category: "Movie Posters",
    text: "Minimalist thriller movie poster, single silhouette of [subject] in a vast negative space, deep shadows, one accent colour, grainy texture, elegant typography space, 2:3",
  },
  {
    id: "kid-1",
    title: "Watercolour storybook page",
    category: "Children's Story Illustrations",
    text: "Soft watercolour children's book illustration of [character] in [place], friendly rounded shapes, warm pastel palette, gentle sunlight, hand painted paper texture, whimsical and cosy",
  },
  {
    id: "kid-2",
    title: "Cut-paper collage scene",
    category: "Children's Story Illustrations",
    text: "Cut-paper collage illustration of [scene] for a children's picture book, layered textures, bright cheerful colours, simple friendly characters, soft shadows between paper layers",
  },
  {
    id: "port-1",
    title: "Natural window-light portrait",
    category: "Realistic Portraits",
    text: "Photorealistic portrait of [person], soft north-facing window light, shallow depth of field, 85mm f/1.4, natural skin texture, catchlights in the eyes, muted neutral background",
  },
  {
    id: "port-2",
    title: "Moody studio portrait",
    category: "Realistic Portraits",
    text: "Dramatic studio portrait of [person], single key light with deep falloff, dark charcoal backdrop, sharp eyes, cinematic colour grade, medium format detail",
  },
  {
    id: "logo-1",
    title: "Clean geometric mark",
    category: "Logos",
    text: "Minimal geometric logo mark for [brand], simple bold shapes, perfect symmetry, single accent colour on white, flat vector style, high contrast, professional brand identity",
  },
  {
    id: "logo-2",
    title: "Playful mascot logo",
    category: "Logos",
    text: "Friendly mascot logo of [animal] for [brand], rounded thick outlines, two-colour palette, flat vector, centred composition on white background",
  },
  {
    id: "anime-1",
    title: "Anime key visual",
    category: "Anime",
    text: "Anime key visual of [character], cel shaded, crisp line art, expressive eyes, dynamic wind-blown hair, sunset city background, vibrant colours, studio quality",
  },
  {
    id: "anime-2",
    title: "Slice-of-life anime scene",
    category: "Anime",
    text: "Slice-of-life anime scene of [scene], soft pastel palette, detailed background painting, warm afternoon light, nostalgic mood, Makoto Shinkai inspired skies",
  },
  {
    id: "fan-1",
    title: "Grand fantasy landscape",
    category: "Fantasy Art",
    text: "Epic fantasy landscape of [place], floating islands, glowing crystals, misty valleys, painterly digital art, dramatic scale with a tiny traveller for reference, golden hour",
  },
  {
    id: "fan-2",
    title: "Heroic character concept",
    category: "Fantasy Art",
    text: "Fantasy character concept art of [character], intricate armour, glowing runes, full body, neutral pose, concept sheet lighting, highly detailed digital painting",
  },
  {
    id: "cin-1",
    title: "Neon rain street",
    category: "Cinematic Scenes",
    text: "Cinematic still of [subject] on a rainy neon street at night, anamorphic lens flares, reflective wet asphalt, shallow depth of field, teal and magenta grade, 2.39:1",
  },
  {
    id: "cin-2",
    title: "Golden hour wide shot",
    category: "Cinematic Scenes",
    text: "Cinematic wide shot of [subject] crossing an open field at golden hour, long shadows, hazy backlight, 35mm film look, subtle grain, natural colour grade",
  },
];