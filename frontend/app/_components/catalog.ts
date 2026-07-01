/* ============================================================================
   Product catalog — single source of truth.
   Shared by the landing page grid (app/page.tsx) and the cross-sell carousel
   (app/_components/CrossSellCarousel.tsx). Products are hardcoded for now.
   ============================================================================ */

export type Product = {
  id: string;
  slot: string;
  name: string;
  desc: string;
  price: number;
  mrp: number;
  stock: number;
  tag: string;
  ph: string;
  img?: string;
  href?: string;
};

export const HERO_IMG = "/product_image/necklace.jpeg";

export const CATALOG: Product[] = [
  { id: "om", slot: "p-om", name: "Om Pendant Chain", desc: "Oxidised silver ॐ on a box chain.", price: 2999, mrp: 3999, stock: 4, tag: "View in 3D ◈", ph: "Om pendant", img: HERO_IMG, href: "/product" },
  { id: "amethyst", slot: "p-amethyst", name: "Amethyst Cluster", desc: "Raw geode for calm & clarity.", price: 3999, mrp: 5499, stock: 2, tag: "Best seller", ph: "Amethyst cluster", img: "/product_image/amethyst-cluster.jpg" },
  { id: "sage", slot: "p-sage", name: "White Sage Bundle", desc: "Sustainably harvested smudge stick.", price: 1199, mrp: 1499, stock: 8, tag: "Restocked", ph: "Sage bundle", img: "/product_image/white-sage-bundle.webp" },
  { id: "candle", slot: "p-candle", name: "Moonlight Candle", desc: "Soy wax, sandalwood & myrrh.", price: 2499, mrp: 2999, stock: 5, tag: "New", ph: "Soy candle", img: "/product_image/moonlight-candle.webp" },
];

export const money = (n: number) => "₹" + n.toLocaleString("en-IN");
